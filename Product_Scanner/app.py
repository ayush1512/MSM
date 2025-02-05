from flask import Flask, request, jsonify
from together import Together
import base64
import os
import imghdr

app = Flask(__name__)

# Get the API key from an environment variable
api_key = os.getenv('TOGETHER_API_KEY')

# Class to process images
class ImageProcessor:
    def __init__(self, api_key):
        self.client = Together(api_key=api_key)
        self.prompt = "Extract text from the image such as Batch No., Mfg. Date, Expiry Date, Price etc."
        self.model = "meta-llama/Llama-Vision-Free"

    def get_mime_type(self, image_path):
        """Determine MIME type based on the actual image format"""
        img_type = imghdr.what(image_path)
        if img_type:
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

    def analyze_image(self, image_path):
        """Analyze the image using the Together API"""
        base64_image = self.encode_image(image_path)
        mime_type = self.get_mime_type(image_path)

        # Request to the API
        stream = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": self.prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{base64_image}"
                            },
                        },
                    ],
                }
            ],
            stream=True,
        )

        # Process the streaming response
        response_text = ""
        for chunk in stream:
            if hasattr(chunk, 'choices') and chunk.choices:
                content = chunk.choices[0].delta.content if hasattr(chunk.choices[0].delta, 'content') else None
                if content:
                    response_text += content
        return response_text

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
    markdown_content = processor.analyze_image(image_path)
    return jsonify({"markdown": markdown_content})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)