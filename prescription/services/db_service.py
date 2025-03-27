from pymongo import MongoClient
from config import Config
import logging
from datetime import datetime

class DatabaseService:
    def __init__(self):
        try:
            self.client = MongoClient(Config.MONGODB_URI)
            self.db = self.client[Config.DATABASE_NAME]
            self.prescriptions = self.db.prescriptions
        except Exception as e:
            logging.error(f"Database connection error: {str(e)}")
            raise

    def save_prescription(self, prescription_data):
        """Save prescription to database"""
        try:
            result = self.prescriptions.insert_one(prescription_data)
            return str(result.inserted_id)
        except Exception as e:
            logging.error(f"Database save error: {str(e)}")
            raise

    def get_prescription(self, prescription_id):
        """Retrieve prescription by ID"""
        try:
            return self.prescriptions.find_one({"_id": prescription_id})
        except Exception as e:
            logging.error(f"Database retrieval error: {str(e)}")
            raise

    def update_prescription(self, prescription_id, updated_data):
        """Update prescription in database"""
        try:
            result = self.prescriptions.update_one(
                {"_id": prescription_id},
                {"$set": {
                    "hospital_info": updated_data.get("hospital_info"),
                    "doctor_info": updated_data.get("doctor_info"),
                    "patient_info": updated_data.get("patient_info"),
                    "prescription_details": updated_data.get("prescription_details"),
                    "medications": updated_data.get("medications"),
                    "additional_notes": updated_data.get("additional_notes"),
                    "updated_at": datetime.utcnow()
                }}
            )
            return result.modified_count > 0
        except Exception as e:
            logging.error(f"Database update error: {str(e)}")
            raise
