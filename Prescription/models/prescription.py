from datetime import datetime

class Prescription:
    def __init__(self, data, image_data=None):
        self.hospital_info = data.get('hospital_info')
        self.doctor_info = data.get('doctor_info')
        self.patient_info = data.get('patient_info')
        self.prescription_details = data.get('prescription_details')
        self.medications = data.get('medications', [])
        self.additional_notes = data.get('additional_notes')
        self.image_data = image_data or {}
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def to_dict(self):
        return {
            'hospital_info': self.hospital_info,
            'doctor_info': self.doctor_info,
            'patient_info': self.patient_info,
            'prescription_details': self.prescription_details,
            'medications': self.medications,
            'additional_notes': self.additional_notes,
            'image_data': self.image_data,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
