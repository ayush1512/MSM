from flask import Blueprint, jsonify
from .prescription import prescription_bp

def init_routes(app):
    """Initialize routes"""
    # Register the blueprint without additional prefix
    app.register_blueprint(prescription_bp)
    
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Not Found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal Server Error"}), 500

__all__ = ['init_routes']
