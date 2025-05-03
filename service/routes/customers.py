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
sales_collection = None  # Add sales collection

# Initialize the blueprint with the app's database
def init_customers_bp(app, oauth=None):  # Made oauth parameter optional
    global db_service, customer_collection, sales_collection  # Added sales_collection
    
    # Set up database connection using app's database service
    db_service = app.db
    customer_collection = db_service.customers_collection
    sales_collection = db_service.sales_collection  # Get sales collection
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
            customers = list(customer_collection.find(query))
        else:
            customers = list(customer_collection.find(query))
        
        # Convert ObjectId to string for JSON serialization and enhance with purchase data
        for customer in customers:
            if '_id' in customer:
                customer['_id'] = str(customer['_id'])
            
            # Map database fields to expected frontend field names
            customer['id'] = customer.get('_id')
            customer['name'] = customer.get('customer_name')
            customer['phone'] = customer.get('customer_number')
            customer['email'] = customer.get('customer_email')
            customer['address'] = customer.get('customer_address')
            
            # Get customer's sales history
            customer_id = customer['_id']
            sales = list(sales_collection.find(
                {'customer_id': customer_id, 'shop_owner': shop_owner}
            ).sort('date', -1))  # Sort by date descending to get most recent first
            
            # Calculate last purchase date
            if sales:
                # Get the most recent sale date
                last_sale = sales[0]
                customer['lastPurchase'] = last_sale.get('created_at')
                
                # Calculate total spent
                total_spent = sum(sale.get('total_amount', 0) for sale in sales)
                customer['totalSpent'] = str(round(total_spent, 2))
            else:
                # No sales history
                customer['lastPurchase'] = None
                customer['totalSpent'] = "0.00"
        
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
            customer['name'] = customer.get('customer_name')
            customer['phone'] = customer.get('customer_number')
            customer['email'] = customer.get('customer_email')
            customer['address'] = customer.get('customer_address')
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

@customers_bp.route('/customers/top', methods=['GET'])
def get_top_customers():
    if 'user' not in session:
        return jsonify({'error': "Not logged in"}), 401

    try:
        limit = int(request.args.get('limit', 5))  # Default to top 5 customers
        shop_owner = session['user']
        
        # Get all customers with their sales data
        customers = list(customer_collection.find({'shop_owner': shop_owner}))
        
        # Calculate total spent for each customer by analyzing sales data
        for customer in customers:
            customer_id = str(customer['_id'])
            
            # Find all sales for this customer
            sales = list(sales_collection.find(
                {'customer_id': customer_id, 'shop_owner': shop_owner}
            ))
            
            # Calculate total spent
            total_spent = sum(sale.get('total_amount', 0) for sale in sales)
            customer['totalSpent'] = total_spent
            customer['orders'] = len(sales)
        
        # Sort customers by total spent in descending order
        customers.sort(key=lambda x: x.get('totalSpent', 0), reverse=True)
        
        # Take only the top N customers
        top_customers = customers[:limit]
        
        # Format data for frontend
        formatted_customers = []
        for customer in top_customers:
            formatted_customers.append({
                'id': str(customer['_id']),
                'name': customer.get('customer_name', 'Unknown'),
                'email': customer.get('customer_email', ''),
                'spent': str(round(customer.get('totalSpent', 0), 2)),
                'orders': customer.get('orders', 0),
                'value': str(round(customer.get('totalSpent', 0), 2)),  # Duplicate for compatibility
                'image': None,  # No images stored yet
                'initials': ''.join([name[0].upper() for name in customer.get('customer_name', 'U').split(' ') if name])[:2]
            })
        
        return jsonify(formatted_customers), 200
        
    except Exception as e:
        logging.error(f"Error fetching top customers: {str(e)}")
        return jsonify({'error': f"Unable to fetch top customers: {str(e)}"}), 500

@customers_bp.route('/customers/recent-activity', methods=['GET'])
def get_recent_activity():
    if 'user' not in session:
        return jsonify({'error': "Not logged in"}), 401

    try:
        limit = int(request.args.get('limit', 5))  # Default to 5 recent activities
        shop_owner = session['user']
        
        # Get recent sales ordered by date (newest first)
        recent_sales = list(sales_collection.find(
            {'shop_owner': shop_owner}
        ).sort('created_at', -1).limit(limit))
        
        # Format activities for frontend
        activities = []
        for sale in recent_sales:
            # Get customer details
            customer_id = sale.get('customer_id')
            customer = customer_collection.find_one({'_id': ObjectId(customer_id)}) if customer_id else None
            
            customer_name = 'Walk-in Customer'
            if customer:
                customer_name = customer.get('customer_name', 'Unknown Customer')
            
            # Create activity record
            activity = {
                'id': str(sale['_id']),
                'name': customer_name,
                'action': 'Placed Order',
                'value': float(sale.get('total_amount', 0)),
                'time': calculate_time_ago(sale.get('created_at')),
                'image': None,  # No images stored yet
            }
            activities.append(activity)
        
        return jsonify(activities), 200
        
    except Exception as e:
        logging.error(f"Error fetching recent activity: {str(e)}")
        return jsonify({'error': f"Unable to fetch recent activity: {str(e)}"}), 500

# Helper function to calculate time ago for recent activities
def calculate_time_ago(timestamp):
    if not timestamp:
        return "Unknown"
    
    try:
        # Parse the timestamp
        if isinstance(timestamp, str):
            # Handle different date formats
            try:
                # Try ISO format first
                activity_time = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            except ValueError:
                try:
                    # Try other common formats
                    from dateutil import parser
                    activity_time = parser.parse(timestamp)
                except Exception as parse_error:
                    logging.error(f"Failed to parse timestamp: {timestamp}, error: {str(parse_error)}")
                    return "Recently"
        else:
            activity_time = timestamp
            
        now = datetime.utcnow()
        diff = now - activity_time
        
        # Return time difference in a readable format
        if diff.days > 0:
            return f"{diff.days}d" if diff.days == 1 else f"{diff.days}d"
        elif diff.seconds >= 3600:
            hours = diff.seconds // 3600
            return f"{hours}h"
        elif diff.seconds >= 60:
            minutes = diff.seconds // 60
            return f"{minutes}m"
        else:
            return f"{diff.seconds}s"
    except Exception as e:
        logging.error(f"Error calculating time ago: {str(e)}")
        return "Recently"