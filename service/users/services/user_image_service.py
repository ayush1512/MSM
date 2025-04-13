import logging
import re
from Prescription.services.cloudinary_service import upload_user_profile_image

def extract_public_id_from_url(cloudinary_url):
    """Extract public ID from Cloudinary URL"""
    if not cloudinary_url:
        return None
    
    # Pattern to match Cloudinary URL and extract public ID
    pattern = r'cloudinary\.com/[^/]+/image/upload/(?:v\d+/)?(.+?)(?:\.\w+)?$'
    match = re.search(pattern, cloudinary_url)
    
    if match:
        return match.group(1)
    return None

def process_user_profile_image(image_data, existing_image_url=None):
    """
    Process user profile image upload
    
    Args:
        image_data: Base64 encoded image data
        existing_image_url: URL of existing profile image
        
    Returns:
        dict: {url, public_id} if successful, None if failed
    """
    if not image_data:
        return None
    
    # Extract public_id if existing image is from Cloudinary
    old_public_id = None
    if existing_image_url and 'cloudinary.com' in existing_image_url:
        old_public_id = extract_public_id_from_url(existing_image_url)
    
    # Upload new image to Cloudinary
    result = upload_user_profile_image(image_data, old_public_id)
    
    if result and 'secure_url' in result and 'public_id' in result:
        return {
            'url': result['secure_url'],
            'public_id': result['public_id']
        }
    return None
