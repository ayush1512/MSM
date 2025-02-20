from flask import Flask, request, jsonify, render_template
from together import Together
import base64
import os
import imghdr
import re
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)

# Define allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Get the API key from an environment variable
api_key = os.getenv('TOGETHER_API_KEY')

# Class to process images
class ImageProcessor:
    def __init__(self, api_key):
        self.client = Together(api_key=api_key)
        self.last_response_text = ""  # Add this line
        self.prompt = """
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
        """Extract prescription information from formatted text"""
        logging.debug(f"Extracting prescription info from text: {text}")
        info = {
            'patient_name': None,
            'patient_age': None,
            'patient_gender': None,
            'doctor_name': None,
            'doctor_license': None,
            'prescription_date': None,
            'medications': [],
            'additional_notes': []
        }
        
        # Extract basic information
        basic_patterns = {
            'patient_name': r"\* Patient's full name:\s*([^\n]+)",
            'patient_age': r"\* Patient's age:\s*([^\n]+)",
            'patient_gender': r"\* Patient's gender:\s*([^\n]+)",
            'doctor_name': r"\* Doctor's full name:\s*([^\n]+)",
            'doctor_license': r"\* Doctor's license number:\s*([^\n]+)",
            'prescription_date': r"\* Prescription date:\s*([^\n]+)"
        }
        
        for key, pattern in basic_patterns.items():
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                info[key] = match.group(1).strip()

        # Extract medications using bullet points pattern
        medications_section = re.search(r"\*\*Medications\*\*(.*?)\*\*Additional Notes\*\*", text, re.DOTALL)
        if medications_section:
            med_text = medications_section.group(1)
            # Split by main bullet points for medication names
            med_entries = re.findall(r"\* ([^*\n]+)(?:\n\t\+ [^\n]+)*", med_text)
            
            for entry in med_entries:
                med_name = entry.strip()
                medication = {'name': med_name}
                
                # Find all nested properties for this medication
                dosage = re.search(rf"{re.escape(med_name)}.*?\n\t\+ Dosage: ([^\n]+)", med_text)
                frequency = re.search(rf"{re.escape(med_name)}.*?\n\t\+ Frequency: ([^\n]+)", med_text)
                duration = re.search(rf"{re.escape(med_name)}.*?\n\t\+ Duration: ([^\n]+)", med_text)
                
                if dosage: medication['dosage'] = dosage.group(1).strip()
                if frequency: medication['frequency'] = frequency.group(1).strip()
                if duration: medication['duration'] = duration.group(1).strip()
                
                info['medications'].append(medication)

        # Extract additional notes
        notes_section = re.search(r"\*\*Additional Notes\*\*(.*?)(?:$|\n\n)", text, re.DOTALL)
        if notes_section:
            notes_text = notes_section.group(1)
            # Get all bullet points under Additional Notes
            notes = re.findall(r"\* ([^\n]+)", notes_text)
            info['additional_notes'] = [note.strip() for note in notes if note.strip()]

        return info

    def analyze_image(self, image_path, num_requests=3):
        """Analyze the prescription image multiple times and aggregate results."""
        base64_image = self.encode_image(image_path)
        mime_type = self.get_mime_type(image_path)
        
        all_results = []
        all_responses = []
        
        for attempt in range(num_requests):
            logging.debug(f"Attempt {attempt + 1} of {num_requests}")
            
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

            logging.debug(f"API response text from attempt {attempt + 1}: {response_text}")
            all_responses.append(response_text)
            result = self.extract_useful_info(response_text)
            all_results.append(result)

        # Store all raw responses
        self.last_response_text = "\n\n=== ATTEMPT SEPARATOR ===\n\n".join(all_responses)
        
        # Aggregate results
        final_result = {
            'patient_name': self._most_common([r['patient_name'] for r in all_results]),
            'patient_age': self._most_common([r['patient_age'] for r in all_results]),
            'patient_gender': self._most_common([r['patient_gender'] for r in all_results]),
            'doctor_name': self._most_common([r['doctor_name'] for r in all_results]),
            'doctor_license': self._most_common([r['doctor_license'] for r in all_results]),
            'prescription_date': self._most_common([r['prescription_date'] for r in all_results]),
            'medications': self._aggregate_medications([r['medications'] for r in all_results]),
            'additional_notes': self._aggregate_notes([r['additional_notes'] for r in all_results])
        }
        
        return final_result

    def _most_common(self, items):
        """Return the most common non-None item from a list."""
        items = [i for i in items if i is not None]
        if not items:
            return None
        return max(set(items), key=items.count)

    def _aggregate_medications(self, med_lists):
        """Aggregate medications from multiple attempts."""
        all_meds = {}
        
        for med_list in med_lists:
            for med in med_list:
                name = med.get('name')
                if name:
                    if name not in all_meds:
                        all_meds[name] = {
                            'name': name,
                            'dosage': [],
                            'frequency': [],
                            'duration': []
                        }
                    if med.get('dosage'): all_meds[name]['dosage'].append(med['dosage'])
                    if med.get('frequency'): all_meds[name]['frequency'].append(med['frequency'])
                    if med.get('duration'): all_meds[name]['duration'].append(med['duration'])
        
        # Get most common values for each medication
        result = []
        for med_name, med_data in all_meds.items():
            result.append({
                'name': med_name,
                'dosage': self._most_common(med_data['dosage']),
                'frequency': self._most_common(med_data['frequency']),
                'duration': self._most_common(med_data['duration'])
            })
        
        return result

    def _aggregate_notes(self, note_lists):
        """Aggregate notes from multiple attempts."""
        all_notes = {}
        for notes in note_lists:
            for note in notes:
                if note:
                    all_notes[note] = all_notes.get(note, 0) + 1
        
        # Return notes that appear in majority of attempts
        threshold = len(note_lists) / 2
        return [note for note, count in all_notes.items() if count > threshold]

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

    processor = ImageProcessor(api_key)
    useful_info = processor.analyze_image(image_path)
    return jsonify(useful_info)

@app.route('/upload', methods=['POST'])
def upload():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        if not image_file or not allowed_file(image_file.filename):
            return jsonify({"error": "Invalid file type"}), 400

        tmp_dir = '/tmp'
        if not os.path.exists(tmp_dir):
            os.makedirs(tmp_dir)
        image_path = os.path.join(tmp_dir, image_file.filename)
        image_file.save(image_path)

        try:
            processor = ImageProcessor(api_key)
            if not api_key:
                raise ValueError("API key not found. Please set TOGETHER_API_KEY environment variable.")
            
            result = processor.analyze_image(image_path)
            
            # Clean up the temporary file
            os.remove(image_path)
            
            # Return both raw text and extracted info
            return jsonify({
                "status": "success",
                "extracted_info": result,
                "raw_text": processor.last_response_text  # Add this line
            })
        
        except Exception as e:
            if os.path.exists(image_path):
                os.remove(image_path)
            raise e

    except Exception as e:
        logging.error(f"Error processing upload: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)