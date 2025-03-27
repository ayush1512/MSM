from flask import Blueprint, request, jsonify
from services.prescription_processor import PrescriptionProcessor
from bson import ObjectId
import logging

prescription_bp = Blueprint('prescription', __name__)
processor = PrescriptionProcessor()

@prescription_bp.route('/prescription/process', methods=['POST', 'OPTIONS'])
def process_prescription():
    """Combined endpoint for upload and extraction"""
    try:
        if request.method == 'OPTIONS':
            return jsonify({"success": True}), 200
            
        if 'image' not in request.files:
            return jsonify({
                "success": False,
                "error": "No image file provided"
            }), 400

        image_file = request.files['image']
        if not image_file.filename:
            return jsonify({
                "success": False,
                "error": "Invalid file"
            }), 400
            
        # Process everything
        result = processor.process_prescription_image(image_file)
        
        if not result:
            return jsonify({
                "success": False,
                "error": "Failed to process prescription"
            }), 500
        
        return jsonify(result)
        
    except Exception as e:
        logging.error(f"Process error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Failed to process prescription",
            "details": str(e)
        }), 500

@prescription_bp.route('/prescription/<prescription_id>', methods=['PUT'])
def update_prescription(prescription_id):
    """Update prescription data"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided"
            }), 400

        # Convert string ID to ObjectId
        _id = ObjectId(prescription_id)
        
        # Update prescription in database
        result = processor.db_service.update_prescription(_id, data)
        
        if result:
            return jsonify({
                "success": True,
                "message": "Prescription updated successfully"
            })
        
        return jsonify({
            "success": False,
            "error": "Failed to update prescription"
        }), 404

    except Exception as e:
        logging.error(f"Update error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Failed to update prescription",
            "details": str(e)
        }), 500

def _build_cors_preflight_response():
    """Handle CORS preflight requests"""
    response = jsonify({})
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "*")
    response.headers.add("Access-Control-Allow-Methods", "*")
    return response

def _corsify_actual_response(response):
    """Add CORS headers to the actual response"""
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response
