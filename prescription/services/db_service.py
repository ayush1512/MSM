from pymongo import MongoClient
from config import Config
import logging

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
