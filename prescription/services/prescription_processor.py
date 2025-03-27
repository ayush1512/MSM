from .cloudinary_service import upload_to_cloudinary
from .together_ai_service import TogetherAIService
from .text_process import TextProcess
from .db_service import DatabaseService
import logging
import re

class PrescriptionProcessor:
    def __init__(self):
        self.ai_service = TogetherAIService()
        self.extractor = TextProcess()  # Fixed class instantiation
        self.db_service = DatabaseService()
    
    def process_prescription_image(self, image_file):
        """Upload image and process prescription in one go"""
        try:
            # First upload to Cloudinary
            upload_result = upload_to_cloudinary(image_file)
            if not upload_result:
                raise Exception("Failed to upload image")
                
            # Prepare image data
            image_data = {
                'url': upload_result['secure_url'],
                'public_id': upload_result['public_id']
            }

            try:
                # Get raw text from multiple iterations
                extracted_text = self.ai_service.analyze_image(image_data['url'])
                
                if not extracted_text:
                    return None

                # Extract structured data using regex and save to database with image data
                structured_data = self.extractor.analyze_text(
                    extracted_text, 
                    self.db_service,
                    image_data=image_data
                )
                
                if "error" in structured_data:
                    return {
                        'success': False,
                        'error': structured_data["error"]
                    }

            except Exception as e:
                logging.error(f"Prescription processing error: {str(e)}")
                return None
                
            # Return combined result
            return {
                'success': True,
                'image_data': image_data,
                'prescription_data': structured_data
            }
            
        except Exception as e:
            logging.error(f"Prescription processing error: {str(e)}")
            return None
