from flask import Blueprint, request, jsonify
from BillScanner.bill_processor import BillProcessor
from BillScanner.models import BillModel
from Medicine.enrichment_service import MedicineEnrichmentService
from bson.objectid import ObjectId
from datetime import datetime
import logging
logger = logging.getLogger(__name__)

# Create Blueprint for bill scanner routes
bill_scanner_bp = Blueprint('bill_scanner', __name__)

# Initialize the bill processor
bill_processor = None
bill_model = None
enrichment_service = None

def init_bill_scanner(app):
    """Initialize bill scanner dependencies"""
    global bill_processor, bill_model, enrichment_service
    bill_processor = BillProcessor()
    bill_model = BillModel(app.db)
    
    # Initialize with debug mode from app configuration
    debug_mode = app.config.get('DEBUG', False)
    enrichment_service = MedicineEnrichmentService(app.db, debug=debug_mode)
    
    # Log the database structure for debugging
    try:
        logger.debug(f"Database collections available: {app.db.db.list_collection_names()}")
    except Exception as e:
        logger.warning(f"Could not list database collections: {e}")

@bill_scanner_bp.route('/upload', methods=['POST'])
def upload_bill():
    """Upload and process a bill image or PDF"""
    try:
        if 'bill' not in request.files:
            return jsonify({"error": "No file part"}), 400
        
        bill_file = request.files['bill']
        if bill_file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        
        # Process the bill file
        processed_results = bill_processor.process_bill_file(bill_file, bill_file.filename)
        
        # Save results to database
        saved_results = []
        for result in processed_results:
            bill_id = bill_model.create_bill(result)
            
            result_with_id = result.copy()
            result_with_id["bill_id"] = bill_id
            saved_results.append(result_with_id)
        
        return jsonify({
            "success": True,
            "results": saved_results
        })
    
    except ValueError as e:
        # Handle specific validation errors
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        # Handle other errors
        return jsonify({"error": f"Failed to process bill: {str(e)}"}), 500

@bill_scanner_bp.route('/bills', methods=['GET'])
def get_bills():
    """Get all bills with optional date filtering"""
    try:
        filter_date = request.args.get('date')
        bills = bill_model.get_bills(filter_date)
        
        return jsonify(bills)
    
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve bills: {str(e)}"}), 500

@bill_scanner_bp.route('/bills/<bill_id>', methods=['GET'])
def get_bill(bill_id):
    """Get a specific bill by ID"""
    try:
        bill = bill_model.get_bill_by_id(bill_id)
        if not bill:
            return jsonify({"error": "Bill not found"}), 404
        
        return jsonify(bill)
    
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve bill: {str(e)}"}), 500

