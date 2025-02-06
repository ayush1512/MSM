from flask import Flask, request, jsonify, render_template
import together  # Changed import statement
import base64
import os
import imghdr
import re
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)

# Get the API key from an environment variable
api_key = os.getenv('TOGETHER_API_KEY')
if not api_key:
    raise ValueError("TOGETHER_API_KEY environment variable is missing!")
# Initialize the API key
together.api_key = api_key

# Class to process images
class ImageProcessor:
    def __init__(self, api_key):
        self.api_key = api_key
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
                r'Batch ?No\.?/? ?([A-Za-z0-9]+)',
                r'BATCH ?NO\.?/? ?([A-Za-z0-9]+)'
            ],
            'MfgD': [
                r'Mfg\.? Date:? ?(\d{2}/\d{4})',
                r'MANUFACTURING ?DATE:? ?(\d{2}/\d{4})'
            ],
            'ExpD': [
                r'Exp\.? Date:? ?(\d{2}/\d{4})',
                r'EXPIRY ?DATE:? ?(\d{2}/\d{4})'
            ],
            'MRP': [
                r'MRP:? ?(\d+\.\d{2})',
                r'₹ ?(\d+\.\d{2})'
            ]
        }
        
        for key, pattern_list in patterns.items():
            for pattern in pattern_list:
                match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
                if match:
                    info[key] = match.group(1).strip()
                    logging.debug(f"Found {key}: {info[key]}")
                    break

        return info

    def analyze_image(self, image_path, num_requests=3):
        """Analyze the image multiple times and aggregate results."""
        base64_image = self.encode_image(image_path)
        mime_type = self.get_mime_type(image_path)
        
        aggregated_info = {'BNo': set(), 'MfgD': set(), 'ExpD': set(), 'MRP': set()}

        for _ in range(num_requests):
            response = together.Complete.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": self.prompt},
                            {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{base64_image}"}}
                        ],
                    }
                ],
                stream=True,
            )

            response_text = ""
            for chunk in response:
                if hasattr(chunk, 'choices') and chunk.choices:
                    content = chunk.choices[0].delta.content if hasattr(chunk.choices[0].delta, 'content') else None
                    if content:
                        response_text += content

            logging.debug(f"API response text: {response_text}")
            extracted_info = self.extract_useful_info(response_text)
            for key in aggregated_info:
                if extracted_info[key]:
                    aggregated_info[key].add(extracted_info[key])

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
    
    import uuid
    safe_filename = str(uuid.uuid4()) + os.path.splitext(image_file.filename)[1]
    
    tmp_dir = '/tmp'
    if not os.path.exists(tmp_dir):
        os.makedirs(tmp_dir)
    image_path = os.path.join(tmp_dir, safe_filename)
    image_file.save(image_path)

    try:
        processor = ImageProcessor(api_key)
        useful_info = processor.analyze_image(image_path)
        os.remove(image_path)
        return jsonify(useful_info)
    except Exception as e:
        if os.path.exists(image_path):
            os.remove(image_path)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # port = int(os.environ.get("PORT", 5000))  # Use Render's assigned port
    app.run(host="0.0.0.0", debug=True)

