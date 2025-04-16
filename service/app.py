# Libraries for core functionality
from dotenv import load_dotenv
from routes import init_routes
from Prescription.services.db_service import DatabaseService
from flask_cors import CORS
from flask import Flask, render_template
import cloudinary
import cloudinary.uploader
import logging
import os

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.ERROR)

# Disable verbose logs
logging.getLogger("pymongo").setLevel(logging.WARNING)
logging.getLogger("pymongo.topology").setLevel(logging.ERROR)
logging.getLogger('together').setLevel(logging.ERROR)
logging.getLogger('urllib3').setLevel(logging.ERROR)

app = Flask(__name__)

# Session and cookie configuration
app.config.update(
    SESSION_COOKIE_SAMESITE='Lax',  # Use 'Lax' for local development
    SESSION_COOKIE_SECURE=False,     # False for HTTP (development)
    SESSION_COOKIE_HTTPONLY=True,    # Prevents JavaScript access
    PERMANENT_SESSION_LIFETIME=86400  # Session lasts for 1 day (in seconds)
)

# CORS configuration
CORS(app, 
     resources={
        r"/*": {
            "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "Accept"],
            "supports_credentials": True,
            "expose_headers": ["Content-Type", "X-CSRFToken"]
        }
     },
     supports_credentials=True
)

# Set secret key for session management
app.secret_key = os.getenv('SECRET_KEY', 'supersecretkey')

# Cloudinary configuration
cloudinary.config(
    cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key = os.getenv('CLOUDINARY_API_KEY'),
    api_secret = os.getenv('CLOUDINARY_API_SECRET')
)

# API keys configuration
together_api_key = os.getenv('TOGETHER_API_KEY')
app.config['TOGETHER_API_KEY'] = together_api_key

# Initialize database
app.db = DatabaseService()

# Initialize routes - all routes are now handled through blueprints
init_routes(app)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)