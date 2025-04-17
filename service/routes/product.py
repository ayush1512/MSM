from flask import Blueprint, request, jsonify, render_template, current_app
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
        cropped_image_file = request.files['cropped_image']
        cropped_image_data = cropped_image_file.read()
        cropped_image_base64 = base64.b64encode(cropped_image_data).decode('utf-8')
        cropped_image_url = f"data:image/jpeg;base64,{cropped_image_base64}"

        together_api_key = current_app.config.get('TOGETHER_API_KEY')
        processor = ImageProcessor(together_api_key)
        extracted_info = processor.analyze_image_url(cropped_image_url)
        
        # Verify extracted_info contains valid data
        if not extracted_info or not any(extracted_info.values()):
            return jsonify({
                "warning": "Could not extract information from the image",
                "image_url": upload_result['secure_url'],
                "public_id": upload_result['public_id'],
                "extracted_info": None
            }), 200

        # Create stock entry
        stock = Stock(
            medicine_id=ObjectId(medicine_id),
            batch_no=extracted_info['BNo'][0] if extracted_info['BNo'] else None,
            mfg_date=extracted_info['MfgD'][0] if extracted_info['MfgD'] else None,
            exp_date=extracted_info['ExpD'][0] if extracted_info['ExpD'] else None,
            mrp=float(extracted_info['MRP'][0]) if extracted_info['MRP'] else None,
            image_url=upload_result['secure_url']
        )
        
        stock_result = stock_collection.insert_one(stock.to_dict())

        # Return response with all information
        response = {
            'image_url': upload_result['secure_url'],
            'public_id': upload_result['public_id'],
            'extracted_info': extracted_info,
            'stock_id': str(stock_result.inserted_id),
            'medicine_id': medicine_id
        }
        
        return jsonify(response), 201

    except Exception as e:
        logging.error(f"Error processing image: {str(e)}")
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
        # Get all stock entries with medicine details
        stocks = list(stock_collection.find())
        
        # Process the results for JSON serialization
        for stock in stocks:
            stock['_id'] = str(stock['_id'])
            
            # Check if medicine_id exists and convert it to string if it does
            if 'medicine_id' in stock and stock['medicine_id']:
                stock['medicine_id'] = str(stock['medicine_id'])
                
                # Try to fetch the associated medicine
                try:
                    medicine = medicine_collection.find_one({'_id': ObjectId(stock['medicine_id'])})
                    if medicine:
                        medicine['_id'] = str(medicine['_id'])
                        stock['medicine'] = medicine
                except Exception as e:
                    stock['medicine'] = None
            else:
                stock['medicine'] = None
                
        return jsonify(stocks), 200

    except Exception as e:
        logging.error(f"Error fetching stock data: {str(e)}")
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
