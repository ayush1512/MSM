from flask import Flask
from dotenv import load_dotenv
import os
from routes import init_routes
from services.db_service import DatabaseService

# Load environment variables
load_dotenv()

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)
    
    
    # Initialize database
    app.db = DatabaseService()
    
    # Initialize routes
    init_routes(app)
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
