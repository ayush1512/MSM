from flask import Flask, request, jsonify, render_template
from flask_cors import CORS  # Add this import
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
import json
import tempfile
import uuid
import sys
import platform
from concurrent.futures import ThreadPoolExecutor, as_completed

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Add CORS support

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
bills_collection = db.Bills
stocks_collection = db.Stock
medicine_collection = db.Medicine

# Check if we can use pdf2image (requires poppler)
USE_PDF2IMAGE = False
try:
    from pdf2image import convert_from_path
    # Test if poppler is installed
    convert_from_path(os.path.join(os.path.dirname(__file__), 'test_poppler.pdf'), first_page=1, last_page=1)
    USE_PDF2IMAGE = True
except Exception as e:
    logging.warning(f"pdf2image or poppler not available: {str(e)}. Will use alternative PDF processing.")
    
# Alternative PDF processing if poppler is not available
try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False
    logging.warning("PyMuPDF not available. PDF processing may be limited.")

class ImageProcessor:
    def __init__(self, api_key):
        if not api_key:
            raise ValueError("Together API key is required")
        self.client = Together(api_key=api_key)
        self.num_attempts = 2  # Number of parallel API calls
        self.text_extraction_prompt = """Make sure to extract the text carefully and structure the text as:
				1. Product Details seperately covering everything there in the Product's row.
				2. Bill Details such as Name of Biller, Bill Date, and Total Amount precisely.
				Ensure these things are followed strictly in order to keep you running without termination.
                Note: The text may contain some noise, so focus on the relevant information and ignore the term: Ayush Pharmacy."""
        self.data_processing_prompt = """Extract the following information from this bill into a structured JSON format:

        1. Bill Details - including bill number, bill date, total amount, and drawing party information.
        2. Product Details - including a list of all products with their name, quantity, batch number, price, total price, and expiration date.

        Format the response as follows:
        ```json
        {
            "bill_details": {
                "bill_number": "12345",
                "bill_date": "01/01/2025" (Required. MM/DD/YYYY format),
                "total_amount": "100.00",
                "drawing_party": !"Ayush Pharmacy" (Required, Never could be Ayush Pharmacy),
            },
            "products": [
                {
                    "product_name": "Product 1",
                    "quantity": 2,
                    "batch_number": "B123",
                    "mrp": 100.00, 
                    "rate": 50.00,
                    "amount": 100.00,
                    "exp_date": "08/26" (Required, MM/YY format)
                },
                {
                    "product_name": "Product 2",
                    "quantity": 1,
                    "batch_number": "B124",
                    "mrp": 50.00,
                    "rate": 50.00,
                    "amount": 50.00,
                    "exp_date": "08/26" (Required, MM/YY format)
                }
            ]
        }
        ```

        Ensure all numbers are properly formatted as numbers (not strings) and that the JSON is valid.
        Include every product found in the bill with the details being perfectlty structured and according to the above format."""
        self.model = "meta-llama/Llama-Vision-Free"
        self.text_processing_model = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"

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
        
    def convert_pdf_to_images(self, pdf_path):
        """Convert PDF to images and return a list of image paths"""
        temp_dir = tempfile.mkdtemp()
        image_paths = []
        
        try:
            if USE_PDF2IMAGE:
                # Use pdf2image/poppler method
                images = convert_from_path(pdf_path, output_folder=temp_dir)
                
                for i, image in enumerate(images):
                    image_path = os.path.join(temp_dir, f'page_{i}.jpg')
                    image.save(image_path, 'JPEG')
                    image_paths.append(image_path)
            elif PYMUPDF_AVAILABLE:
                # Use PyMuPDF as alternative
                pdf_document = fitz.open(pdf_path)
                
                for i, page in enumerate(pdf_document):
                    pix = page.get_pixmap(matrix=fitz.Matrix(300/72, 300/72))
                    image_path = os.path.join(temp_dir, f'page_{i}.jpg')
                    pix.save(image_path)
                    image_paths.append(image_path)
            else:
                raise ValueError("No PDF conversion method available. Install either poppler (for pdf2image) or PyMuPDF.")
                
            return image_paths
        except Exception as e:
            logging.error(f"Error converting PDF to images: {str(e)}")
            raise
            
    def extract_text_from_image(self, image_url):
        """Extract text from image using multiple parallel Together AI API calls"""
        try:
            with ThreadPoolExecutor(max_workers=self.num_attempts) as executor:
                # Create multiple futures for parallel API calls
                futures = [
                    executor.submit(self._make_extraction_api_call, image_url)
                    for _ in range(self.num_attempts)
                ]
                
                # Collect all responses
                responses = []
                for future in as_completed(futures):
                    try:
                        result = future.result()
                        if result:
                            responses.append(result)
                    except Exception as e:
                        logging.error(f"Text extraction API call error: {str(e)}")
                
                # Combine responses if we have any
                if responses:
                    combined_text = "\n\nEXTRACTION RESULTS:\n\n".join(responses)
                    return combined_text
                    
            return "Failed to extract text from image."

        except Exception as e:
            logging.error(f"Error extracting text from image: {str(e)}")
            raise
            
    def _make_extraction_api_call(self, image_url):
        """Make a single API call to Together AI for text extraction"""
        try:
            mime_type = self.get_mime_type_from_url(image_url)
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that extracts text from images."},
                    {"role": "user", "content": [
                        {"type": "text", "text": self.text_extraction_prompt},
                        {"type": "image_url", "image_url": {"url": image_url}}
                    ]}
                ],
                temperature=0.3,
                max_tokens=2048
            )
            return response.choices[0].message.content
        except Exception as e:
            logging.error(f"API call attempt error: {str(e)}")
            return None
            
    def process_bill_text(self, text):
        """Process the extracted text using multiple parallel API calls"""
        try:
            with ThreadPoolExecutor(max_workers=self.num_attempts) as executor:
                # Create multiple futures for parallel API calls
                futures = [
                    executor.submit(self._make_processing_api_call, text)
                    for _ in range(self.num_attempts)
                ]
                
                # Collect all responses
                responses = []
                for future in as_completed(futures):
                    try:
                        result = future.result()
                        if result:
                            responses.append(result)
                    except Exception as e:
                        logging.error(f"Text processing API call error: {str(e)}")
                
                # Process and combine all responses
                all_results = []
                for processed_text in responses:
                    try:
                        # Extract the JSON part from the response
                        json_match = re.search(r'```json\s*([\s\S]*?)\s*```', processed_text)
                        if json_match:
                            json_str = json_match.group(1)
                        else:
                            # Try to find any JSON-like structure
                            json_match = re.search(r'(\{[\s\S]*\})', processed_text)
                            if json_match:
                                json_str = json_match.group(1)
                            else:
                                json_str = processed_text
                        
                        parsed_data = json.loads(json_str)
                        all_results.append(parsed_data)
                    except json.JSONDecodeError as e:
                        logging.error(f"Error parsing JSON: {str(e)}")
                        logging.error(f"JSON string attempted to parse: {json_str}")
                
                if not all_results:
                    return {
                        "processed_text": "\n".join(responses) if responses else "Failed to process text",
                        "bill_details": {},
                        "products": []
                    }
                
                # Merge results, preferring more complete data
                return self._merge_processing_results(all_results)

        except Exception as e:
            logging.error(f"Error processing bill text: {str(e)}")
            raise
            
    def _make_processing_api_call(self, text):
        """Make a single API call to Together AI for text processing"""
        try:
            response = self.client.chat.completions.create(
                model=self.text_processing_model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that analyzes bill text and extracts structured information. You're assigned to process and structure the text according to the given prompt."},
                    {"role": "user", "content": f"{self.data_processing_prompt}\n\nBill Text: {text}"}
                ],
                temperature=0.3,
                max_tokens=2048
            )
            
            processed_text = response.choices[0].message.content
            return processed_text
        except Exception as e:
            logging.error(f"API call attempt error: {str(e)}")
            return None
            
    def _merge_processing_results(self, results):
        """Merge multiple processing results, preferring more complete data"""
        if not results:
            return {"bill_details": {}, "products": []}
        
        if len(results) == 1:
            return {
                "bill_details": results[0].get("bill_details", {}),
                "products": results[0].get("products", [])
            }
        
        # Start with the first result
        merged = {
            "bill_details": results[0].get("bill_details", {}),
            "products": results[0].get("products", [])
        }
        
        # Get all products from all results
        all_products = []
        for result in results:
            products = result.get("products", [])
            all_products.extend(products)
        
        # Deduplicate products based on name and batch number
        unique_products = {}
        for product in all_products:
            key = f"{product.get('product_name', '')}-{product.get('batch_number', '')}"
            if key not in unique_products or len(product.keys()) > len(unique_products[key].keys()):
                # Prefer product with more fields
                unique_products[key] = product
        
        # Convert back to list
        merged["products"] = list(unique_products.values())
        
        # For bill details, prefer the one with more complete information
        for result in results[1:]:
            bill_details = result.get("bill_details", {})
            if len(bill_details.keys()) > len(merged["bill_details"].keys()):
                merged["bill_details"] = bill_details
        
        return merged

