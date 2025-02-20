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

class Prescription_Scanner:
  def __init__(self, api_key):
    self.client = Together(api_key=api_key)
    self.model = "meta-llama/Llama-Vision-Free"
    self.prompt= """
    You are an expert medical transcriptionist specializing in deciphering and accurately transcribing handwritten medical prescriptions. Your role is to meticulously analyze the provided prescription images and extract all relevant information with the highest degree of precision.

    Here are some examples of the expected output format:

    Example 1:
    Patient's full name: John Doe
    Patient's age: 45 /45y
    Patient's gender: M/Male
    Doctor's full name: Dr. Jane Smith
    Doctor's license number: ABC123456
    Prescription date: 2023-04-01
    Medications:
    - Medication name: Amoxicillin
      Dosage: 500 mg
      Frequency: Twice a day
      Duration: 7 days
    - Medication name: Ibuprofen
      Dosage: 200 mg
      Frequency: Every 4 hours as needed
      Duration: 5 days
    Additional notes: 
    - Take medications with food.
    - Drink plenty of water.

    Example 2:
    Patient's full name: Jane Roe
    Patient's age: 60/60y
    Patient's gender: F/Female
    Doctor's full name: Dr. John Doe
    Doctor's license number: XYZ654321
    Prescription date: 2023-05-10
    Medications:
    - Medication name: Metformin
      Dosage: 850 mg
      Frequency: Once a day
      Duration: 30 days
    Additional notes: 
    - Monitor blood sugar levels daily.
    - Avoid sugary foods.

    Your job is to extract and accurately transcribe the following details from the provided prescription images:
    1. Patient's full name
    2. Patient's age (handle different formats like "42y", "42yrs", "42", "42 years")
    3. Patient's gender
    4. Doctor's full name
    5. Doctor's license number
    6. Prescription date (in YYYY-MM-DD format)
    7. List of medications including:
        - Medication name
        - Dosage
        - Frequency
        - Duration
    8. Additional notes or instructions. Provide detailed and enhanced notes using bullet points. Organize the notes in clear bullet points for better readability.
        - Provide detailed and enhanced notes using bullet points.
        - If there are headings or categories within the notes, ensure the bullet points are organized under those headings.
        - Use clear and concise language to enhance readability.
        - Ensure the notes are structured in a way that makes them easy to follow and understand.

    Important Instructions:
    - Before extracting information, enhance the image for better readability if needed. Use techniques such as adjusting brightness, contrast, or applying filters to improve clarity.
    - Ensure that each extracted field is accurate and clear. If any information is not legible or missing, indicate it as 'Not available'. 
    - Do not guess or infer any information that is not clearly legible.
    - Do not make assumptions or guesses about missing information. 
    - Pay close attention to details like medication names, dosages, and frequencies. 

    Prescription images:
    """
  
  def get_mime_type_from_url(self,url):
    """ Determin MIME type from URL """
    try:
        response= requests.head(url)
        content_type = response.headers.get('content-type','')
        if content_type.startswith('image/'):
           return content_type
    except:
       pass
  
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
        'Patient name': None,
        'age': None,
        'gender': None,
        'Doctor name':None,
        'license number': None,
        'Prescription date': None,
        'medications with name, dosage, frequency, and duration': None,
        'Additional notes': None
    }
    
    patterns = {
      'Patient name': [],
      'age': [],
      'gender': [],
      'Doctor name': [],
      'license number': [],
      'Prescription date': [],
      'medications':[{
        'name': [],
        'dosage': [],
        'frequency': [],
         'duration': []
      }],
      'Additional notes': []
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

    ordered_info = {key: info[key] for key in ['Patient name',
        'age',
        'gender',
        'Doctor name',
        'license number',
        'Prescription date',
        'medications with name, dosage, frequency, and duration',
        'Additional notes']}
    return ordered_info
  
  def analyze_image_url(self, image_url, num_requests=3):
    """Analyze the image from URL multiple times and aggregate results."""
    try:
      mime_type = self.get_mime_type_from_url(image_url)
      aggregated_info = {'Patient name': set(), 'age': set(), 'gender': set(), 'Doctor name': set(), 'license number':set(),
                         'Prescription date':set(),
                         'medications':{'name':set(), 'dosage':set(), 'frequency':set(), 'duration':set()},
                         'Additional notes':set()}
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

