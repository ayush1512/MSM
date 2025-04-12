from datetime import datetime

class User:
    def __init__(self,data, image_data=None):
        self.username = data.get('username')
        self.email = data.get('email')
        self.phone_no=data.get('phone_no')
        self.password = data.get('password')
        self.shop_name = data.get('shop_name')
        self.employees = data.get('employees', []) 
        self.manager_email = data.get('manager_email')
        self.medicines = data.get('medicines', [])
        self.prescriptions = data.get('prescriptions', [])
        self.registration_mode= data.get('registration_mode')
        self.image_data = image_data or None
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

        if not self.username or not self.email:
            if self.registration_mode == "Normal" and not self.password:
                raise ValueError("Username, email, and password are required.")
    
    def to_dict(self):
        return {
            'username': self.username,
            'email': self.email,
            'phone_no':self.phone_no,
            'password': self.password,
            'shop_name': self.shop_name,
            'employees': self.employees,
            'manager_email': self.manager_email,
            'medicines': self.medicines,
            'prescriptions': self.prescriptions,
            'registration_mode': self.registration_mode,
            'image_data': self.image_data,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
