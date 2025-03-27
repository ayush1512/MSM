import os
import logging
from typing import Set

class MedicineService:
    def __init__(self, db_service):
        self.db_service = db_service
        self.medicine_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'product_names.txt')
        self.known_medicines: Set[str] = self._load_known_medicines()

    def _load_known_medicines(self) -> Set[str]:
        """Load existing medicine names from file"""
        try:
            if os.path.exists(self.medicine_file):
                with open(self.medicine_file, 'r') as file:
                    return set(line.strip() for line in file if line.strip())
            return set()
        except Exception as e:
            logging.error(f"Error loading medicines: {str(e)}")
            return set()

    def update_medicines(self, new_medicines: list) -> bool:
        """Update medicine list if new medicines are found"""
        try:
            # Get medicine names from the new prescriptions
            new_names = {med['name'] for med in new_medicines if med.get('name')}
            
            # Find genuinely new medicines
            actual_new = new_names - self.known_medicines
            
            if actual_new:
                # Update the set and file
                self.known_medicines.update(actual_new)
                with open(self.medicine_file, 'a') as file:
                    for name in actual_new:
                        file.write(f"{name}\n")
                
                logging.info(f"Added {len(actual_new)} new medicines to database")
                return True
                
            return False
            
        except Exception as e:
            logging.error(f"Error updating medicines: {str(e)}")
            return False
