from flask import Flask, request, jsonify, render_template
from together import Together
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
from models import Medicine, Stock

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)

# Cloudinary configuration
cloudinary.config(
    cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key = os.getenv('CLOUDINARY_API_KEY'),
    api_secret = os.getenv('CLOUDINARY_API_SECRET')
)

# Get the API key from an environment variable
together_api_key = os.getenv('TOGETHER_API_KEY')

# MongoDB configuration
mongo_uri = os.getenv('MONGODB_URI')
client = MongoClient(mongo_uri)
db = client.MSM
medicine_collection = db.Medicine
stock_collection = db.Stock

class ImageProcessor:
    def __init__(self, api_key):
        if not api_key:
            raise ValueError("Together API key is required")
        self.client = Together(api_key=api_key)
        self.prompt = "Extract text from the image and provide the following details: Batch No., Mfg. Date, Exp. Date, MRP. Make sure the dates are converted into numerical MM/YYYY format strictly. For Example: Batch No: 1234, Mfg Date: 12/2021, Exp Date: 12/2023, MRP: 100.00"
        self.model = "meta-llama/Llama-Vision-Free"

    def get_mime_type_from_url(self, url):
        """Determine MIME type from URL or response headers"""
        try:
            response = requests.head(url)
            content_type = response.headers.get('content-type', '')
            if content_type.startswith('image/'):
                return content_type
        except:
            pass
        
        # Fallback to extension-based detection
        extension = os.path.splitext(url)[1].lower()
        mime_types = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        }
        return mime_types.get(extension, 'image/jpeg')

    def extract_useful_info(self, text):
        """Extract information from formatted text"""
        logging.debug(f"Extracting useful info from text: {text}")
        info = {
            'BNo': None,
            'MfgD': None,
            'ExpD': None,
            'MRP': None
        }
        
        patterns = {
            'BNo': [
            r'B\.? ?NO\.?/? ?([A-Za-z0-9]+)',
            r'^(?:\* \*\*)\Batch ?No\.?/? ?([A-Za-z0-9]+)',
            r'^(?:\*\*)\Batch ?No\.?/? ?([A-Za-z0-9]+)',
            r'Batch ?No\.?/? ?([A-Za-z0-9]+)',
            r'Batch ?no\.?/? ?([A-Za-z0-9]+)',
            r'Batch ?number:? ?([A-Za-z0-9]+)',
            r'\*\s*Batch\s*No\.?:\s*([A-Za-z0-9]+)',
            r'BATCH ?NO\.?/? ?([A-Za-z0-9]+)',
            r'BNO\.?/? ?([A-Za-z0-9]+)',
            r'B\.?NO\.?/? ?([A-Za-z0-9]+)',
            r'Batch ?No\.?:? ?([A-Za-z0-9]+)'
            ],
            'MfgD': [
            r'(?:MFD|Mfg\.? Date|M\.? Date):? ?(\d{2}/\d{4})',
            r'\*\s*Mfg\.?\s*Date:\s*(\d{2}/\d{4})',
            r'MFG\.? ?DATE:? ?(\d{2}/\d{4})',
            r'MANUFACTURING ?DATE:? ?(\d{2}/\d{4})',
            r'(?:MFD|Mfg\.? Date|M\.? Date):? ?(\d{2}/\d{2})',
            r'\*\s*Mfg\.?\s*Date:\s*(\d{2}/\d{2})',
            r'MFG\.? ?DATE:? ?(\d{2}/\d{2})',
            r'MANUFACTURING ?DATE:? ?(\d{2}/\d{2})'
            ],
            'ExpD': [
            r'(?:EXP|Exp\.? Date|Expiry Date|Expiration Date):? ?(\d{2}/\d{4})',
            r'\*\s*Expiry\s*Date:\s*(\d{2}/\d{4})',
            r'EXPIRY ?DATE:? ?(\d{2}/\d{4})',
            r'EXP\.? ?DATE:? ?(\d{2}/\d{4})',
            r'(?:EXP|Exp\.? Date|Expiry Date|Expiration Date):? ?(\d{2}/\d{2})',
            r'\*\s*Expiry\s*Date:\s*(\d{2}/\d{2})',
            r'EXPIRY ?DATE:? ?(\d{2}/\d{2})',
            r'EXP\.? ?DATE:? ?(\d{2}/\d{2})'
            ],
            'MRP': [
            r'(?:Price|Mrp|MRP|Rs\.?|₹):? ?(\d+\.\d{2})',
            r'PRICE:? ?(\d+\.\d{2})',
            r'MAXIMUM ?RETAIL ?PRICE:? ?(\d+\.\d{2})',
            r'Rs\.? ?(\d+\.\d{2})',
            r'₹ ?(\d+\.\d{2})'
            ]
        }
        
        for key, pattern_list in patterns.items():
            if isinstance(pattern_list, str):
                pattern_list = [pattern_list]
            for pattern in pattern_list:
                match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
                if match:
                    info[key] = match.group(1).strip()
                    logging.debug(f"Found {key}: {info[key]}")
                    break

        ordered_info = {key: info[key] for key in ['BNo', 'MfgD', 'ExpD', 'MRP']}
        return ordered_info

    def analyze_image_url(self, image_url, num_requests=3):
        """Analyze the image from URL multiple times and aggregate results."""
        try:
            mime_type = self.get_mime_type_from_url(image_url)
            aggregated_info = {'BNo': set(), 'MfgD': set(), 'ExpD': set(), 'MRP': set()}
            successful_requests = 0

            for attempt in range(num_requests):
                try:
                    logging.debug(f"Making Together API request attempt {attempt + 1}")
                    
                    stream = self.client.chat.completions.create(
                        model=self.model,
                        messages=[
                            {
                                "role": "user",
                                "content": [
                                    {"type": "text", "text": self.prompt},
                                    {"type": "image_url", "image_url": {"url": image_url}}
                                ],
                            }
                        ],
                        stream=True,
                    )

                    response_text = ""
                    for chunk in stream:
                        if hasattr(chunk, 'choices') and chunk.choices:
                            content = chunk.choices[0].delta.content if hasattr(chunk.choices[0].delta, 'content') else None
                            if content:
                                response_text += content

                    logging.debug(f"API response text: {response_text}")
                    
                    if response_text:
                        extracted_info = self.extract_useful_info(response_text)
                        for key in aggregated_info:
                            if extracted_info[key]:
                                aggregated_info[key].add(extracted_info[key])
                        successful_requests += 1
                    else:
                        logging.warning(f"Empty response from Together API on attempt {attempt + 1}")

                except Exception as e:
                    logging.error(f"Error in API request attempt {attempt + 1}: {str(e)}")
                    continue

            if successful_requests == 0:
                logging.error("All API requests failed")
                raise Exception("Failed to get valid response from Together API")

            final_info = {key: list(values) if values else None for key, values in aggregated_info.items()}
            
            logging.debug(f"Final extracted information: {final_info}")
            return final_info

        except Exception as e:
            logging.error(f"Error in analyze_image_url: {str(e)}")
            raise

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

            if not all([product_name, manufacturer, salt_composition]):
                return jsonify({
                    'error': 'Product name, manufacturer and composition are required'
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
                salt_composition=salt_composition
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

@app.route('/update_stock', methods=['POST'])
def update_stock():
    try:
        data = request.json
        required_fields = ['medicine_id', 'batch_no', 'mfg_date', 'exp_date', 'mrp', 'image_url']
        
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        # Create new stock entry with updated information
        stock = Stock(
            medicine_id=ObjectId(data['medicine_id']),
            batch_no=data['batch_no'],
            mfg_date=data['mfg_date'],
            exp_date=data['exp_date'],
            mrp=float(data['mrp']),
            image_url=data['image_url']
        )
        
        result = stock_collection.insert_one(stock.to_dict())
        
        return jsonify({
            'stock_id': str(result.inserted_id),
            'message': 'Stock information updated successfully'
        }), 201

    except Exception as e:
        logging.error(f"Error updating stock: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)