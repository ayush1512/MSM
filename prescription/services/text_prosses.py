import base64
import requests
import os
import re
import json
import logging
from dotenv import load_dotenv
from together import Together
import asyncio
from models.prescription import Prescription

load_dotenv()
class TextProsses:
    def __init__(self):
        self.client = Together(api_key=os.getenv("TOGETHER_API_KEY"))
        self.model = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"
        self.prompt =""" You are an expert in medical prescription analysis. Given the raw prescription text below, extract structured data in strict JSON format using the schema provided.

### JSON Output Schema:
{
    "hospital_info": {
        "name": string,
        "address": string,
        "contact": string,
        "registration": string
    },
    "doctor_info": {
        "name": string,
        "license_number": string,
        "specialization": string,
        "contact": string
    },
    "patient_info": {
        "name": string,
        "age": string,
        "gender": string
    },
    "prescription_details": {
        "date": string,
        "type": string
    },
    "medications": [
        {
            "name": string,
            "dosage": string,
            "frequency": string,
            "duration": string,
            "instructions": string
        }
    ],
    "additional_notes": {
        "follow_up_date": string,
        "special_instructions": string,
        "review_instructions": string
    }
}

### **Extraction Guidelines:**
1. **Confidence-Based Selection:** If multiple extracted values exist for the same field, select the most frequently occurring or contextually valid option.  
2. **Handling Missing or Unclear Data:**  
   - If a field is truly missing, set it to `null`.  
   - If partial data exists, retain what is available rather than replacing it with `null` or `"Not specified"`.  
   - Use context clues to infer values when possible (e.g., "Dr. Sharma, MD" → specialization = "MD").  
3. **Medication Handling:**  
   - Ensure all medication details (name, dosage, frequency, duration, instructions) are complete.  
   - If a value is missing but inferable from context, include it.  
4. **Ensure Valid JSON:** The final output must be **strictly valid JSON** without explanations or formatting errors.  

### **Prescription Text for Analysis:**  
"""



    def _extract_value(self, text, pattern, default="Not specified"):
        """Extract value from text using pattern matching"""
        try:
            matches = re.findall(f"{pattern}.*?([^\n]+)", text, re.IGNORECASE | re.MULTILINE)
            return matches[-1].strip() if matches else default
        except Exception as e:
            logging.error(f"Pattern matching error: {str(e)}")
            return default

    def _extract_medications(self, text):
        """Extract medications list from text using improved pattern matching"""
        try:
            medications = []
            seen_meds = set()  # Track unique medications
            
            med_pattern = r'\d+\.\s+\*\*([^*]+)\*\*\s*(?:\n|\r\n)(?:\s*\*[^\n]*Name:[^\n]*([^\n]+)\n\s*\*[^\n]*Dosage:[^\n]*([^\n]+)\n\s*\*[^\n]*Frequency:[^\n]*([^\n]+)\n\s*\*[^\n]*Duration:[^\n]*([^\n]+)\n\s*\*[^\n]*Instructions:[^\n]*([^\n]+))'
            
            try:
                med_blocks = re.finditer(med_pattern, text, re.MULTILINE)
                for match in med_blocks:
                    med_name = match.group(2).strip() if match.group(2) else match.group(1).strip()
                    if med_name in seen_meds or med_name == "Not specified":
                        continue
                    
                    seen_meds.add(med_name)
                    medications.append({
                        "name": med_name,
                        "dosage": self._clean_value(match.group(3)),
                        "frequency": self._clean_value(match.group(4)),
                        "duration": self._clean_value(match.group(5)),
                        "instructions": self._clean_value(match.group(6))
                    })
            except Exception as e:
                logging.error(f"Medication extraction error: {str(e)}")
            
            return medications if medications else [{"name": "Not specified", "dosage": "Not specified", "frequency": "Not specified", "duration": "Not specified", "instructions": "Not specified"}]
            
        except Exception as e:
            logging.error(f"Medication processing error: {str(e)}")
            return [{"name": "Not specified", "dosage": "Not specified", "frequency": "Not specified", "duration": "Not specified", "instructions": "Not specified"}]

    def _clean_value(self, value):
        """Clean and normalize extracted values"""
        try:
            if not value:
                return "Not specified"
            
            cleaned = value.strip()
            if "**" in cleaned:
                cleaned = cleaned.split("**")[0]
            
            cleaned = re.sub(r'\s+', ' ', cleaned)
            cleaned = re.sub(r'\*\s*Name:.*$', '', cleaned)
            
            return cleaned.strip() or "Not specified"
        except Exception as e:
            logging.error(f"Value cleaning error: {str(e)}")
            return "Not specified"

    def _clean_json_string(self, json_string):
        """Clean JSON string by removing markdown code blocks"""
        try:
            # Remove markdown code block markers
            cleaned = json_string.replace('```json\n', '').replace('\n```', '').strip()
            return cleaned
        except Exception as e:
            logging.error(f"JSON string cleaning error: {str(e)}")
            return json_string

    def analyze_text(self, raw_text, db_service=None):
        """Analyze prescription text and optionally save to database"""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": f"{self.prompt}\n\n{raw_text}"
                    }
                ],
                temperature=0.3,
                max_tokens=2000
            )

            if hasattr(response, 'choices') and response.choices:
                result = response.choices[0].message.content
                try:
                    cleaned_json = self._clean_json_string(result)
                    parsed_json = json.loads(cleaned_json)
                    
                    # Save to database if db_service is provided
                    if db_service:
                        try:
                            prescription = Prescription(parsed_json)
                            prescription_id = db_service.save_prescription(prescription.to_dict())
                            parsed_json['_id'] = prescription_id
                        except Exception as e:
                            logging.error(f"Database save error: {str(e)}")
                    
                    return {"success": True, "prescription_id": prescription_id, "data": parsed_json}
                except json.JSONDecodeError as je:
                    logging.error(f"JSON parsing error: {str(je)}")
                    return {"error": "Invalid JSON format in response", "raw_result": result}

            return {"error": "No response from AI model"}

        except Exception as e:
            logging.error(f"Text analysis error: {str(e)}")
            return {"error": f"Analysis failed: {str(e)}"}
