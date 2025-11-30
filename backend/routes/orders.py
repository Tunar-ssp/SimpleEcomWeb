from flask import Blueprint, request, jsonify
from datetime import datetime
from ..utils import (
    load_json, save_json, find_user_cart, find_user, find_product,
    CARTS_FILE, ORDERS_FILE, PRODUCTS_FILE, USERS_FILE
)

orders_bp = Blueprint('orders', __name__)

@orders_bp.route("/checkout", methods=["POST"])
def checkout():
    data = request.get_json()
    username = data.get("username")

    if not username:
        return jsonify({"error": "Username required"}), 400

    user = find_user(username)
    if not user:
        return jsonify({"error": "User not found"}), 404

    carts = load_json(CARTS_FILE)
    user_cart = next((c for c in carts if c["username"] == username), None)
    
    if not user_cart or not user_cart.get("cart"):
        return jsonify({"error": "Cart is empty"}), 400

    products = load_json(PRODUCTS_FILE)
    total = 0
    order_items = []
    
    for item in user_cart["cart"]:
        product_id = item["product_id"]
        quantity = item["quantity"]
        product = find_product(product_id)
        
        if not product:
            return jsonify({"error": f"Product {product_id} not found"}), 404
        
        if product.get("stock", 0) < quantity:
            return jsonify({"error": f"Not enough stock for {product['title']}"}), 400
        
        total += product["price"] * quantity
        product["stock"] -= quantity
        product["sold"] = product.get("sold", 0) + quantity
        order_items.append({
            "product_id": product_id,
            "title": product["title"],
            "quantity": quantity,
            "price": product["price"]
        })

    orders = load_json(ORDERS_FILE)
    new_order = {
        "order_id": len(orders) + 1,
        "username": username,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "items": order_items,
        "total_price": total
    }
    orders.append(new_order)
    
    save_json(PRODUCTS_FILE, products)
    save_json(ORDERS_FILE, orders)
    
    user_cart["cart"] = []
    save_json(CARTS_FILE, carts)

    return jsonify({"message": "Order placed successfully", "order": new_order}), 201

@orders_bp.route("/orders/<username>", methods=["GET"])
def get_user_orders(username):
    user = find_user(username)
    if not user:
        return jsonify({"error": "User not found"}), 404

    orders = load_json(ORDERS_FILE)
    user_orders = [o for o in orders if o["username"] == username]
    
    return jsonify(user_orders), 200

@orders_bp.route("/orders/<int:order_id>", methods=["GET"])
def get_order(order_id):
    orders = load_json(ORDERS_FILE)
    order = next((o for o in orders if o["order_id"] == order_id), None)
    
    if not order:
        return jsonify({"error": "Order not found"}), 404
    
    return jsonify(order), 200
