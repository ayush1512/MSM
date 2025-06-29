# Libraries for core functionality
from dotenv import load_dotenv
from routes import init_routes
from Prescription.services.db_service import DatabaseService
from flask_cors import CORS
from flask import Flask, render_template, request, jsonify
import cloudinary
import cloudinary.uploader
import logging
import os
import threading
import time
import requests
from datetime import datetime

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

@app.route('/bulk_entry')
def bulk_entry():
    """Render the bulk entry page"""
    return render_template('bulk_entry.html')

def keep_alive():
    """Sends a request to the server to keep it awake and prevent spindown."""
    def ping_server():
        while True:
            try:
                # Get the port and construct the URL
                port = int(os.getenv('PORT', 5000))
                base_url = os.getenv('https://msm-sf21.onrender.com', f'http://localhost:{port}')
                
                # Send a lightweight ping request
                response = requests.get(f"{base_url}/", timeout=30)
                if response.status_code == 200:
                    logging.info(f"Keep-alive ping successful at {datetime.now()}")
                else:
                    logging.warning(f"Keep-alive ping returned status {response.status_code}")
                    
            except requests.exceptions.RequestException as e:
                logging.error(f"Keep-alive ping failed: {e}")
            except Exception as e:
                logging.error(f"Unexpected error in keep-alive ping: {e}")
            
            # Wait 14 minutes before next ping (Render free tier spins down after 15 minutes)
            time.sleep(840)
    
    # Start the ping thread
    ping_thread = threading.Thread(target=ping_server, daemon=True)
    ping_thread.start()
    logging.info("Keep-alive service started")

if __name__ == '__main__':
    # Start the keep-alive service to prevent spindown
    keep_alive()

    # Get port from environment variable or use default
    port = int(os.getenv('PORT', 5000))
    # Set debug mode based on environment
    debug_mode = os.getenv('FLASK_ENV', 'production').lower() == 'development'
    
    app.run(
        debug=debug_mode,
        host='0.0.0.0', 
        port=port
    )