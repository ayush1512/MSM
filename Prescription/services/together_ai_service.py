import base64
import requests
import os
from dotenv import load_dotenv
from together import Together
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
import asyncio

load_dotenv()
class TogetherAIService:
    def __init__(self):
        self.client = Together(api_key=os.getenv("TOGETHER_API_KEY"))
        self.model = "meta-llama/Llama-Vision-Free"
        self.num_attempts = 3
        self.prompt = """You are an expert medical prescription analyzer. Please analyze this prescription carefully and provide the following information in a consistent, structured format:

HOSPITAL/CLINIC INFORMATION:
- Name: [Hospital/Clinic name]
- Address: [Full address if available]
- Contact: [Phone/Email if available]
- Registration/License: [Hospital registration number if available]

DOCTOR INFORMATION:
- Name: [Include Dr./Dr prefix]
- License/Registration Number: [Extract exact number]
- Specialization: [If mentioned]
- Contact: [If available]

PATIENT INFORMATION:
- Name: [Extract exact name]
- Age: [Extract age with unit (years/months)]
- Gender: [Extract or indicate if not specified]

PRESCRIPTION DETAILS:
- Date: [Format: DD MMM YYYY]
- Type: [OPD/IPD if specified]

MEDICATIONS:
For each medication, specify:
1. Name: [Include prefix (Tab./Syp.) and complete name]
2. Dosage: [Amount with units]
3. Frequency: [Times per day]
4. Duration: [Number of days/weeks]
5. Instructions: [Any specific instructions]

ADDITIONAL NOTES:
- Follow-up Date: [If mentioned]
- Special Instructions: [Any additional notes]
- Review Instructions: [When to review]

Please be precise and indicate 'not specified' for missing information. Extract ALL text visible in Hindi/English in English format."""

    def analyze_image(self, image_url):
        """Make multiple parallel API calls and combine results"""
        try:
            with ThreadPoolExecutor(max_workers=self.num_attempts) as executor:
                # Create multiple futures for parallel API calls
                futures = [
                    executor.submit(self._make_api_call, image_url)
                    for _ in range(self.num_attempts)
                ]
                
                # Collect all responses
                responses = []
                for future in as_completed(futures):
                    try:
                        result = future.result()
                        if result:
                            responses.append(result)
                    except Exception as e:
                        logging.error(f"API call error: {str(e)}")
                
                # Combine responses if we have any
                if responses:
                    combined_text = "\n\nITERATION RESULTS:\n\n".join(responses)
                    return combined_text
                    
            return None

        except Exception as e:
            logging.error(f"Together AI analysis error: {str(e)}")
            return None

    def _make_api_call(self, image_url):
        """Make a single API call to Together AI"""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": self.prompt
                            },
                            {
                                "type": "image_url",
                                "image_url": {"url": image_url}
                            }
                        ]
                    }
                ],
                temperature=0.3,
                max_tokens=2000
            )

            if hasattr(response, 'choices') and response.choices:
                return response.choices[0].message.content
            return None

        except Exception as e:
            logging.error(f"API call attempt error: {str(e)}")
            return None
