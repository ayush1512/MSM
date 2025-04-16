from flask import Blueprint, request, jsonify
from BillScanner.bill_processor import BillProcessor
from BillScanner.models import BillModel
from Medicine.enrichment_service import MedicineEnrichmentService

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
    enrichment_service = MedicineEnrichmentService(app.db)

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

@bill_scanner_bp.route('/save-products', methods=['POST'])
def save_products():
    """Save products extracted from a bill to medicine collection"""
    try:
        data = request.json
        if not data or 'products' not in data:
            return jsonify({"error": "No product data provided"}), 400
            
        products = data['products']
        
        # Check auto-enrich flag
        auto_enrich = data.get('auto_enrich', False)
        
        # Process each product - enrich data if needed
        enriched_products = []
        for product in products:
            product_name = product.get('product_name')
            
            if auto_enrich and product_name:
                # Try to find and enrich medicine data
                result = enrichment_service.find_or_enrich_medicine(
                    product_name,
                    user_verification=False
                )
                
                if result["status"] in ["found", "enriched"]:
                    # Merge the enriched data with the original product
                    enriched_data = result["medicine"]
                    # Keep original product fields that aren't in enriched data
                    for key, value in product.items():
                        if key not in enriched_data or not enriched_data[key]:
                            enriched_data[key] = value
                    
                    enriched_products.append(enriched_data)
                else:
                    # If enrichment failed, use the original product
                    enriched_products.append(product)
            else:
                # No enrichment requested, use original product
                enriched_products.append(product)
        
        # Insert into medicine collection
        result = bill_model.db.Medicine.insert_many(enriched_products)
        
        return jsonify({
            "success": True,
            "message": f"Added {len(result.inserted_ids)} products to stock",
            "product_ids": [str(id) for id in result.inserted_ids]
        })
        
    except Exception as e:
        return jsonify({"error": f"Failed to save products: {str(e)}"}), 500