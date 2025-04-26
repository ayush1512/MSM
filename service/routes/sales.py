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

def init_user_bp(app, oauth):
    global db_service, sales_collection
    
    # Set up database connection using app's database service
    db_service = app.db
    user_collection = db_service.sales_collection
    app.register_blueprint(sales_bp)

@sales_bp.route("/sales", methods=["POST"])
def sales():
    data= request.json
    shop_woner=session['user']
    customer_id=data.get('customerId')
    stock_id=data.get('stockId')
    subtotal=data.get('subtotal')
    discount=data.get('discount')
    discount_format=data.get('discountFormat')
    total_amount=data.get('totalAmount')

    new_satles={
        'shop_woner':shop_woner,
        'customer_id': customer_id,
        'stock_id': stock_id,
        'subtotal': subtotal,
        'discount': discount,
        'discount_format': discount_format,
        'total_amount': total_amount
    }

    