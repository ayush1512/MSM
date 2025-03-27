import os
from typing import List, Set
from difflib import get_close_matches
import logging

class MedicineKnowledgeBase:
    def __init__(self):
        self.medicine_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'product_names.txt')
        self.medicines: Set[str] = self._load_medicines()
        
    def _load_medicines(self) -> Set[str]:
        """Load medicine names from knowledge base"""
        try:
            if os.path.exists(self.medicine_file):
                with open(self.medicine_file, 'r') as file:
                    return set(line.strip() for line in file if line.strip())
            return set()
        except Exception as e:
            logging.error(f"Error loading medicine KB: {str(e)}")
            return set()

    def suggest_medicine(self, name: str, cutoff: float = 0.6) -> str:
        """Suggest correct medicine name based on knowledge base"""
        if not name or name == "Not specified":
            return name
            
        # First try exact match
        if name in self.medicines:
            return name
            
        # Try case-insensitive match
        medicines_lower = {m.lower(): m for m in self.medicines}
        if name.lower() in medicines_lower:
            return medicines_lower[name.lower()]
            
        # Try fuzzy matching
        matches = get_close_matches(name, self.medicines, n=1, cutoff=cutoff)
        if matches:
            logging.info(f"Suggesting {matches[0]} for {name}")
            return matches[0]
            
        return name

    def suggest_medicines_for_prescription(self, medications: List[dict]) -> List[dict]:
        """Suggest corrections for all medicines in a prescription"""
        if not medications:
            return medications
            
        corrected = []
        for med in medications:
            med_copy = med.copy()
            original_name = med_copy.get('name', '')
            suggested_name = self.suggest_medicine(original_name)
            
            if suggested_name != original_name:
                med_copy['original_name'] = original_name
                med_copy['name'] = suggested_name
                med_copy['suggested'] = True
            
            corrected.append(med_copy)
            
        return corrected
