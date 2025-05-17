from flask import Blueprint, request, jsonify, render_template, current_app, session
import logging
from datetime import datetime
from bson import ObjectId
from Product.models import Medicine, Stock
from Product.image_processor import ImageProcessor
from Medicine.enrichment_service import MedicineEnrichmentService
import cloudinary.uploader
import base64

# Create product blueprint
product_bp = Blueprint('product', __name__)

# Database variables will be set up during initialization
medicine_collection = None
stock_collection = None
enrichment_service = None

# Helper function to recursively convert MongoDB objects to JSON serializable format
def convert_mongo_document(doc):
    if isinstance(doc, ObjectId):
        return str(doc)
    elif isinstance(doc, list):
        return [convert_mongo_document(item) for item in doc]
    elif isinstance(doc, dict):
        return {key: convert_mongo_document(value) for key, value in doc.items()}
    elif isinstance(doc, datetime):
        return doc.isoformat()
    else:
        return doc

def init_product_bp(app):
    """Initialize product blueprint with app's database"""
    global medicine_collection, stock_collection, enrichment_service
    
    # Set up collections from app's database
    medicine_collection = app.db.medicine_collection
    stock_collection = app.db.stock_collection
    
    # Initialize the enrichment service with debug mode based on environment
    debug_mode = app.config.get('DEBUG', False)
    enrichment_service = MedicineEnrichmentService(app.db, debug=debug_mode)
    
    # Register the blueprint with the app
    app.register_blueprint(product_bp)

@product_bp.route('/medicine/search', methods=['GET'])
def search_medicine():
    try:
        search_term = request.args.get('term', '').strip()
        if not search_term:
            return jsonify([]), 200

        # Check if auto-enrichment is requested
        auto_enrich = request.args.get('auto_enrich', 'false').lower() == 'true'

        # Add debug logging
        logging.debug(f"Searching for medicine: '{search_term}', auto_enrich={auto_enrich}")

        # First try normal database search
        medicines = list(medicine_collection.find({
            '$or': [
                {'product_name': {'$regex': search_term, '$options': 'i'}},
                {'product_manufactured': {'$regex': search_term, '$options': 'i'}}
            ]
        }))
        
        logging.debug(f"Database search found {len(medicines)} results")

        # Convert ObjectId to string for JSON serialization
        for med in medicines:
            med['_id'] = str(med['_id'])

        # If medicines found, return them
        if medicines:
            return jsonify(medicines), 200
            
        # If no medicines found and auto-enrich enabled, try to get from online sources
        if auto_enrich:
            logging.debug(f"Attempting to enrich medicine: {search_term}")
            enrichment_result = enrichment_service.find_or_enrich_medicine(
                search_term,
                user_verification=False  # Auto-save without verification
            )
            
            logging.debug(f"Enrichment result status: {enrichment_result['status']}")
            
            if enrichment_result["status"] in ["found", "enriched"]:
                return jsonify([enrichment_result["medicine"]]), 200

        # No results or enrichment disabled/failed
        return jsonify([]), 200

    except Exception as e:
        logging.error(f"Error searching medicines: {str(e)}")
        # Add more detailed error information
        logging.exception("Detailed exception information:")
        return jsonify({'error': str(e)}), 500

