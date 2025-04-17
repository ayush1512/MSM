import re
import logging
from fuzzywuzzy import fuzz, process

class ProductSearchHelper:
    """Helper class for improved product search functionality"""
    
    @staticmethod
    def simplify_product_name(full_name):
        """Extract the core product name by removing packaging and other details
        
        Args:
            full_name (str): Full product name with packaging details
            
        Returns:
            str: Simplified product name
        """
        if not full_name:
            return ""
            
        # Remove common packaging patterns
        patterns = [
            r'\d+x\d+g',       # e.g., 24x400g
            r'\d+x\d+ml',      # e.g., 10x5ml
            r'\d+x\d+',        # e.g., 10x5
            r'\d+g',           # e.g., 400g
            r'\d+ml',          # e.g., 200ml
            r'\d+mg',          # e.g., 500mg
            r'\d+pcs',         # e.g., 10pcs
            r'\d+\'S',         # e.g., 10'S
            r'BIB',            # Common term for baby formula packaging
            r'IN[A-Z0-9]+',    # e.g., INUE087 IN
            r'N\d+',           # e.g., N1
        ]
        
        result = full_name
        for pattern in patterns:
            result = re.sub(pattern, '', result, flags=re.IGNORECASE)
        
        # Remove multiple spaces and trim
        result = re.sub(r'\s+', ' ', result).strip()
        
        # Limit to first 3 words which typically contain the core product name
        words = result.split()
        if len(words) > 3:
            result = ' '.join(words[:3])
            
        return result
    
    @staticmethod
    def fuzzy_match_products(search_term, product_list, threshold=70):
        """Find best matching products using fuzzy string matching
        
        Args:
            search_term (str): Term to search for
            product_list (list): List of product dictionaries
            threshold (int): Minimum match score (0-100)
            
        Returns:
            list: Matching products above threshold
        """
        if not search_term or not product_list:
            return []
            
        # Extract product names from list
        product_names = [p.get('name', '') for p in product_list]
        
        # Find best matches
        matches = process.extractBests(
            search_term, 
            product_names, 
            scorer=fuzz.token_sort_ratio,
            score_cutoff=threshold
        )
        
        # Return matching products
        result = []
        for name, score in matches:
            for product in product_list:
                if product.get('name') == name:
                    product['match_score'] = score
                    result.append(product)
                    break
                    
        return result
