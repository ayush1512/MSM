import os
import secrets
from flask import Blueprint, request, jsonify, session, redirect, url_for, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from bson import ObjectId
from Prescription.services.db_service import DatabaseService
from users.models.user import User
from users.services.user_image_service import process_user_profile_image

from dotenv import load_dotenv
import logging
load_dotenv()

user_bp = Blueprint('user', __name__)

# Database variables will be set up during init_app
db_service = None
user_collection = None

# Initialize the blueprint with the app's database
def init_user_bp(app, oauth):
    global db_service, user_collection
    
    # Set up database connection using app's database service
    db_service = app.db
    user_collection = db_service.user_collection
    
    # Register OAuth provider with the app, not the blueprint
    oauth.register(
        "google",
        client_id=os.getenv('GOOGLE_CLIENT_ID'),
        client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
        authorize_url="https://accounts.google.com/o/oauth2/auth",
        access_token_url="https://oauth2.googleapis.com/token",
        userinfo_endpoint= "https://openidconnect.googleapis.com/v1/userinfo",
        redirect_uri="http://localhost:5000/google/callback",
        client_kwargs={"scope": "openid email profile"},
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    )
    
    # Register the blueprint with the app
    app.register_blueprint(user_bp)

# -----------------------------------
# Normal Signup
# -----------------------------------
@user_bp.route("/user/signup", methods=["POST"])
def user_signup():
    """Sign up a user"""
    data = request.json
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    
    # Fix session check and improve error message
    if "user" in session:
        current_user = session.get("user")
        return jsonify({
            "error": f"Already logged in as {current_user}. Please logout first.",
            "logged_in": True
        }), 400

    if not username or not email or not password:
        return jsonify({"error": "Username, Email, and Password are required"}), 400

    if user_collection.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 400

    password = generate_password_hash(password)

    new_user = {
        "username": username,
        "email": email,
        "password": password,
        "registration_mode": "Normal"
    }
    new_user = User(new_user)
    try:
        user_collection.insert_one(new_user.to_dict())
        session["user"] = email
        return jsonify({"message": "User registered successfully", "email": email}), 201
    except Exception as e:
        logging.error(f"Database save error: {str(e)}")
        raise

# -----------------------------------
# Normal Login
# -----------------------------------
@user_bp.route("/user/login", methods=["POST"])
def user_login():
    """Login a user with email and password"""
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if "user" in session:
        return jsonify({"error": "User already Logged In"}), 400

    if not email or not password:
        return jsonify({"error": "Email and Password are required"}), 400

    # Find user by email
    user = user_collection.find_one({"email": email})
    
    # Check if user exists
    if not user:
        return jsonify({"error": "User not found. Please sign up first!"}), 404
    
    # Check if user has a password (OAuth users don't have passwords)
    if user.get("password") is None:
        return jsonify({"error": "This account uses Google Sign-In. Please log in with Google."}), 400
        
    # Verify password
    if not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid password or email"}), 401

    # Login successful
    session["user"] = email
    return jsonify({"message": "Login successful", "email": email}), 200

# -----------------------------------
# Google OAuth
# -----------------------------------
@user_bp.route("/login/google")
def login_google():
    """Redirects to Google login"""
    nonce = secrets.token_urlsafe(16)
    session['nonce'] = nonce
    return current_app.oauth.google.authorize_redirect(redirect_uri=url_for("user.google_callback", _external=True), scope=["openid", "email", "profile"], nonce=nonce)

@user_bp.route("/google/callback")
def google_callback():
    """Handles Google OAuth callback"""
    token = current_app.oauth.google.authorize_access_token()
    if token:
        nonce = session.pop('nonce', None)
        if nonce:
            user_info = current_app.oauth.google.parse_id_token(token, nonce=nonce)

            if not user_info:
                return jsonify({"error": "Google authentication failed"}), 400

            email = user_info["email"]
            username = user_info.get("name", email.split("@")[0])

            # Check if user exists
            user = user_collection.find_one({"email": email})
            if not user:
                user_data = {
                    "username": username,
                    "email": email,
                    "password": None,
                    "registration_mode":"Google"
                }
                user_data=User(user_data)
                user_collection.insert_one(user_data.to_dict())

            session["user"] = email
            return redirect(f"{os.getenv('FRONTEND_URL')}admin/default")
        else:
            return jsonify({"error": "Nonce not found in session."}), 400
    return jsonify({"error": "Google authentication failed."}), 400

# -----------------------------------
# Checking login
# -----------------------------------

@user_bp.route("/check-login")
def check_login():
    if "user" in session:
        return jsonify({"email": session["user"]})
    return jsonify({"error": "Not logged in"}), 401

# -----------------------------------
# Logout Route
# -----------------------------------
@user_bp.route("/logout")
def logout():
    """Logout user"""
    session.pop("user", None)
    return jsonify({"message": "Logout successful"})


# -----------------------------------
# User Information
# -----------------------------------

@user_bp.route("/<email>/user_info")
def user_info(email):
    if "user" not in session:
        return jsonify({"error": "Not logged in"}), 401

    if session["user"] != email:
        return jsonify({"error": "Not authorized"}), 403

    try:
        result = user_collection.find_one({"email": email})
        
        if result:
            result['_id'] = str(result['_id'])
            result.pop('password')
            result.pop('registration_mode')
            return jsonify(result)
        
        return jsonify({
            "success": False,
            "error": "User does not exist"
        }), 404

    except Exception as e:
        logging.error(f"User info error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Failed to get user information",
            "details": str(e)
        }), 500


# -----------------------------------
# User Information Update
# -----------------------------------

@user_bp.route('/<email>/update_profile', methods=['PUT'])
def update_profile(email):
    """Update user profile, including profile image"""
    if not session.get('user'):
        return jsonify({"error": "Not logged in"}), 401
    
    if session["user"] != email:
        return jsonify({"error": "Not authorized"}), 403

    
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Verify user exists
        user = user_collection.find_one({"email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Process update fields
        update_data = {}
        
        # Handle regular fields
        for field in ['username', 'phone_no','shop_name']:
            if field in data:
                update_data[field] = data[field]
        
        # Handle profile image separately
        if 'image_data' in data and data['image_data']:
            existing_image_url = user.get('image_data').get('url')
            image_result = process_user_profile_image(data['image_data']['url'], existing_image_url)
            
            if image_result:
                update_data['image_data']={
                    'url' : image_result['url'],
                    'public_id' : image_result['public_id']
                }
            else:
                logging.error(f"Failed to process profile image for user {email}")
        
        # Only update if we have data to update
        if update_data:
            result = user_collection.update_one(
                {"email": email},
                {"$set": update_data}
            )
            
            if result.modified_count > 0:
                # Get updated user data
                updated_user = user_collection.find_one({"email": email})
                # Remove sensitive information
                if updated_user.get('password'):
                    del updated_user['password']
                updated_user['_id'] = str(updated_user['_id'])
                
                return jsonify({"success": True, "user": updated_user})
            
        return jsonify({"success": True, "message": "No changes made"})
            
    except Exception as e:
        logging.error(f"Update profile error: {str(e)}")
        return jsonify({"error": str(e)}), 500