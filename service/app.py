#Prescription Librarys
from dotenv import load_dotenv
from routes import init_routes
from Prescription.services.db_service import DatabaseService
from flask_cors import CORS

# Product Librarys
from flask import Flask, request, jsonify, render_template
import cloudinary
import cloudinary.uploader
import cloudinary.api
import base64
import os
import imghdr
import re
import logging
import requests
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId
from Product.models import Medicine, Stock
from Product.image_processor import ImageProcessor


# Load environment variables
load_dotenv()

# Configure logging - Change from DEBUG to ERROR to only show errors
logging.basicConfig(level=logging.ERROR)

# Disable pymongo debug logs specifically
logging.getLogger("pymongo").setLevel(logging.WARNING)
logging.getLogger("pymongo.topology").setLevel(logging.ERROR)

app = Flask(__name__)

# Set SameSite=None, Secure=False for local development
app.config.update(
    SESSION_COOKIE_SAMESITE='Lax',  # Use 'Lax' for local development
    SESSION_COOKIE_SECURE=False,     # False for HTTP (development)
    SESSION_COOKIE_HTTPONLY=True,    # Prevents JavaScript access
    PERMANENT_SESSION_LIFETIME=86400  # Session lasts for 1 day (in seconds)
)

# Fix CORS configuration - ensure credentials are allowed
CORS(app, 
     resources={
        r"/*": {
            "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],  # Allow both localhost and 127.0.0.1
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "Accept"],
            "supports_credentials": True,
            "expose_headers": ["Content-Type", "X-CSRFToken"]
        }
     },
     supports_credentials=True  # Add this at top level too
)

# Set a secret key for session management
app.secret_key = os.getenv('SECRET_KEY', 'supersecretkey')

# Cloudinary configuration
cloudinary.config(
    cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key = os.getenv('CLOUDINARY_API_KEY'),
    api_secret = os.getenv('CLOUDINARY_API_SECRET')
)

# Get the API key from an environment variable
together_api_key = os.getenv('TOGETHER_API_KEY')

##################################Prescription Routes #####################################################################################################
# Initialize database
app.db = DatabaseService()

# Get collections from the database service
medicine_collection = app.db.medicine_collection
stock_collection = app.db.stock_collection

# Initialize routes
init_routes(app)

#################################Product Routes ############################################################################################################

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/medicine/search', methods=['GET'])
def search_medicine():
    try:
        search_term = request.args.get('term', '').strip()
        if not search_term:
            return jsonify([]), 200

        # Search in product_name and product_manufactured
        medicines = list(medicine_collection.find({
            '$or': [
                {'product_name': {'$regex': search_term, '$options': 'i'}},
                {'product_manufactured': {'$regex': search_term, '$options': 'i'}}
            ]
        }))

        # Convert ObjectId to string for JSON serialization
        for med in medicines:
            med['_id'] = str(med['_id'])

        return jsonify(medicines), 200

    except Exception as e:
        logging.error(f"Error searching medicines: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/medicine', methods=['GET', 'POST'])
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
                return jsonify({
                    'error': 'Product name and manufacturer are required'
                }), 400

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

@app.route('/process_image', methods=['POST'])
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
        
        # Upload the complete image to Cloudinary first
        upload_result = cloudinary.uploader.upload(
            image_file,
            folder="product_images",
            resource_type="auto"
        )
        
        logging.debug(f"Cloudinary upload result: {upload_result}")
        
        if not upload_result or 'public_id' not in upload_result or 'secure_url' not in upload_result:
            logging.error("Invalid Cloudinary upload response")
            return jsonify({"error": "Failed to upload image to cloud storage"}), 500

        # Process the cropped image with Together API
        cropped_image_file = request.files['cropped_image']
        cropped_image_data = cropped_image_file.read()
        cropped_image_base64 = base64.b64encode(cropped_image_data).decode('utf-8')
        cropped_image_url = f"data:image/jpeg;base64,{cropped_image_base64}"

        processor = ImageProcessor(together_api_key)
        extracted_info = processor.analyze_image_url(cropped_image_url)
        
        logging.debug(f"Extracted info from Together API: {extracted_info}")
        
        # Verify extracted_info contains valid data
        if not extracted_info or not any(extracted_info.values()):
            logging.error("No information extracted from the image")
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
        logging.error(f"Exception details:", exc_info=True)
            
        return jsonify({
            "error": "Failed to process image",
            "details": str(e)
        }), 500

@app.route('/update_stock', methods=['PUT'])
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
            result = stock_collection.update_one(
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)