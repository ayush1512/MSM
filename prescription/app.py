from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from routes import init_routes
from services.db_service import DatabaseService

# Load environment variables
load_dotenv()

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)
    
    # Enable CORS
    CORS(app, resources={
        r"/*": {
            "origins": "*",
            "methods": ["GET", "POST", "OPTIONS", "PUT"],
            "allow_headers": ["Content-Type", "Accept"]
        }
    })
    
    # Initialize database
    app.db = DatabaseService()
    
    # Initialize routes
    init_routes(app)
    
    # Add error handlers
    @app.errorhandler(Exception)
    def handle_error(error):
        logging.error(f"Unhandled error: {str(error)}")
        return jsonify({"success": False, "error": str(error)}), 500
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
