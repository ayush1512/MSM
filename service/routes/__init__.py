from flask import Blueprint, jsonify
from authlib.integrations.flask_client import OAuth
from .prescription import prescription_bp
from .users import user_bp, init_user_bp

# Create OAuth object to be used with the app
oauth = OAuth()

def init_routes(app):
    """Initialize routes"""
    # Initialize OAuth with the app
    oauth.init_app(app)
    
    # Initialize user blueprint with app and OAuth
    init_user_bp(app, oauth)
    
    # Register other blueprints
    app.register_blueprint(prescription_bp)
    
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Not Found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal Server Error"}), 500

__all__ = ['init_routes']
