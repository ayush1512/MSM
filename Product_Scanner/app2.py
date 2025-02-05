from flask import Flask, request, jsonify
import pytesseract
import cv2
import numpy as np
from datetime import datetime
import re
import json
from ultralytics import YOLO
from flask_cors import CORS
import matplotlib.pyplot as plt

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins

# Ensure all necessary NLTK data is downloaded (only needed if NLTK is used)
# import nltk
# nltk.download('punkt', quiet=True)
# nltk.download('averaged_perceptron_tagger', quiet=True)
# nltk.download('maxent_ne_chunker', quiet=True)

# Function to cut image
def cut_image(file):
    model = YOLO("best.pt")
    img = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_COLOR)
    results = model(img)
    cropped_images = []
    for i, (x1, y1, x2, y2) in enumerate(results[0].boxes.xyxy):
        x1, y1, x2, y2 = map(int, [x1, y1, x2, y2])
        cropped_image = img[y1:y2, x1:x2]
        cropped_images.append(cropped_image)
   
    return cropped_images

def preprocess_image(cropped_image):
    for img_array in cropped_image:
    
        img = cv2.cvtColor(img_array, cv2.COLOR_BGR2GRAY)
        
        # Convert to black and white using Otsu's thresholding
        _, bw = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Perform connected component analysis
        num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(bw, connectivity=8)
        
        # Create an output image to store the filtered components
        filtered_img = np.zeros_like(bw)
        
        # Filter out small connected components
        min_size = 100  # Minimum size of connected components to keep
        for i in range(1, num_labels):  # Skip the background component
            if stats[i, cv2.CC_STAT_AREA] >= min_size:
                filtered_img[labels == i] = 255
        
        return filtered_img

# Set the path to Tesseract-OCR executable (only needed for Windows or custom installs)
pytesseract.pytesseract.tesseract_cmd = r'C:/Program Files/Tesseract-OCR/tesseract.exe'  # Adjust path as necessary

def perform_ocr(img):
    custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.:-/'
    text = pytesseract.image_to_string(img, config=custom_config)
    return text.strip()

def parse_text(text):
    parsed_info = parse_with_regex(text)
    
    if len(parsed_info) < 3:
        parsed_info.update(parse_without_labels(text))
    
    return parsed_info

def parse_with_regex(text):
    batch_pattern = r'(?:SL|5L|6L|GL|Batch|Lot|B\.?|L\.?)\s*(?:NO|WO)\.?\s*:?\s*([A-Z0-9-]+)'
    mfg_pattern = r'(?:Mfg\.?|Manufacturing\.?|MFD\.?|M\.?|MF\.?|MFOD\.?|MFO\.?)\s*([A-Z]{3,4}\.?\s*\d{4}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})'
    exp_pattern = r'(?:Exp|Expiry|Expiration|EXP|EX)\s*:?\s*([A-Z]{3,4}\.?\s*\d{4}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})'
    
    parsed_info = {}
    
    batch_match = re.search(batch_pattern, text, re.IGNORECASE)
    mfg_match = re.search(mfg_pattern, text, re.IGNORECASE)
    exp_match = re.search(exp_pattern, text, re.IGNORECASE)
    
    if batch_match:
        parsed_info['Batch no.'] = batch_match.group(1)
    if mfg_match:
        parsed_info['Mfg date'] = mfg_match.group(1)
    if exp_match:
        parsed_info['Expiry date'] = exp_match.group(1)
    
    return parsed_info

def clean_date_string(date_string):
    cleaned = re.sub(r'([A-Z]{3})[^A-Z0-9]?(\d{4})', r'\1.\2', date_string)
    
    if not re.match(r'[A-Z]{3}\.?\d{4}', cleaned):
        cleaned = re.sub(r'[^\d]', '', cleaned[-4:])
        cleaned = f'{date_string[:3]}.{cleaned}'
    
    return cleaned

def is_date(string):
    cleaned_string = clean_date_string(string)
    date_patterns = [
        r'\d{1,2}[-/]\d{4}', 
        r'\d{2}\d{2}\d{2,4}', 
        r'\d{2,4}[-/]\d{1,2}', 
        r'[O0]\d[-/]\d{4}', 
        r'[A-Z]{3,4}\.?\s*\d{4}'
    ]
    
    for pattern in date_patterns:
        if re.match(pattern, cleaned_string):
            return True
    
    return False

def is_price(string):
    price_pattern = r'(?:.*:)?(?:RS\.?)?(?:rs\.?)?(?:Rs\.?)?(\d+(?:\.\d{1,2})?)'
    match = re.match(price_pattern, string, re.IGNORECASE)
    if match:
        try:
            price = float(match.group(1))
            return "{:.2f}".format(price)  # Format price to always have 2 decimal places
        except ValueError:
            return None
    return None

def format_date(date_string):
    date_string = re.sub(r'\s+', ' ', date_string)
    date_string = re.sub(r'[^A-Za-z0-9. ]', '', date_string)

    if re.match(r'^[A-Z]{3}\.\d{4}$', date_string):
        month_abbr = {
            'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
            'MAY': '05', 'JUN': '06', 'JUL': '07', 'AUG': '08',
            'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
        }
        month = date_string[:3]
        year = date_string[4:]
        if month in month_abbr:
            formatted_date = f"{month_abbr[month]}/{year}"
            return formatted_date

    for fmt in ('%b.%Y', '%b%Y', '%m%Y', '%m-%Y', '%d-%Y', 
                '%Y-%m', '%Y-%d', '%m/%Y', '%d/%Y', 
                '%Y/%m', '%Y/%d', '%m%d%Y', '%d%m%Y', 
                '%Y%m%d', '%Y%d%m'):
        try:
            date = datetime.strptime(date_string, fmt)
            formatted_date = date.strftime('%m/%Y')
            return formatted_date
        except ValueError:
            continue

    return date_string

def parse_without_labels(text):
    lines = [line.strip() for line in text.split('\n') if line.strip()]

    parsed_info = {}
    prices = []

    for i, line in enumerate(lines):
        cleaned_line = clean_date_string(line)
        if i == 0 and 'Batch no.' not in parsed_info:
            parsed_info['Batch no.'] = line.lstrip('-')
        elif is_date(cleaned_line):
            if 'Mfg date' not in parsed_info:
                parsed_info['Mfg date'] = format_date(cleaned_line)
            elif 'Expiry date' not in parsed_info:
                parsed_info['Expiry date'] = format_date(cleaned_line)
        else:
            price = is_price(line)
            if price is not None:
                prices.append(price)

    if len(prices) >= 2:
        parsed_info['MRP'] = max(prices)
        parsed_info['Price per item'] = min(prices)
    elif len(prices) == 1:
        parsed_info['MRP'] = prices[0]

    return parsed_info

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image part"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        cropped_image = cut_image(file)
        img = preprocess_image(cropped_image)
        extracted_text = perform_ocr(img)
        parsed_info = parse_text(extracted_text)
        json_output = json.dumps(parsed_info, indent=4)
        return jsonify(parsed_info)

if __name__ == "__main__":
    app.run(debug=True)