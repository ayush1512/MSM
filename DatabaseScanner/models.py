from datetime import datetime

class Medicine:
    def __init__(self, product_name, product_manufactured, salt_composition, sub_category=None, 
                 product_price=None, medicine_desc=None, side_effects=None, drug_interactions=None):
        self.product_name = product_name
        self.product_manufactured = product_manufactured
        self.salt_composition = salt_composition
        self.sub_category = sub_category
        self.product_price = product_price
        self.medicine_desc = medicine_desc
        self.side_effects = side_effects.split(',') if isinstance(side_effects, str) else side_effects
        self.drug_interactions = drug_interactions
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def to_dict(self):
        return {
            "product_name": self.product_name,
            "product_manufactured": self.product_manufactured,
            "salt_composition": self.salt_composition,
            "sub_category": self.sub_category,
            "product_price": self.product_price,
            "medicine_desc": self.medicine_desc,
            "side_effects": self.side_effects,
            "drug_interactions": self.drug_interactions,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

class Stock:
    def __init__(self, medicine_id, batch_no, mfg_date, exp_date, mrp, quantity=0, image_url=None):
        self.medicine_id = medicine_id
        self.batch_no = batch_no
        self.mfg_date = mfg_date
        self.exp_date = exp_date
        self.mrp = mrp
        self.quantity = quantity
        self.image_url = image_url
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def to_dict(self):
        return {
            "medicine_id": self.medicine_id,
            "batch_no": self.batch_no,
            "mfg_date": self.mfg_date,
            "exp_date": self.exp_date,
            "mrp": self.mrp,
            "quantity": self.quantity,
            "image_url": self.image_url,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
