from together import Together
import os
import re
import logging
import requests
import base64

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
            if url.startswith('data:'):
                # Extract MIME type from data URL
                mime_type = url.split(';')[0].split(':')[1]
                return mime_type
            
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

    def analyze_image_base64(self, base64_data, num_requests=3):
        """Analyze an image from base64 data multiple times and aggregate results."""
        try:
            # If the input is a complete data URL, extract just the base64 part
            if base64_data.startswith('data:'):
                # Extract the base64 part after the comma
                base64_part = base64_data.split(',', 1)[1] if ',' in base64_data else base64_data
            else:
                base64_part = base64_data
                
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
                                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_part}"}}
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
            logging.error(f"Error in analyze_image_base64: {str(e)}")
            raise

    def analyze_image_url(self, image_url, num_requests=3):
        """Analyze the image from URL multiple times and aggregate results."""
        try:
            # Check if the URL is a base64 data URL
            if image_url.startswith('data:'):
                return self.analyze_image_base64(image_url, num_requests)
                
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
