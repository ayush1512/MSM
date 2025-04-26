from flask import Blueprint, request, jsonify, session, redirect, url_for, current_app
from datetime import datetime
from bson import ObjectId
from Prescription.services.db_service import DatabaseService

from dotenv import load_dotenv
import logging
load_dotenv()

customers_bp = Blueprint('customers', __name__)

# Database variables will be set up during init_app
db_service = None
customer_collection = None  # Changed from user_collection to customer_collection

# Initialize the blueprint with the app's database
def init_customers_bp(app, oauth=None):  # Made oauth parameter optional
    global db_service, customer_collection  # Changed to customer_collection
    
    # Set up database connection using app's database service
    db_service = app.db
    customer_collection = db_service.customers_collection  # Assign to the global variable
    app.register_blueprint(customers_bp)


@customers_bp.route("/customers", methods=["POST"])
def customers_creation():
    data = request.json
    shop_owner=session['user']
    customer_name=data.get('customerName')
    customer_number=data.get('customerNumber')
    customer_email=data.get('customerEmail')
    customer_address=data.get('customerAddress')
    
    if "user" not in session:
        return jsonify({"error": "Not logged in"}), 401

    new_customer={
        'customer_name':customer_name,
        'customer_number':customer_number,
        'customer_email':customer_email,
        'customer_address':customer_address,
        'shop_owner':shop_owner
        }
    try:
        customer_collection.insert_one(new_customer)
        return jsonify({"message": "Customer registered successfully", "number": customer_number}), 201
    except Exception as e:
        logging.error(f"Database customer save error: {str(e)}")
        raise

@customers_bp.route('/customers', methods=['GET'])
def customers_get():
    if 'user' not in session:
        return jsonify({'error': "Not logged in"}), 401

    try:
        # Get query parameters
        name_query = request.args.get('name', '')
        phone_query = request.args.get('phone', '')
        shop_owner = session['user']
        
        # Build filter query
        query = {'shop_owner': shop_owner}
        
        if name_query:
            # Case-insensitive search on name
            query['customer_name'] = {'$regex': name_query, '$options': 'i'}
        
        if phone_query:
            # Search on phone number
            query['customer_number'] = {'$regex': phone_query, '$options': 'i'}
        
        # If neither name nor phone provided, limit results
        if not name_query and not phone_query:
            customers = list(customer_collection.find(query).limit(100))
        else:
            customers = list(customer_collection.find(query))
        
        # Convert ObjectId to string for JSON serialization
        for customer in customers:
            if '_id' in customer:
                customer['_id'] = str(customer['_id'])
            
            # Map database fields to expected frontend field names
            customer['id'] = customer.get('_id')
            customer['name'] = customer.get('customer_name')
            customer['phone'] = customer.get('customer_number')
            customer['email'] = customer.get('customer_email')
            customer['address'] = customer.get('customer_address')
        
        return jsonify(customers)
    
    except Exception as e:
        logging.error(f"Error searching customers: {str(e)}")
        return jsonify({'error': f"Not able to find customers right now: {str(e)}"}), 500

@customers_bp.route('/customers/<id>', methods=['GET'])
def customer_info_by_id(id):  # Renamed function to avoid conflict
    if "user" not in session:
        return jsonify({"error": "Not logged in"}), 401

    try:
        customer = customer_collection.find_one({"_id": ObjectId(id)})
        if customer:
            customer['_id'] = str(customer['_id'])
            return jsonify(customer)
        else:
            return jsonify({'error': "Customer not found"}), 404

    except Exception as e:
        return jsonify({'error': f"Not able to find customer right now {e}"}), 500

@customers_bp.route('/customers/number/<num>', methods=['GET'])  # Changed route to avoid conflict
def customer_info_by_number(num):  # Renamed function to avoid conflict
    if "user" not in session:
        return jsonify({"error": "Not logged in"}), 401

    try:
        customer = customer_collection.find_one({'customer_number': num})
        if customer:
            customer['_id'] = str(customer['_id'])  # Ensure ID is serializable
            return jsonify(customer)
        else:
            return jsonify({'error': "Customer not found"}), 404

    except Exception as e:
        return jsonify({'error': f"Not able to find customer right now {e}"}), 500

@customers_bp.route('/customers/<id>', methods=['PUT'])
def update_customer(id):
    if "user" not in session:
        return jsonify({"error": "Not logged in"}), 401
    
    data = request.json
    
    try:

        if "user" not in session:
            return jsonify({"error": "Not logged in"}), 401

        # Check if customer exists
        customer = customer_collection.find_one({"_id": ObjectId(id)})
        if not customer:
            return jsonify({'error': "Customer not found"}), 404
        
        # Prepare update data
        update_data = {}
        if 'customerName' in data:
            update_data['customer_name'] = data['customerName']
        if 'customerNumber' in data:
            update_data['customer_number'] = data['customerNumber']
        if 'customerEmail' in data:
            update_data['customer_email'] = data['customerEmail']
        if 'customerAddress' in data:
            update_data['customer_address'] = data['customerAddress']
        if 'customerNotes' in data:
            update_data['customer_notes'] = data['customerNotes']
        
        # Add last updated timestamp
        update_data['updated_at'] = datetime.utcnow()
        
        # Update the customer
        result = customer_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": update_data}
        )
        
        if result.modified_count > 0:
            return jsonify({"message": "Customer updated successfully"}), 200
        else:
            return jsonify({"message": "No changes made to customer"}), 200
            
    except Exception as e:
        logging.error(f"Error updating customer: {str(e)}")
        return jsonify({'error': f"Failed to update customer: {str(e)}"}), 500