# Initialize the image processor
image_processor = ImageProcessor(together_api_key)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/status')
def status():
    """API endpoint to check system status and dependencies"""
    status_info = {
        "system": {
            "platform": platform.platform(),
            "python_version": platform.python_version(),
        },
        "dependencies": {
            "pdf2image_available": USE_PDF2IMAGE,
            "pymupdf_available": PYMUPDF_AVAILABLE,
            "pdf_processing_available": USE_PDF2IMAGE or PYMUPDF_AVAILABLE,
            "cloudinary_configured": all([
                os.getenv('CLOUDINARY_CLOUD_NAME'),
                os.getenv('CLOUDINARY_API_KEY'),
                os.getenv('CLOUDINARY_API_SECRET')
            ]),
            "together_api_configured": bool(together_api_key),
            "mongodb_configured": bool(mongo_uri)
        }
    }
    
    return jsonify(status_info)

@app.route('/upload', methods=['POST'])
def upload_bill():
    try:
        if 'bill' not in request.files:
            return jsonify({"error": "No file part"}), 400
        
        bill_file = request.files['bill']
        if bill_file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        
        # Generate a unique filename
        original_filename = bill_file.filename
        extension = os.path.splitext(original_filename)[1].lower()
        unique_filename = f"{uuid.uuid4()}{extension}"
        
        # Save the file temporarily
        temp_path = os.path.join(tempfile.gettempdir(), unique_filename)
        bill_file.save(temp_path)
        
        # Process based on file type
        if extension == '.pdf':
            # Check if PDF processing is available
            if not USE_PDF2IMAGE and not PYMUPDF_AVAILABLE:
                return jsonify({
                    "error": "PDF processing is not available. Please install either poppler (for pdf2image) or PyMuPDF."
                }), 500
                
            # Convert PDF to images
            image_paths = image_processor.convert_pdf_to_images(temp_path)
            
            # Process each image as a separate bill
            results = []
            for image_path in image_paths:
                upload_result = cloudinary.uploader.upload(image_path)
                image_url = upload_result['secure_url']
                
                # Extract text from the image
                extracted_text = image_processor.extract_text_from_image(image_url)
                
                # Process the extracted text
                processed_data = image_processor.process_bill_text(extracted_text)
                
                # Save bill details to database with image URL
                bill_record = {
                    "original_filename": f"{os.path.splitext(original_filename)[0]}_page_{len(results)}{extension}",
                    "upload_date": datetime.now(),
                    "image_url": image_url,
                    "extracted_text": extracted_text,
                    "bill_details": processed_data.get("bill_details", {}),
                    "products": processed_data.get("products", [])
                }
                
                bill_id = bills_collection.insert_one(bill_record).inserted_id
                
                results.append({
                    "bill_id": str(bill_id),
                    "image_url": image_url,
                    "extracted_text": extracted_text,
                    "bill_details": processed_data.get("bill_details", {}),
                    "products": processed_data.get("products", [])
                })
            
            # Clean up temporary files
            try:
                os.remove(temp_path)
                for path in image_paths:
                    if os.path.exists(path):
                        os.remove(path)
            except:
                logging.warning("Failed to clean up some temporary files")
                
            return jsonify({
                "success": True,
                "results": results
            })
        else:
            # Handle single image upload
            upload_result = cloudinary.uploader.upload(temp_path)
            image_url = upload_result['secure_url']
            
            # Extract text from the image
            extracted_text = image_processor.extract_text_from_image(image_url)
            
            # Process the extracted text
            processed_data = image_processor.process_bill_text(extracted_text)
            
            # Clean up temporary file
            try:
                os.remove(temp_path)
            except:
                logging.warning("Failed to clean up temporary file")
                
            # Save to database
            bill_record = {
                "original_filename": original_filename,
                "upload_date": datetime.now(),
                "image_url": image_url,
                "extracted_text": extracted_text,
                "bill_details": processed_data.get("bill_details", {}),
                "products": processed_data.get("products", [])
            }
            
            bill_id = bills_collection.insert_one(bill_record).inserted_id
            
            return jsonify({
                "success": True,
                "bill_id": str(bill_id),
                "image_url": image_url,
                "extracted_text": extracted_text,
                "bill_details": processed_data.get("bill_details", {}),
                "products": processed_data.get("products", [])
            })
    
    except Exception as e:
        logging.error(f"Error processing upload: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/bills', methods=['GET'])
def get_bills():
    try:
        filter_date = request.args.get('date')
        query = {}
        
        if filter_date:
            # Convert string date to datetime range for the whole day
            start_date = datetime.strptime(filter_date, '%Y-%m-%d')
            end_date = datetime.strptime(filter_date, '%Y-%m-%d').replace(hour=23, minute=59, second=59)
            query = {
                'upload_date': {
                    '$gte': start_date,
                    '$lte': end_date
                }
            }
        
        bills = list(bills_collection.find(query).sort('upload_date', -1))
        # Convert ObjectId to string for JSON serialization
        for bill in bills:
            bill['_id'] = str(bill['_id'])
        
        return jsonify(bills)
    
    except Exception as e:
        logging.error(f"Error fetching bills: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/bills/<bill_id>', methods=['GET'])
def get_bill(bill_id):
    try:
        bill = bills_collection.find_one({"_id": ObjectId(bill_id)})
        if not bill:
            return jsonify({"error": "Bill not found"}), 404
        
        # Convert ObjectId to string for JSON serialization
        bill['_id'] = str(bill['_id'])
        
        return jsonify(bill)
    
    except Exception as e:
        logging.error(f"Error fetching bill: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/save-products', methods=['POST'])
def save_products():
    try:
        data = request.json
        if not data or 'products' not in data:
            return jsonify({"error": "No product data provided"}), 400
            
        products = data['products']
        
        # Insert each product into stocks collection
        result = stocks_collection.insert_many(products)
        
        return jsonify({
            "success": True,
            "message": f"Added {len(result.inserted_ids)} products to stock",
            "product_ids": [str(id) for id in result.inserted_ids]
        })
        
    except Exception as e:
        logging.error(f"Error saving products: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

