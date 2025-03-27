import cloudinary
import cloudinary.uploader
import os
import logging
from dotenv import load_dotenv

load_dotenv()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

def upload_to_cloudinary(file):
    """Upload file to Cloudinary"""
    try:
        result = cloudinary.uploader.upload(
            file,
            folder="prescriptions",
            resource_type="auto"
        )
        return result
    except Exception as e:
        logging.error(f"Cloudinary upload error: {str(e)}")
        return None
