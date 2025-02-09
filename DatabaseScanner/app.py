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

@app.route('/process_image', methods=['POST'])
def process_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    try:
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

        # Return response with Cloudinary URL and extracted information
        response = {
            'image_url': upload_result['secure_url'],
            'public_id': upload_result['public_id'],
            'extracted_info': extracted_info
        }
        
        return jsonify(response), 201

    except Exception as e:
        logging.error(f"Error processing image: {str(e)}")
        logging.error(f"Exception details:", exc_info=True)
            
        return jsonify({
            "error": "Failed to process image",
            "details": str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)