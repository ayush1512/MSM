from flask import Blueprint, request, jsonify
from services.prescription_processor import PrescriptionProcessor  # Fix import path
import logging

prescription_bp = Blueprint('prescription', __name__)  # Remove url_prefix here
processor = PrescriptionProcessor()

@prescription_bp.route('/prescription/process', methods=['POST', 'OPTIONS'])  # Add OPTIONS and update path
def process_prescription():
    """Combined endpoint for upload and extraction"""
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
        
    if not request.files or 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    try:
        image_file = request.files['image']
        if not image_file.filename:
            return jsonify({"error": "Invalid file"}), 400
            
        # Process everything
        result = processor.process_prescription_image(image_file)
        
        if not result:
            return jsonify({"error": "Failed to process prescription"}), 500
            
        response = jsonify(result)
        return _corsify_actual_response(response)
        
    except Exception as e:
        logging.error(f"Process error: {str(e)}")
        return jsonify({
            "error": "Failed to process prescription",
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
