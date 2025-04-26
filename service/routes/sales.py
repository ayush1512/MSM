from flask import Blueprint, request, jsonify, session, redirect, url_for, current_app
from datetime import datetime
from Prescription.services.db_service import DatabaseService

from dotenv import load_dotenv
import logging
load_dotenv()

sales_bp = Blueprint('sales', __name__)

# Database variables will be set up during init_app
db_service = None
sales_collection = None
stock_collection = None

def init_sales_bp(app, oauth=None):  # Made oauth parameter optional
    global db_service, sales_collection, stock_collection
    
    # Set up database connection using app's database service
    db_service = app.db
    sales_collection = db_service.sales_collection
    stock_collection = db_service.stock_collection
    app.register_blueprint(sales_bp)

@sales_bp.route("/sales", methods=["POST"])
def sales():
    data = request.json
    shop_owner = session['user']
    customer_id = data.get('customerId')
    subtotal = data.get('subtotal')
    discount = data.get('discount')
    discount_format = data.get('discountFormat')
    total_amount = data.get('totalAmount')

    stock_medicines = []
    for medicine in data.get('medicines', []):
        stock_id = medicine.get('stock_id')
        quantity = medicine.get('quantity')
        
        stock_medicines.append({
            'stock_id': stock_id,
            'quantity': quantity
        })
        
        stock = stock_collection.find_one({"_id": stock_id})
        if stock:
            stock_collection.update_one(
                {"_id": stock_id},
                {"$set": {"quantity": stock['quantity'] - quantity}}
            )

    new_sales = {
        'shop_owner': shop_owner,
        'customer_id': customer_id,
        'stock_medicines': stock_medicines,
        'subtotal': subtotal,
        'discount': discount,
        'discount_format': discount_format,
        'total_amount': total_amount,
        'created_at': datetime.now()
    }

    try:
        sale = sales_collection.insert_one(new_sales)
        return jsonify({"message": "Successful", "sale_id": str(sale.inserted_id)}), 201
    except Exception as e:
        logging.error(f"Database sales save error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@sales_bp.route("/sales/<sale_id>", methods=["DELETE"])
def delete_sale(sale_id):
    try:
        # Check if the user has permission to delete this sale
        user = session.get('user')
        if not user:
            return jsonify({"error": "Unauthorized"}), 401
            
        # Find the sale
        sale = sales_collection.find_one({"_id": sale_id})
        if not sale:
            return jsonify({"error": "Sale not found"}), 404
            
        # Check if the sale belongs to this shop owner
        if sale.get('shop_owner') != user:
            return jsonify({"error": "Unauthorized to delete this sale"}), 403
            
        # Restore stock quantities
        for medicine in sale.get('stock_medicines', []):
            stock_id = medicine.get('stock_id')
            quantity = medicine.get('quantity')
            
            stock_collection.update_one(
                {"_id": stock_id},
                {"$inc": {"quantity": quantity}}
            )
            
        # Delete the sale
        result = sales_collection.delete_one({"_id": sale_id})
        
        if result.deleted_count > 0:
            return jsonify({"message": "Sale deleted successfully"}), 200
        else:
            return jsonify({"error": "Failed to delete sale"}), 500
            
    except Exception as e:
        logging.error(f"Error deleting sale: {str(e)}")
        return jsonify({"error": str(e)}), 500
