import logging
from .web_scraper import MedicineWebScraper
from bson import ObjectId
from Product.models import Medicine

class MedicineEnrichmentService:
    """Service to enrich the medicine database with data from web sources"""
    
    def __init__(self, db_service, debug=False):
        """Initialize with database service"""
        self.db_service = db_service
        
        # Handle both direct MongoDB connection and DatabaseService objects
        if hasattr(db_service, 'medicine_collection'):
            # If it's a service object with medicine_collection attribute
            self.medicine_collection = db_service.medicine_collection
        elif hasattr(db_service, 'Medicine'):
            # If it's a direct MongoDB connection with Medicine collection
            self.medicine_collection = db_service.Medicine
        else:
            # Fallback - try with conventional collection name
            logging.warning("Medicine collection not found in expected format. Trying fallback approach.")
            self.medicine_collection = db_service.get_collection('Medicine')
            
        self.scraper = MedicineWebScraper(debug=debug)
        self.debug = debug
        
    def find_or_enrich_medicine(self, medicine_name, manufacturer=None, user_verification=False, try_simplified=True):
        """
        Find a medicine in database or enrich from web sources
        
        Args:
            medicine_name: Name of the medicine to search
            manufacturer: Optional manufacturer name to narrow search
            user_verification: Whether user verification is required before saving
            try_simplified: Whether to try simplified product names if exact match fails
            
        Returns:
            Dict containing medicine information and status
        """
        try:            # First try to find in our database using a more flexible search
            # Use a case-insensitive search that doesn't require exact match
            query = {"product_name": {"$regex": medicine_name, "$options": "i"}}
            if manufacturer:
                query["product_manufactured"] = {"$regex": manufacturer, "$options": "i"}
            
            existing_medicine = self.medicine_collection.find_one(query)
            
            # If not found with flexible search, try alternative approaches
            if not existing_medicine:
                # Try normalized name (remove extra spaces, convert to lowercase)
                normalized_name = " ".join(medicine_name.lower().split())
                alternative_queries = [
                    {"product_name": {"$regex": f"{normalized_name}", "$options": "i"}},
                    # Try with partial name matching
                    {"product_name": {"$regex": f".*{normalized_name}.*", "$options": "i"}}
                ]
                
                for alt_query in alternative_queries:
                    if manufacturer:
                        alt_query["product_manufactured"] = {"$regex": manufacturer, "$options": "i"}
                    existing_medicine = self.medicine_collection.find_one(alt_query)
                    if existing_medicine:
                        break
            
            if existing_medicine:
                # Medicine already exists
                existing_medicine["_id"] = str(existing_medicine["_id"])
                return {
                    "status": "found",
                    "medicine": existing_medicine,
                    "message": "Medicine found in database"
                }
            
            # Medicine not in database, search online
            logging.info(f"Medicine '{medicine_name}' not found in database. Searching online...")
            
            # Scrape medicine details from online sources
            medicine_data = self.scraper.search_and_scrape_medicine(medicine_name)
            
            if medicine_data:
                if user_verification:
                    # Return without saving for user verification
                    return {
                        "status": "needs_verification",
                        "medicine": medicine_data,
                        "message": "Medicine found online. Verification required before saving."
                    }
                
                # Save the enriched medicine data
                return self._save_enriched_medicine(medicine_data)
            
            # Try simplified search if enabled and original search failed
            if try_simplified and ' ' in medicine_name:
                # Extract basic product name (first 3 words)
                words = medicine_name.split()
                simplified_name = ' '.join(words[:min(3, len(words))])
                
                if simplified_name != medicine_name:
                    logging.info(f"Trying simplified search for '{simplified_name}'")
                    
                    # Recursive call with simplified name, but prevent further simplification
                    simplified_result = self.find_or_enrich_medicine(
                        simplified_name, 
                        manufacturer=manufacturer,
                        user_verification=user_verification,
                        try_simplified=False  # Prevent infinite recursion
                    )
                    
                    if simplified_result["status"] in ["found", "needs_verification", "enriched"]:
                        medicine_data = simplified_result["medicine"]
                        # Preserve original product name
                        medicine_data["product_name"] = medicine_name
                        medicine_data["simplified_search_term"] = simplified_name
                        return simplified_result
            
            # Nothing found
            return {
                "status": "not_found",
                "message": f"Could not find information for medicine '{medicine_name}'"
            }
            
        except Exception as e:
            logging.error(f"Error in medicine enrichment: {str(e)}")
            return {
                "status": "error",
                "message": f"Error during medicine enrichment: {str(e)}"
            }
    
    def _save_enriched_medicine(self, medicine_data):
        """Save enriched medicine data to database"""
        try:
            # Create Medicine object
            medicine = Medicine(
                product_name=medicine_data.get("product_name"),
                product_manufactured=medicine_data.get("product_manufactured", "Unknown"),
                salt_composition=medicine_data.get("salt_composition", "Not specified"),
                sub_category=medicine_data.get("sub_category"),
                product_price=medicine_data.get("product_price"),
                medicine_desc=medicine_data.get("medicine_desc"),
                side_effects=medicine_data.get("side_effects", []),
                drug_interactions=medicine_data.get("drug_interactions"),
                image_url=medicine_data.get("image_url"),
                additional_notes=medicine_data.get("additional_notes")
            )
            
            # Insert into database
            result = self.medicine_collection.insert_one(medicine.to_dict())
            
            # Get the inserted medicine
            enriched_medicine = self.medicine_collection.find_one({"_id": result.inserted_id})
            enriched_medicine["_id"] = str(enriched_medicine["_id"])
            
            return {
                "status": "enriched",
                "medicine": enriched_medicine,
                "message": "Medicine information enriched from online sources"
            }
            
        except Exception as e:
            logging.error(f"Error saving enriched medicine: {str(e)}")
            return {
                "status": "error",
                "message": f"Error saving enriched medicine: {str(e)}"
            }
    
    def verify_and_save_medicine(self, medicine_data, user_corrections=None):
        """Save medicine after user verification, with optional corrections"""
        try:
            # Apply any user corrections to the medicine data
            if user_corrections:
                for key, value in user_corrections.items():
                    if key in medicine_data:
                        medicine_data[key] = value
            
            # Save the verified medicine
            return self._save_enriched_medicine(medicine_data)
            
        except Exception as e:
            logging.error(f"Error in verifying and saving medicine: {str(e)}")
            return {
                "status": "error",
                "message": f"Error saving verified medicine: {str(e)}"
            }
    
    def enrich_medicines_from_list(self, medicine_names, user_verification=False):
        """Enrich multiple medicines from a list of names"""
        results = []
        
        for medicine_name in medicine_names:
            result = self.find_or_enrich_medicine(
                medicine_name, 
                user_verification=user_verification
            )
            results.append(result)
            
        return results
