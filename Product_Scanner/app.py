from flask import Flask, request, jsonify
from together import Together
import base64
import os
import imghdr
import re

app = Flask(__name__)

# Get the API key from an environment variable
api_key = os.getenv('TOGETHER_API_KEY')

# Class to process images
class ImageProcessor:
    def __init__(self, api_key):
        self.client = Together(api_key=api_key)
        self.prompt = "Extract text from the image and provide the following details: Batch No., Mfg. Date, Exp. Date, MRP. Make sure the dates are converted into MM/YYYY format. For Example: Batch No: 1234, Mfg Date: 12/2021, Exp Date: 12/2023, MRP: 100.00"
        self.model = "meta-llama/Llama-Vision-Free"

    def get_mime_type(self, image_path):
        """Determine MIME type based on the actual image format"""
        img_type = imghdr.what(image_path)
        if (img_type):
            return f'image/{img_type}'
        # Fallback for detection based on file extension
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
        info = {
            'BNo': None,
            'MfgD': None,
            'ExpD': None,
            'MRP': None
        }
        
        patterns = {
            'BNo': [
            r'B\.? ?NO\.?/? ?([A-Za-z0-9]+)',
            r'Batch ?No\.?/? ?([A-Za-z0-9]+)',
            r'Batch ?number:? ?([A-Za-z0-9]+)',
            r'\*\s*Batch\s*No\.?:\s*([A-Za-z0-9]+)',
            r'BATCH ?NO\.?/? ?([A-Za-z0-9]+)',
            r'BNO\.?/? ?([A-Za-z0-9]+)',
            r'B\.?NO\.?/? ?([A-Za-z0-9]+)'
            ],
            'MfgD': [
            r'(?:MFD|Mfg\.? Date|M\.? Date):? ?(\d{2}/\d{4})',
            r'\*\s*Mfg\.?\s*Date:\s*(\d{2}/\d{4})',
            r'MFG\.? ?DATE:? ?(\d{2}/\d{4})',
            r'MANUFACTURING ?DATE:? ?(\d{2}/\d{4})'
            ],
            'ExpD': [
            r'(?:EXP|Exp\.? Date|Expiry Date|Expiration Date):? ?(\d{2}/\d{4})',
            r'\*\s*Expiry\s*Date:\s*(\d{2}/\d{4})',
            r'EXPIRY ?DATE:? ?(\d{2}/\d{4})',
            r'EXP\.? ?DATE:? ?(\d{2}/\d{4})'
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
                    break
        
        # Ensure the headers are arranged in the format of BNo, MfgD, ExpD, MRP
        ordered_info = {key: info[key] for key in ['BNo', 'MfgD', 'ExpD', 'MRP']}
        return ordered_info

    def analyze_image(self, image_path, num_requests=3):
        """Analyze the image multiple times and aggregate results."""
        base64_image = self.encode_image(image_path)
        mime_type = self.get_mime_type(image_path)
        
        aggregated_info = {'BNo': set(), 'MfgD': set(), 'ExpD': set(), 'MRP': set()}

        for _ in range(num_requests):
            stream = self.client.chat.completions.create(
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
            for chunk in stream:
                if hasattr(chunk, 'choices') and chunk.choices:
                    content = chunk.choices[0].delta.content if hasattr(chunk.choices[0].delta, 'content') else None
                    if content:
                        response_text += content

            extracted_info = self.extract_useful_info(response_text)
            for key in aggregated_info:
                if extracted_info[key]:
                    aggregated_info[key].add(extracted_info[key])

        # Convert sets to lists for JSON serialization
        final_info = {key: list(values) if values else None for key, values in aggregated_info.items()}
        return final_info

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

    processor = ImageProcessor(api_key)
    useful_info = processor.analyze_image(image_path)
    return jsonify(useful_info)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)