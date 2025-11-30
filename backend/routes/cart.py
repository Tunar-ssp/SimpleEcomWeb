from flask import Blueprint, request, jsonify
from ..utils import (
    load_json, save_json, find_user_cart, find_user, find_product,
    CARTS_FILE, USERS_FILE, PRODUCTS_FILE
)

cart_bp = Blueprint('cart', __name__)

@cart_bp.route("/cart/<username>", methods=["GET"])
def get_cart(username):
    user = find_user(username)
    if not user:
        return jsonify({"error": "User not found"}), 404

    carts = load_json(CARTS_FILE)
    cart = next((c for c in carts if c["username"] == username), None)
    
    if not cart:
        return jsonify({"items": [], "total": 0}), 200
    
    products = load_json(PRODUCTS_FILE)
    total = 0
    for item in cart.get("cart", []):
        product = find_product(item["product_id"])
        if product:
            total += product["price"] * item["quantity"]
    
    return jsonify({
        "username": username,
        "items": cart.get("cart", []),
        "total": total
    }), 200

@cart_bp.route("/cart/<username>/add", methods=["POST"])
def add_to_cart(username):
    user = find_user(username)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    product_id = data.get("product_id")
    quantity = data.get("quantity", 1)

    product = find_product(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    carts = load_json(CARTS_FILE)
    cart = next((c for c in carts if c["username"] == username), None)
    
    if not cart:
        cart = {"username": username, "cart": []}
        carts.append(cart)
    
    item = next((i for i in cart["cart"] if i["product_id"] == product_id), None)
    if item:
        item["quantity"] += quantity
    else:
        cart["cart"].append({
            "product_id": product_id,
            "quantity": quantity
        })
    
    save_json(CARTS_FILE, carts)
    return jsonify({"message": "Item added to cart"}), 200

@cart_bp.route("/cart/<username>/remove", methods=["POST"])
def remove_from_cart(username):
    user = find_user(username)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    product_id = data.get("product_id")

    carts = load_json(CARTS_FILE)
    cart = next((c for c in carts if c["username"] == username), None)
    
    if cart:
        cart["cart"] = [i for i in cart["cart"] if i["product_id"] != product_id]
        save_json(CARTS_FILE, carts)
    
    return jsonify({"message": "Item removed from cart"}), 200

@cart_bp.route("/cart/<username>/update", methods=["PUT"])
def update_cart(username):
    user = find_user(username)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    product_id = data.get("product_id")
    quantity = data.get("quantity", 1)

    if quantity < 1:
        return jsonify({"error": "Quantity must be at least 1"}), 400

    carts = load_json(CARTS_FILE)
    cart = next((c for c in carts if c["username"] == username), None)
    
    if cart:
        item = next((i for i in cart["cart"] if i["product_id"] == product_id), None)
        if item:
            item["quantity"] = quantity
            save_json(CARTS_FILE, carts)
            return jsonify({"message": "Cart updated"}), 200
    
    return jsonify({"error": "Item not in cart"}), 404
