from datetime import datetime
from bson import ObjectId
import json

class BillModel:
    """Model for bill data structure and operations"""
    
    def __init__(self, db):
        self.db = db
        self.collection = db.bills_collection
    
    def create_bill(self, bill_data):
        """Create a new bill record in the database"""
        bill_record = {
            "original_filename": bill_data.get("original_filename", "Unknown"),
            "upload_date": datetime.now(),
            "image_url": bill_data.get("image_url", ""),
            "extracted_text": bill_data.get("extracted_text", ""),
            "bill_details": bill_data.get("bill_details", {}),
            "products": bill_data.get("products", [])
        }
        
        bill_id = self.collection.insert_one(bill_record).inserted_id
        return str(bill_id)
    
    def get_bill_by_id(self, bill_id):
        """Get bill details by ID"""
        try:
            bill = self.collection.find_one({"_id": ObjectId(bill_id)})
            if bill:
                bill["_id"] = str(bill["_id"])
            return bill
        except Exception as e:
            print(f"Error retrieving bill: {str(e)}")
            return None
    
    def get_bills(self, filter_date=None):
        """Get all bills with optional date filtering"""
        try:
            query = {}
            if filter_date:
                # Convert string date to datetime range for the whole day
                start_date = datetime.strptime(filter_date, '%Y-%m-%d')
                end_date = datetime.strptime(filter_date, '%Y-%m-%d').replace(hour=23, minute=59, second=59)
                query = {
                    'upload_date': {
                        '$gte': start_date,
                        '$lte': end_date
                    }
                }
            
            bills = list(self.collection.find(query).sort('upload_date', -1))
            
            # Convert ObjectId to string for JSON serialization
            for bill in bills:
                bill['_id'] = str(bill['_id'])
                
            return bills
        except Exception as e:
            print(f"Error fetching bills: {str(e)}")
            return []
    
    def update_bill(self, bill_id, updates):
        """Update a bill record"""
        try:
            result = self.collection.update_one(
                {"_id": ObjectId(bill_id)},
                {"$set": updates}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating bill: {str(e)}")
            return False
    
    def delete_bill(self, bill_id):
        """Delete a bill record"""
        try:
            result = self.collection.delete_one({"_id": ObjectId(bill_id)})
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting bill: {str(e)}")
            return False