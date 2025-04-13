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

def upload_to_cloudinary(file, folder="prescriptions", resource_type="auto"):
    """Upload file to Cloudinary"""
    try:
        result = cloudinary.uploader.upload(
            file,
            folder=folder,
            resource_type=resource_type
        )
        return result
    except Exception as e:
        logging.error(f"Cloudinary upload error: {str(e)}")
        return None

def delete_from_cloudinary(public_id):
    """Delete file from Cloudinary by public_id"""
    try:
        result = cloudinary.uploader.destroy(public_id)
        logging.info(f"Deleted image from Cloudinary: {public_id}")
        return result
    except Exception as e:
        logging.error(f"Cloudinary delete error: {str(e)}")
        return None

def upload_user_profile_image(file_data, old_public_id=None):
    """
    Upload user profile image to Cloudinary 'users' folder
    If old_public_id is provided, delete the old image first
    
    Args:
        file_data: Base64 encoded image or file path
        old_public_id: Public ID of existing image to delete
        
    Returns:
        dict: Cloudinary upload result or None if failed
    """
    try:
        # Delete old image if exists
        if old_public_id:
            delete_result = delete_from_cloudinary(old_public_id)
            if not delete_result or delete_result.get('result') != 'ok':
                logging.warning(f"Failed to delete old profile image: {old_public_id}")
        
        # Upload new image
        result = cloudinary.uploader.upload(
            file_data,
            folder="users",
            resource_type="auto",
            transformation=[
                {"width": 200, "height": 200, "crop": "fill", "gravity": "face"}
            ]
        )
        return result
    except Exception as e:
        logging.error(f"Profile image upload error: {str(e)}")
        return None
