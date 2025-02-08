from flask import Flask, request, jsonify, render_template
from together import Together
import base64
import os
import re
import imghdr
import logging
import json  # Add this import

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__, template_folder='templates')

# Get the API key from an environment variable
api_key = os.getenv('TOGETHER_API_KEY')

class ImageProcessor:
    def __init__(self, api_key):
        self.client = Together(api_key=api_key)
        self.prompt = "Extract text from the image and provide the following details: Batch No., Mfg. Date, Exp. Date, MRP. Make sure the dates are converted into numerical MM/YYYY format strictly. For Example: Batch No: 1234, Mfg Date: 12/2021, Exp Date: 12/2023, MRP: 100.00"
        self.model = "meta-llama/Llama-Vision-Free"

    def get_mime_type(self, image_path):
        """Determine MIME type based on the actual image format"""
        img_type = imghdr.what(image_path)
        if img_type:
            return f'image/{img_type}'
        extension = os.path.splitext(image_path)[1].lower()
        mime_types = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        }
        return mime_types.get(extension, 'image/jpeg')
    
    def encode_image(self, image_path):
        """Encode the image in base64"""
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')

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

    def analyze_image(self, image_path, num_requests=3):
        """Analyze the image multiple times and aggregate results."""
        base64_image = self.encode_image(image_path)
        mime_type = self.get_mime_type(image_path)
        
        aggregated_info = {'BNo': set(), 'MfgD': set(), 'ExpD': set(), 'MRP': set()}

        for _ in range(num_requests):
            try:
                # Create the messages array with the image and prompt
                messages = [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": self.prompt},
                            {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{base64_image}"}}
                        ]
                    }
                ]

                # Make the API call using the completions endpoint
                response = self.client.completions.create(
                    model=self.model,
                    prompt=json.dumps(messages),  # Convert messages to JSON string
                    max_tokens=500,
                    temperature=0.7,
                    stream=True
                )

                response_text = ""
                for chunk in response:
                    if hasattr(chunk, 'choices') and len(chunk.choices) > 0 and hasattr(chunk.choices[0], 'text'):
                        response_text += chunk.choices[0].text

                logging.debug(f"API response text: {response_text}")
                if not response_text:
                    logging.error("Empty response text from API")
                    continue

                # Check if the response is in JSON format
                try:
                    response_json = json.loads(response_text)
                    logging.debug(f"API response JSON: {response_json}")
                except json.JSONDecodeError:
                    logging.error("Response text is not valid JSON")
                    continue

                extracted_info = self.extract_useful_info(response_text)
                
                for key in aggregated_info:
                    if extracted_info[key]:
                        aggregated_info[key].add(extracted_info[key])
                        
            except Exception as e:
                logging.error(f"Error in API call: {str(e)}")
                continue

        final_info = {key: list(values) if values else None for key, values in aggregated_info.items()}
        return final_info


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process_image', methods=['POST'])
def process_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    image_file = request.files['image']
    tmp_dir = '/tmp'
    if not os.path.exists(tmp_dir):
        os.makedirs(tmp_dir)
    image_path = os.path.join(tmp_dir, image_file.filename)
    image_file.save(image_path)

    try:
        processor = ImageProcessor(api_key)
        useful_info = processor.analyze_image(image_path)
        os.remove(image_path)
        return jsonify(useful_info)
    except Exception as e:
        if os.path.exists(image_path):
            os.remove(image_path)
        logging.error(f"Error processing image: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)