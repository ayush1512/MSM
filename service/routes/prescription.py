from flask import Blueprint, request, jsonify, session
from Prescription.services.prescription_processor import PrescriptionProcessor
from bson import ObjectId
import logging
import json

prescription_bp = Blueprint('prescription', __name__)
processor = PrescriptionProcessor()

# Add this helper class for JSON serialization
class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if hasattr(obj, 'isoformat'):
            return obj.isoformat()
        return super(JSONEncoder, self).default(obj)

def json_serialize(data):
    """Serialize data that may contain ObjectId and datetime objects"""
    return json.loads(JSONEncoder().encode(data))

@prescription_bp.route('/prescription/process', methods=['POST', 'OPTIONS'])
def process_prescription():
    """Combined endpoint for upload and extraction"""
    
    if "user" not in session:
        return jsonify({"error": "Not logged in", "session_data": "Missing user key"}), 401

    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
        
    if not request.files or 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    try:
        image_file = request.files['image']
        if not image_file.filename:
            return jsonify({"error": "Invalid file"}), 400
            
        # Process everything
        result = processor.process_prescription_image(image_file,session)
        
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

@prescription_bp.route('/prescription/<prescription_id>', methods=['GET'])
def get_prescription(prescription_id):
    """Get prescription data by ID"""
    if "user" not in session:
        return jsonify({"error": "Not logged in", "session_data": "Missing user key"}), 401

    try:
        # Convert string ID to ObjectId
        _id = ObjectId(prescription_id)
        
        # Get prescription from database
        prescription_data = processor.db_service.get_prescription(_id)
        
        if not prescription_data:
            return jsonify({
                "success": False,
                "error": "Prescription not found"
            }), 404
        
        # Serialize data to handle ObjectId and datetime conversion
        prescription_data = json_serialize(prescription_data)
        
        return jsonify({
            "success": True,
            "data": prescription_data
        })
        
    except Exception as e:
        logging.error(f"Get prescription error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Failed to retrieve prescription",
            "details": str(e)
        }), 500

@prescription_bp.route('/prescription/<prescription_id>', methods=['PUT'])
def update_prescription(prescription_id):
    """Update prescription data"""
    if "user" not in session:
        return jsonify({"error": "Not logged in", "session_data": "Missing user key"}), 401

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
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")  # Update with specific origin
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.add("Access-Control-Allow-Credentials", "true")  # Allow credentials
    return response

def _corsify_actual_response(response):
    """Add CORS headers to the actual response"""
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")  # Update with specific origin
    response.headers.add("Access-Control-Allow-Credentials", "true")  # Allow credentials
    return response
