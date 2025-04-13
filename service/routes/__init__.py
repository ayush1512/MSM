from flask import Blueprint, jsonify
from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv
from .prescription import prescription_bp
from .users import user_bp, init_user_bp
from .bill_scanner import bill_scanner_bp, init_bill_scanner
load_dotenv()

# Create OAuth object to be used with the app
oauth = OAuth()

def init_routes(app):
    """Initialize routes"""
    # Initialize OAuth with the app
    oauth.init_app(app)
    
    # Attach the OAuth instance to the app itself
    app.oauth = oauth
    
    # Initialize user blueprint with app and OAuth
    init_user_bp(app, oauth)
    
    # Initialize bill scanner blueprint with app
    init_bill_scanner(app)
    
    # Register other blueprints
    app.register_blueprint(prescription_bp)
    app.register_blueprint(bill_scanner_bp, url_prefix='/bill-scanner')
    
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": f"Not Found:\n{e}"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": f"Internal Server Error \n {e}"}), 500

__all__ = ['init_routes']