@product_bp.route('/medicine', methods=['GET', 'POST'])
def medicine():
    if request.method == 'GET':
        try:
            product_name = request.args.get('product_name')
            manufacturer = request.args.get('manufacturer')
            
            query = {}
            if product_name:
                query['product_name'] = {'$regex': product_name, '$options': 'i'}
            if manufacturer:
                query['product_manufactured'] = {'$regex': manufacturer, '$options': 'i'}
            
            medicines = list(medicine_collection.find(query))
            
            for med in medicines:
                med['_id'] = str(med['_id'])
            
            return jsonify(medicines), 200

        except Exception as e:
            logging.error(f"Error fetching medicines: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'POST':
        try:
            data = request.json
            product_name = data.get('product_name')
            manufacturer = data.get('manufacturer')
            salt_composition = data.get('composition')

            if not all([product_name, manufacturer]):
                return jsonify({'error': 'Product name and manufacturer are required'}), 400

            # Check if medicine exists
            existing_medicine = medicine_collection.find_one({
                'product_name': product_name,
                'product_manufactured': manufacturer
            })

            if existing_medicine:
                existing_medicine['_id'] = str(existing_medicine['_id'])
                return jsonify({
                    'medicine': existing_medicine,
                    'message': 'Medicine found'
                }), 200

            # Create new medicine
            new_medicine = Medicine(
                product_name=product_name,
                product_manufactured=manufacturer,
                salt_composition=salt_composition or 'Not specified'
            )
            result = medicine_collection.insert_one(new_medicine.to_dict())
            
            return jsonify({
                'medicine_id': str(result.inserted_id),
                'message': 'New medicine created'
            }), 201

        except Exception as e:
            logging.error(f"Error in medicine creation: {str(e)}")
            return jsonify({'error': str(e)}), 500

@product_bp.route('/process_image', methods=['POST'])
def process_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    try:
        # Get medicine_id from request
        medicine_id = request.form.get('medicine_id')
        if not medicine_id:
            return jsonify({"error": "Medicine ID is required"}), 400

        # Verify medicine exists
        medicine = medicine_collection.find_one({'_id': ObjectId(medicine_id)})
        if not medicine:
            return jsonify({"error": "Medicine not found"}), 404

        image_file = request.files['image']
        
        # Upload the complete image to Cloudinary
        upload_result = cloudinary.uploader.upload(
            image_file,
            folder="product_images",
            resource_type="auto"
        )
        
        if not upload_result or 'public_id' not in upload_result or 'secure_url' not in upload_result:
            return jsonify({"error": "Failed to upload image to cloud storage"}), 500

        # Process the cropped image with Together API
        extracted_info = None
        api_error = None
        
        try:
            # Check if cropped image was provided
            if 'cropped_image' in request.files:
                cropped_image_file = request.files['cropped_image']
                cropped_image_data = cropped_image_file.read()
                cropped_image_base64 = base64.b64encode(cropped_image_data).decode('utf-8')
                
                # Initialize image processor with API key
                together_api_key = current_app.config.get('TOGETHER_API_KEY')
                processor = ImageProcessor(together_api_key)
                
                # Process the base64 image directly
                extracted_info = processor.analyze_image_base64(cropped_image_base64)
            else:
                # Process the original image if no cropped version provided
                together_api_key = current_app.config.get('TOGETHER_API_KEY')
                processor = ImageProcessor(together_api_key)
                extracted_info = processor.analyze_image_url(upload_result['secure_url'])
            
        except Exception as api_ex:
            logging.error(f"Together API error: {str(api_ex)}")
            logging.exception("Detailed API exception:")
            api_error = str(api_ex)
            # Continue execution - we'll handle the missing extracted_info below

        # Prepare response
        response = {
            'image_url': upload_result['secure_url'],
            'public_id': upload_result['public_id'],
            'medicine_id': medicine_id
        }
        
        # Add extraction results or error information
        if extracted_info:
            response['extracted_info'] = extracted_info
        else:
            response['extraction_failed'] = True
            response['error_message'] = api_error or "Failed to extract information from image"
            response['manual_entry_required'] = True
        
        return jsonify(response), 200  # Return 200 even if extraction failed but stock was created

    except Exception as e:
        logging.error(f"Error processing image: {str(e)}")
        logging.exception("Full exception details:")
        return jsonify({"error": "Failed to process image", "details": str(e)}), 500

@product_bp.route('/update_stock', methods=['PUT'])
def update_stock():
    try:
        data = request.json
        required_fields = ['medicine_id', 'batch_no', 'mfg_date', 'exp_date', 'mrp', 'quantity', 'image_url']
        
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        # Check if stock with same batch number exists
        existing_stock = stock_collection.find_one({
            'medicine_id': ObjectId(data['medicine_id']),
            'batch_no': data['batch_no']
        })

        update_data = {
            'mfg_date': data['mfg_date'],
            'exp_date': data['exp_date'],
            'mrp': float(data['mrp']),
            'quantity': int(data['quantity']),
            'updated_at': datetime.utcnow()
        }

        if existing_stock:
            # Update existing stock
            stock_collection.update_one(
                {'_id': existing_stock['_id']},
                {'$set': update_data}
            )
            message = 'Stock information updated successfully'
            stock_id = str(existing_stock['_id'])
        else:
            # Create new stock entry
            stock = Stock(
                medicine_id=ObjectId(data['medicine_id']),
                batch_no=data['batch_no'],
                mfg_date=data['mfg_date'],
                exp_date=data['exp_date'],
                mrp=float(data['mrp']),
                quantity=int(data['quantity']),
                image_url=data['image_url']
            )
            result = stock_collection.insert_one(stock.to_dict())
            message = 'New stock entry created successfully'
            stock_id = str(result.inserted_id)
        
        return jsonify({
            'stock_id': stock_id,
            'message': message
        }), 201

    except Exception as e:
        logging.error(f"Error updating stock: {str(e)}")
        return jsonify({'error': str(e)}), 500

@product_bp.route('/stock', methods=['GET'])
def get_stock():
    try:
        # Check if search term is provided (for AddMedicinePage search)
        search_term = request.args.get('term', '').strip()
        is_search = bool(search_term)
        
        if is_search:
            # For search, we need to log and debug the query
            logging.info(f"Searching stock with term: '{search_term}'")
            
            # First try to find medicines matching the search term
            matching_medicines = list(medicine_collection.find({
                '$or': [
                    {'product_name': {'$regex': search_term, '$options': 'i'}},
                    {'product_manufactured': {'$regex': search_term, '$options': 'i'}}
                ]
            }))
            
            # Convert all ObjectId to string for JSON serialization
            matching_medicines = convert_mongo_document(matching_medicines)
            
            # Get the IDs of matching medicines - now with string IDs
            matching_medicine_ids = [ObjectId(med['_id']) for med in matching_medicines]
            logging.info(f"Found {len(matching_medicine_ids)} matching medicines")
            
            # If we found matching medicines, find all stocks for those medicines
            result_stocks = []
            if matching_medicine_ids:
                stocks = list(stock_collection.find({'medicine_id': {'$in': matching_medicine_ids}}))
                
                # Process each stock and add necessary medicine information
                for stock in stocks:
                    # Convert ObjectId to string for safe comparison
                    stock_id = str(stock['_id'])
                    medicine_id = str(stock['medicine_id'])
                    
                    medicine = next((m for m in matching_medicines if m['_id'] == medicine_id), None)
                    if medicine:
                        stock_data = {
                            'id': stock_id,
                            'name': medicine['product_name'],
                            'manufacturer': medicine.get('product_manufactured', 'Unknown'),
                            'batch': stock.get('batch_no', 'N/A'),
                            'price': stock.get('mrp', 0),
                            'expiry': stock.get('exp_date', ''),
                            'stock': stock.get('quantity', 0)
                        }
                        result_stocks.append(stock_data)
            
            logging.info(f"Returning {len(result_stocks)} stock items")
            return jsonify(result_stocks), 200
        else:
            # Standard stock listing mode
            # Fetch all stocks
            stocks = list(stock_collection.find())
            
            # Prepare the result in the same format as the search mode
            result_stocks = []
            
            for stock in stocks:
                try:
                    # Convert ObjectIds to strings
                    stock_id = str(stock['_id'])
                    medicine_id = str(stock['medicine_id']) if 'medicine_id' in stock else None
                    
                    if medicine_id:
                        # Fetch the associated medicine
                        medicine = medicine_collection.find_one({'_id': ObjectId(medicine_id)})
                        if medicine:
                            # Build the stock item in the same format as search mode
                            stock_data = {
                                'id': stock_id,
                                'name': medicine.get('product_name', 'Unknown Product'),
                                'manufacturer': medicine.get('product_manufactured', 'Unknown'),
                                'category': medicine.get('sub_category', 'Uncategorized'),
                                'batch': stock.get('batch_no', 'N/A'),
                                'price': float(stock.get('mrp', 0)),
                                'expiry': stock.get('exp_date', ''),
                                'stock': int(stock.get('quantity', 0))
                            }
                            result_stocks.append(stock_data)
                        else:
                            # Medicine not found but we still want to show the stock
                            stock_data = {
                                'id': stock_id,
                                'name': f"Unknown (ID: {medicine_id})",
                                'manufacturer': 'Unknown',
                                'category': 'Uncategorized',
                                'batch': stock.get('batch_no', 'N/A'),
                                'price': float(stock.get('mrp', 0)),
                                'expiry': stock.get('exp_date', ''),
                                'stock': int(stock.get('quantity', 0))
                            }
                            result_stocks.append(stock_data)
                except Exception as e:
                    logging.error(f"Error processing stock item: {str(e)}")
                    # Continue to next stock item
            
            logging.info(f"Returning {len(result_stocks)} stock items from standard listing")
            return jsonify(result_stocks), 200

    except Exception as e:
        logging.error(f"Error fetching stock data: {str(e)}")
        logging.exception("Full exception details:")
        return jsonify({'error': str(e)}), 500

@product_bp.route('/stock/<stock_id>', methods=['DELETE'])
def delete_stock(stock_id):
    try:
        result = stock_collection.delete_one({'_id': ObjectId(stock_id)})
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Stock not found'}), 404
            
        return jsonify({'message': 'Stock deleted successfully'}), 200

    except Exception as e:
        logging.error(f"Error deleting stock: {str(e)}")
        return jsonify({'error': str(e)}), 500

@product_bp.route('/stock_page')
def stock_page():
    return render_template('stock.html')

@product_bp.route('/medicine/enrich', methods=['POST'])
def enrich_medicine():
    """Manually enrich medicine information from online sources"""
    try:
        data = request.json
        medicine_name = data.get('medicine_name')
        
        if not medicine_name:
            return jsonify({'error': 'Medicine name is required'}), 400
            
        # Optional manufacturer filter
        manufacturer = data.get('manufacturer')
        
        # Whether user verification is required
        user_verification = data.get('user_verification', False)
        
        # Find or enrich the medicine
        result = enrichment_service.find_or_enrich_medicine(
            medicine_name, 
            manufacturer=manufacturer,
            user_verification=user_verification
        )
        
        return jsonify(result), 200
    except Exception as e:
        logging.error(f"Error in medicine enrichment: {str(e)}")
        return jsonify({'error': str(e)}), 500

@product_bp.route('/medicine/verify', methods=['POST'])
def verify_medicine():
    """Verify and save medicine data after user review"""
    try:
        data = request.json
        medicine_data = data.get('medicine_data')
        user_corrections = data.get('corrections', {})
        
        if not medicine_data:
            return jsonify({'error': 'Medicine data is required'}), 400
            
        # Verify and save with user corrections
        result = enrichment_service.verify_and_save_medicine(
            medicine_data,
            user_corrections=user_corrections
        )
        
        return jsonify(result), 200
    except Exception as e:
        logging.error(f"Error verifying medicine: {str(e)}")
        return jsonify({'error': str(e)}), 500

@product_bp.route('/save_product', methods=['POST'])
def save_product():
    try:
        data = request.json
        
        # Check required fields
        required_fields = ['productId', 'batchNumber', 'mfgDate', 'expiryDate', 'price']
        missing_fields = [field for field in required_fields if field not in data or not data[field]]
        
        if missing_fields:
            return jsonify({
                'error': f"Missing required fields: {', '.join(missing_fields)}"
            }), 400
            
        # Prepare stock data with optional fields
        stock_data = {
            'medicine_id': ObjectId(data['productId']),
            'batch_no': data['batchNumber'],
            'mfg_date': data['mfgDate'],
            'exp_date': data['expiryDate'],
            'mrp': float(data['price']),
            'quantity': int(data.get('quantity', 0)),
            'image_url': data.get('imageUrl'),
            'shop_owner': session['user']
        }
        
        # Check if medicine exists
        medicine = medicine_collection.find_one({'_id': ObjectId(data['productId'])})
        if not medicine:
            return jsonify({'error': 'Medicine not found'}), 404
            
        # Check if stock with same batch number exists
        existing_stock = stock_collection.find_one({
            'medicine_id': ObjectId(data['productId']),
            'batch_no': data['batchNumber']
        })
        
        if existing_stock:
            return jsonify({
                'error': 'Stock with this batch number already exists',
                'stock_id': str(existing_stock['_id'])
            }), 409  # Conflict
        
        # Create and save new stock
        stock = Stock(**stock_data)
        stock_dict = stock.to_dict()
        result = stock_collection.insert_one(stock_dict)
        
        return jsonify({
            'message': 'Product saved to stock successfully',
            'stock_id': str(result.inserted_id)
        }), 201

    except Exception as e:
        logging.error(f"Error saving product to stock: {str(e)}")
        logging.exception("Full exception details:")
        return jsonify({'error': str(e)}), 500
