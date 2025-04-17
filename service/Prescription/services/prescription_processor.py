from .cloudinary_service import upload_to_cloudinary
from .together_ai_service import TogetherAIService
from .text_process import TextProcess  # Fixed class name
from .db_service import DatabaseService
from Medicine.enrichment_service import MedicineEnrichmentService
import logging
import re

class PrescriptionProcessor:
    def __init__(self):
        self.ai_service = TogetherAIService()
        self.extractor = TextProcess()  # Fixed class instantiation
        self.db_service = DatabaseService()
        
        # Pass debug flag based on environment
        debug_mode = False
        try:
            import os
            debug_mode = os.environ.get('DEBUG', 'false').lower() == 'true'
        except:
            pass
            
        self.enrichment_service = MedicineEnrichmentService(self.db_service, debug=debug_mode)
    
    def process_prescription_image(self, image_file, session=None):
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
                    image_data=image_data,
                    session=session
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

    def enrich_prescription_medicines(self, prescription_data, auto_save=False):
        """Enrich prescription medicine data from online sources"""
        try:
            if not prescription_data or "medications" not in prescription_data:
                return {"error": "No medications found in prescription data"}
                
            medications = prescription_data["medications"]
            enriched_medications = []
            
            for med in medications:
                medicine_name = med.get("name")
                if not medicine_name:
                    enriched_medications.append(med)
                    continue
                    
                # Try to find or enrich the medicine
                result = self.enrichment_service.find_or_enrich_medicine(
                    medicine_name,
                    user_verification=not auto_save
                )
                
                # Create enriched medication object
                enriched_med = med.copy()
                
                if result["status"] in ["found", "enriched"]:
                    # Add enriched details to the medication
                    enriched_med["enriched_data"] = result["medicine"]
                    enriched_med["enrichment_status"] = result["status"]
                else:
                    # Couldn't find or enrich
                    enriched_med["enrichment_status"] = result["status"]
                    enriched_med["enrichment_message"] = result["message"]
                
                enriched_medications.append(enriched_med)
                
            # Update the prescription data with enriched medications
            enriched_prescription = prescription_data.copy()
            enriched_prescription["medications"] = enriched_medications
            
            return enriched_prescription
            
        except Exception as e:
            logging.error(f"Error enriching prescription medicines: {str(e)}")
            return {
                "error": f"Failed to enrich prescription medicines: {str(e)}"
            }