@bill_scanner_bp.route('/save-products', methods=['POST', 'OPTIONS'])
def save_products():
    """Save products extracted from a bill to medicine and stock collections"""

    # Handle OPTIONS requests for CORS preflight
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')  # Specify exact origin
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')  # Add this line
        return response

    try:
        data = request.json
        if not data or 'products' not in data:
            return jsonify({"error": "No product data provided"}), 400
            
        products = data['products']

        # Now it's safe to log products info
        logger.info(f"Products data type: {type(products)}")
        logger.info(f"Number of products: {len(products)}")
        
        # Check auto-enrich flag
        auto_enrich = data.get('auto_enrich', False)
        
        # Keep track of warnings and results
        warnings = []
        processed_results = []
        
        # Add bill_id if it was provided or created
        bill_data = data.get('bill_data', {})
        bill_id_obj = None
        
        # Update bill details if bill_id is provided
        if bill_data.get('bill_id'):
            try:
                bill_id_obj = ObjectId(bill_data['bill_id'])
                # Use bills_collection instead of Bills
                bill_model.db.bills_collection.update_one(
                    {'_id': bill_id_obj},
                    {"$set": {"bill_details": bill_data.get('bill_details', {})}}
                )
            except Exception as e:
                logger.error(f"Invalid bill_id format or bills collection error: {e}")
                warnings.append(f"Could not update bill details: {str(e)}")
        
        # Process each product - enrich data if needed
        for index, product in enumerate(products):
            try:
                logger.info(f"Processing product {index + 1}/{len(products)}: {product.get('product_name', 'Unknown')}")
                product_name = product.get('product_name')
                
                if not product_name:
                    warnings.append(f"Skipped product at index {index} with no name")
                    continue
                    
                medicine_id = None
                medicine_data = None
                
                if auto_enrich:
                    # Try to find medicine in database or enrich from online sources
                    result = enrichment_service.find_or_enrich_medicine(
                        product_name,
                        user_verification=False
                    )
                    
                    # If exact match fails, try with a simplified product name
                    if result["status"] == "not_found" and data.get('use_fallback_search', False):
                        simplified_name = product_name.split(' ')
                        simplified_name = ' '.join(simplified_name[:min(3, len(simplified_name))])
                        
                        # Try again with simplified name
                        logger.info(f"Trying fallback search with simplified name: {simplified_name}")
                        result = enrichment_service.find_or_enrich_medicine(
                            simplified_name,
                            user_verification=False
                        )

                    if result["status"] in ["found", "enriched"]:
                        # We found or created the medicine
                        medicine_data = result["medicine"]
                        medicine_id = medicine_data.get("_id")
                    else:
                        warnings.append(f"Could not find detailed information for product: {product_name}")
                
                # If we couldn't find or enrich the medicine, we need to create a basic entry
                if not medicine_id:
                    # Create basic medicine entry with minimal information
                    basic_medicine = {
                        "product_name": product_name,
                        "product_manufactured": product.get('manufacturer', "Unknown"),
                        "salt_composition": "Not specified"
                    }
                    
                    # Use medicine_collection instead of Medicine
                    new_med_result = bill_model.db.medicine_collection.insert_one(basic_medicine)
                    medicine_id = str(new_med_result.inserted_id)
                    
                    warnings.append(f"Created basic medicine entry for {product_name}")

                # Now create a stock entry using the medicine_id
                # Extract stock-specific fields from the product
                mrp = 0
                try:
                    # Handle different price field names and potential conversion errors
                    if product.get('mrp'):
                        mrp = float(product.get('mrp'))
                    elif product.get('rate'):
                        mrp = float(product.get('rate'))
                except (ValueError, TypeError):
                    warnings.append(f"Invalid price for {product_name}, using 0")

                quantity = 0
                try:
                    if product.get('quantity'):
                        quantity = int(product.get('quantity'))
                except (ValueError, TypeError):
                    warnings.append(f"Invalid quantity for {product_name}, using 0")
                
                stock_entry = {
                    "medicine_id": ObjectId(medicine_id),
                    "bill_id": bill_id_obj,
                    "batch_no": product.get('batch_number', ''),
                    "mfg_date": product.get('mfg_date', ''),
                    "exp_date": product.get('exp_date', ''),
                    "mrp": mrp,
                    "quantity": quantity,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }

                # Use stock_collection instead of Stock for the check
                existing_stock = None
                if stock_entry['batch_no']:
                    existing_stock = bill_model.db.stock_collection.find_one({
                        'medicine_id': ObjectId(medicine_id),
                        'batch_no': stock_entry['batch_no']
                    })
                
                if existing_stock:
                    # Update the existing stock by adding to the quantity
                    bill_model.db.stock_collection.update_one(
                        {'_id': existing_stock['_id']},
                        {'$inc': {'quantity': stock_entry['quantity']},
                         '$set': {'updated_at': stock_entry['updated_at']}}
                    )
                    stock_id = str(existing_stock['_id'])
                    action = "updated"
                else:
                    # Insert new stock entry
                    stock_result = bill_model.db.stock_collection.insert_one(stock_entry)
                    stock_id = str(stock_result.inserted_id)
                    action = "created"
                
                # Add to processed results
                processed_results.append({
                    "product_name": product_name,
                    "medicine_id": medicine_id,
                    "stock_id": stock_id,
                    "action": action
                })
                logger.info(f"Successfully processed product: {product_name}")
                
            except Exception as e:
                warnings.append(f"Error processing product '{product.get('product_name', 'Unknown')}': {str(e)}")
                logger.error(f"Error processing product: {str(e)}")
                # Continue with the next product instead of failing the entire request
        
        # Prepare response data
        response_data = {
            "success": True,
            "message": f"Processed {len(processed_results)} products to stock",
            "results": processed_results
        }
        
        # Add warnings if any products couldn't be enriched
        if warnings:
            response_data["warnings"] = warnings
        
        response = jsonify(response_data)
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
        
    except Exception as e:
        logger.error(f"Failed to save products: {str(e)}", exc_info=True)
        error_response = jsonify({"error": f"Failed to save products: {str(e)}"}), 500
        error_response[0].headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        error_response[0].headers.add('Access-Control-Allow-Credentials', 'true')
        return error_response