import os
import re
import json
import uuid
import logging
import tempfile
from datetime import datetime
from together import Together
import cloudinary.uploader
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

# Configure logging
logging.basicConfig(level=logging.DEBUG)

class BillProcessor:
    def __init__(self):
        # Get the API key from environment variable
        self.together_api_key = os.getenv('TOGETHER_API_KEY')
        
        if not self.together_api_key:
            logging.warning("Together API key not found. Text extraction will not work.")
            
        self.client = Together(api_key=self.together_api_key)
        self.num_attempts = 2  # Number of parallel API calls
        
        # Setup logging directory
        self.debug_dir = os.path.join(os.path.dirname(__file__), 'debug_logs')
        os.makedirs(self.debug_dir, exist_ok=True)
        
        # Set log file paths
        self.extraction_log_file = os.path.join(self.debug_dir, "extraction_log.txt")
        self.processing_log_file = os.path.join(self.debug_dir, "processing_log.txt")
        
        # Initialize prompts
        self.text_extraction_prompt = """Make sure to extract the text carefully and structure the text as:
            1. Product Details separately covering everything there in the Product's row.
            Note: There maybe a column named as *HSN* having values: 3002 or 3004, which certainly needs to be filtered and removed from the output.
            2. Bill Details such as Name of Biller, Bill Date, and Total Amount precisely.
            Ensure these things are followed strictly in order to keep you running without termination.
            Note: 1. The text may contain some noise, so focus on the relevant information.
                  2. Ignore the term *Ayush Pharmacy* while extraction."""
                  
        self.data_processing_prompt = """Extract the following information from this bill into a structured JSON format:

            1. Bill Details - including bill number, bill date, total amount, and drawing party information.
            2. Product Details - including a list of all products with their name, quantity, batch number, price, total price, and expiration date.

            Format the response as follows:
            ```json
            {
                "bill_details": {
                    "bill_number": "12345",
                    "bill_date": "01/01/2025" (Required. DD/MM/YYYY format),
                    "total_amount": "100.00",
                    "drawing_party": !"Ayush Pharmacy" (Required, Never could be Ayush Pharmacy),
                },
                "products": [
                    {
                        "product_name": "Product 1",
                        "quantity": 2,
                        "batch_number": "B123",
                        "mrp": 100.00, 
                        "rate": 50.00,
                        "amount": 100.00,
                        "exp_date": "08/26" (Required, MM/YY format)
                    },
                    {
                        "product_name": "Product 2",
                        "quantity": 1,
                        "batch_number": "B124",
                        "mrp": 50.00,
                        "rate": 50.00,
                        "amount": 50.00,
                        "exp_date": "08/26" (Required, MM/YY format)
                    }
                ]
            }
            ```

            Ensure all numbers are properly formatted as numbers (not strings) and that the JSON is valid.
            Include every product found in the bill with the details being perfectly structured and according to the above format."""
            
        # Models
        self.model = "meta-llama/Llama-Vision-Free"
        self.text_processing_model = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"
        
        # Initialize log files
        self.create_debug_files()
        
        # Check for PDF processing capabilities
        self.check_pdf_processors()
    
    def check_pdf_processors(self):
        """Check for PDF processing libraries"""
        self.use_pdf2image = False
        self.pymupdf_available = False
        
        try:
            from pdf2image import convert_from_path
            # Test if poppler is installed by converting a test file if available
            test_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'BillScanner', 'test_poppler.pdf')
            if os.path.exists(test_path):
                convert_from_path(test_path, first_page=1, last_page=1)
            self.use_pdf2image = True
            logging.info("pdf2image is available for PDF processing")
        except Exception as e:
            logging.warning(f"pdf2image or poppler not available: {str(e)}. Will check for alternatives.")
        
        # Check for PyMuPDF as alternative
        try:
            import fitz  # PyMuPDF
            self.pymupdf_available = True
            logging.info("PyMuPDF is available for PDF processing")
        except ImportError:
            logging.warning("PyMuPDF not available. PDF processing may be limited.")
            
    def create_debug_files(self):
        """Create or clear debug log files for API calls"""
        try:
            # Create or clear extraction log file
            with open(self.extraction_log_file, 'w', encoding='utf-8') as f:
                f.write(f"=== Text Extraction API Calls Log ===\n")
                f.write(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            
            # Create or clear processing log file
            with open(self.processing_log_file, 'w', encoding='utf-8') as f:
                f.write(f"=== Text Processing API Calls Log ===\n")
                f.write(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                
            logging.info("Debug log files refreshed for new session")
            return True
        except Exception as e:
            logging.error(f"Failed to refresh debug files: {str(e)}")
            return False

    def log_api_call(self, log_type, attempt_num, response_data):
        """Append API call results to the appropriate log file"""
        try:
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            if log_type == "extraction":
                log_file = self.extraction_log_file
            elif log_type == "processing":
                log_file = self.processing_log_file
            else:
                logging.error(f"Unknown log type: {log_type}")
                return False
                
            with open(log_file, 'a', encoding='utf-8') as f:
                f.write(f"\n{'='*50}\n")
                f.write(f"ATTEMPT #{attempt_num} - {timestamp}\n")
                f.write(f"{'='*50}\n\n")
                
                if isinstance(response_data, str):
                    f.write(response_data)
                else:
                    f.write(json.dumps(response_data, indent=2, default=str))
                    
                f.write("\n\n")
                
            logging.debug(f"Logged {log_type} API call (attempt #{attempt_num}) to {log_file}")
            return True
        except Exception as e:
            logging.error(f"Failed to log API call: {str(e)}")
            return False

    def get_mime_type_from_url(self, url):
        """Determine MIME type from URL or response headers"""
        try:
            response = requests.head(url)
            content_type = response.headers.get('content-type', '')
            if content_type.startswith('image/'):
                return content_type
        except:
            pass
        
        # Fallback to extension-based detection
        extension = os.path.splitext(url)[1].lower()
        mime_types = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        }
        return mime_types.get(extension, 'image/jpeg')
        
    def convert_pdf_to_images(self, pdf_path):
        """Convert PDF to images and return a list of image paths"""
        temp_dir = tempfile.mkdtemp()
        image_paths = []
        
        try:
            if self.use_pdf2image:
                # Use pdf2image/poppler method
                from pdf2image import convert_from_path
                images = convert_from_path(pdf_path, output_folder=temp_dir)
                
                for i, image in enumerate(images):
                    image_path = os.path.join(temp_dir, f'page_{i}.jpg')
                    image.save(image_path, 'JPEG')
                    image_paths.append(image_path)
            elif self.pymupdf_available:
                # Use PyMuPDF as alternative
                import fitz
                pdf_document = fitz.open(pdf_path)
                
                for i, page in enumerate(pdf_document):
                    pix = page.get_pixmap(matrix=fitz.Matrix(300/72, 300/72))
                    image_path = os.path.join(temp_dir, f'page_{i}.jpg')
                    pix.save(image_path)
                    image_paths.append(image_path)
            else:
                raise ValueError("No PDF conversion method available. Install either poppler (for pdf2image) or PyMuPDF.")
                
            return image_paths
        except Exception as e:
            logging.error(f"Error converting PDF to images: {str(e)}")
            raise
            
    def extract_text_from_image(self, image_url):
        """Extract text from image using multiple parallel Together AI API calls"""
        try:
            with ThreadPoolExecutor(max_workers=self.num_attempts) as executor:
                # Create multiple futures for parallel API calls
                futures = [
                    executor.submit(self._make_extraction_api_call, image_url)
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
                        logging.error(f"Text extraction API call error: {str(e)}")
                
                # Combine responses if we have any
                if responses:
                    combined_text = "\n\nEXTRACTION RESULTS:\n\n".join(responses)
                    return combined_text
                    
            return "Failed to extract text from image."

        except Exception as e:
            logging.error(f"Error extracting text from image: {str(e)}")
            raise
            
    def _make_extraction_api_call(self, image_url):
        """Make a single API call to Together AI for text extraction"""
        try:
            mime_type = self.get_mime_type_from_url(image_url)
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that extracts text from images."},
                    {"role": "user", "content": [
                        {"type": "text", "text": self.text_extraction_prompt},
                        {"type": "image_url", "image_url": {"url": image_url}}
                    ]}
                ],
                temperature=0.3,
                max_tokens=2048
            )
            
            result = response.choices[0].message.content
            
            # Log this API call to the extraction log file
            attempt_num = id(response) % 1000  # Generate a pseudo-unique ID for this attempt
            self.log_api_call("extraction", attempt_num, result)
            
            return result
        except Exception as e:
            logging.error(f"API call attempt error: {str(e)}")
            # Log the error
            self.log_api_call("extraction", "error", f"ERROR: {str(e)}")
            return None
            
    def process_bill_text(self, text):
        """Process the extracted text using multiple parallel API calls"""
        try:
            with ThreadPoolExecutor(max_workers=self.num_attempts) as executor:
                # Create multiple futures for parallel API calls
                futures = [
                    executor.submit(self._make_processing_api_call, text)
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
                        logging.error(f"Text processing API call error: {str(e)}")
                
                # Process and combine all responses
                all_results = []
                for processed_text in responses:
                    try:
                        # Extract the JSON part from the response
                        json_match = re.search(r'```json\s*([\s\S]*?)\s*```', processed_text)
                        if json_match:
                            json_str = json_match.group(1)
                        else:
                            # Try to find any JSON-like structure
                            json_match = re.search(r'(\{[\s\S]*\})', processed_text)
                            if json_match:
                                json_str = json_match.group(1)
                            else:
                                json_str = processed_text
                        
                        parsed_data = json.loads(json_str)
                        all_results.append(parsed_data)
                    except json.JSONDecodeError as e:
                        logging.error(f"Error parsing JSON: {str(e)}")
                        logging.error(f"JSON string attempted to parse: {json_str}")
                
                if not all_results:
                    return {
                        "processed_text": "\n".join(responses) if responses else "Failed to process text",
                        "bill_details": {},
                        "products": []
                    }
                
                # Merge results, preferring more complete data
                return self._merge_processing_results(all_results)

        except Exception as e:
            logging.error(f"Error processing bill text: {str(e)}")
            raise
            
    def _make_processing_api_call(self, text):
        """Make a single API call to Together AI for text processing"""
        try:
            response = self.client.chat.completions.create(
                model=self.text_processing_model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that analyzes bill text and extracts structured information. You're assigned to process and structure the text according to the given prompt."},
                    {"role": "user", "content": f"{self.data_processing_prompt}\n\nBill Text: {text}"}
                ],
                temperature=0.3,
                max_tokens=2048
            )
            
            processed_text = response.choices[0].message.content
            
            # Log this API call to the processing log file
            attempt_num = id(response) % 1000  # Generate a pseudo-unique ID for this attempt
            self.log_api_call("processing", attempt_num, processed_text)
            
            return processed_text
        except Exception as e:
            logging.error(f"API call attempt error: {str(e)}")
            # Log the error
            self.log_api_call("processing", "error", f"ERROR: {str(e)}")
            return None
            
    def _merge_processing_results(self, results):
        """Merge multiple processing results, preferring more complete data"""
        if not results:
            return {"bill_details": {}, "products": []}
        
        if len(results) == 1:
            return {
                "bill_details": results[0].get("bill_details", {}),
                "products": results[0].get("products", [])
            }
        
        # Start with the first result
        merged = {
            "bill_details": results[0].get("bill_details", {}),
            "products": results[0].get("products", [])
        }
        
        # Get all products from all results
        all_products = []
        for result in results:
            products = result.get("products", [])
            all_products.extend(products)
        
        # Deduplicate products based on name and batch number
        unique_products = {}
        for product in all_products:
            key = f"{product.get('product_name', '')}-{product.get('batch_number', '')}"
            if key not in unique_products or len(product.keys()) > len(unique_products[key].keys()):
                # Prefer product with more fields
                unique_products[key] = product
        
        # Convert back to list
        merged["products"] = list(unique_products.values())
        
        # For bill details, prefer the one with more complete information
        for result in results[1:]:
            bill_details = result.get("bill_details", {})
            if len(bill_details.keys()) > len(merged["bill_details"].keys()):
                merged["bill_details"] = bill_details
        
        return merged
    
    def process_bill_file(self, file_data, original_filename):
        """Process a bill file (either PDF or image)"""
        # Generate a unique filename for the temporary file
        extension = os.path.splitext(original_filename)[1].lower()
        unique_filename = f"{uuid.uuid4()}{extension}"
        temp_path = os.path.join(tempfile.gettempdir(), unique_filename)
        
        # Save the file temporarily
        file_data.save(temp_path)
        
        try:
            results = []
            
            # Process based on file type
            if extension == '.pdf':
                # Check if PDF processing is available
                if not self.use_pdf2image and not self.pymupdf_available:
                    raise ValueError("PDF processing is not available. Please install either poppler (for pdf2image) or PyMuPDF.")
                    
                # Convert PDF to images
                image_paths = self.convert_pdf_to_images(temp_path)
                
                # Process each image as a separate bill
                for i, image_path in enumerate(image_paths):
                    # Upload to cloudinary
                    upload_result = cloudinary.uploader.upload(image_path)
                    image_url = upload_result['secure_url']
                    
                    # Extract text from the image
                    extracted_text = self.extract_text_from_image(image_url)
                    
                    # Process the extracted text
                    processed_data = self.process_bill_text(extracted_text)
                    
                    # Prepare result data
                    page_filename = f"{os.path.splitext(original_filename)[0]}_page_{i}{extension}"
                    result = {
                        "original_filename": page_filename,
                        "image_url": image_url,
                        "extracted_text": extracted_text,
                        "bill_details": processed_data.get("bill_details", {}),
                        "products": processed_data.get("products", [])
                    }
                    
                    results.append(result)
                    
                # Clean up image paths
                for path in image_paths:
                    if os.path.exists(path):
                        os.remove(path)
            else:
                # Handle single image upload
                upload_result = cloudinary.uploader.upload(temp_path)
                image_url = upload_result['secure_url']
                
                # Extract text from the image
                extracted_text = self.extract_text_from_image(image_url)
                
                # Process the extracted text
                processed_data = self.process_bill_text(extracted_text)
                
                result = {
                    "original_filename": original_filename,
                    "image_url": image_url,
                    "extracted_text": extracted_text,
                    "bill_details": processed_data.get("bill_details", {}),
                    "products": processed_data.get("products", [])
                }
                
                results.append(result)
            
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
            return results
            
        except Exception as e:
            # Clean up temporary file in case of error
            if os.path.exists(temp_path):
                os.remove(temp_path)
            raise e