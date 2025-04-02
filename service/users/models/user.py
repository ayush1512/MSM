from datetime import datetime

class User:
    def __init__(self, data):
        self.username = data.get('username')
        self.email = data.get('email')
        self.password = data.get('password')
        self.shop_name = data.get('shop_name')
        self.employees = data.get('employees', []) 
        self.manager_id = data.get('manager_id')
        self.medicines = data.get('medicines', [])
        self.prescriptions = data.get('prescriptions', [])
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

        if not self.username or not self.email or not self.password:
            raise ValueError("Username, email, and password are required.")
    
    def to_dict(self):
        return {
            'username': self.username,
            'email': self.email,
            'shop_name': self.shop_name,
            'employees': self.employees,
            'manager_id': self.manager_id,
            'medicines': self.medicines,
            'prescriptions': self.prescriptions,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
