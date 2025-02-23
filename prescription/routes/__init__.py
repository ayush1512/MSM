from flask import Flask
from .prescription import prescription_bp

def init_routes(app: Flask):
    """Initialize all route blueprints"""
    app.register_blueprint(prescription_bp)

__all__ = ['init_routes']
