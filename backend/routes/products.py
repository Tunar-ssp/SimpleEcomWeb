from flask import Blueprint, request, jsonify
from datetime import datetime
from ..utils import (
    load_json, save_json, calculate_product_rating, find_product,
    PRODUCTS_FILE
)

products_bp = Blueprint('products', __name__)

@products_bp.route("/products", methods=["GET"])
def get_products():
    products = load_json(PRODUCTS_FILE)
    
    query = request.args.get("q", "").lower()
    if query:
        products = [p for p in products if query in p.get("title", "").lower() or query in p.get("brand", "").lower()]
    
    return jsonify(products), 200

@products_bp.route("/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    product = find_product(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    
    product["rating"] = calculate_product_rating(product)
    return jsonify(product), 200

@products_bp.route("/admin/products", methods=["POST"])
def add_product():
    data = request.get_json()
    required = ["title", "description", "price", "brand"]
    
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    products = load_json(PRODUCTS_FILE)
    new_product = {
        "id": len(products) + 1,
        "title": data["title"],
        "description": data["description"],
        "price": data["price"],
        "brand": data["brand"],
        "discountPercentage": data.get("discountPercentage", 0),
        "rating": data.get("rating", 5),
        "stock": data.get("stock", 50),
        "weight": data.get("weight", 2),
        "dimensions": data.get("dimensions", {"width": 0, "height": 0, "depth": 0}),
        "warrantyInformation": data.get("warrantyInformation", "1 year warranty"),
        "shippingInformation": data.get("shippingInformation", "Ships in 1 week"),
        "availabilityStatus": data.get("availabilityStatus", "In Stock"),
        "reviews": [],
        "images": data.get("images", []),
        "thumbnail": data.get("thumbnail", ""),
        "stars": data.get("stars", 5),
        "sold": 0
    }
    products.append(new_product)
    save_json(PRODUCTS_FILE, products)
    return jsonify({"message": "Product added", "product": new_product}), 201

@products_bp.route("/admin/products/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    products = load_json(PRODUCTS_FILE)
    product = next((p for p in products if p["id"] == product_id), None)
    
    if not product:
        return jsonify({"error": "Product not found"}), 404

    data = request.get_json()
    
    allowed = ["title", "description", "price", "brand", "stock", "discountPercentage", "images", "thumbnail"]
    for field in allowed:
        if field in data:
            product[field] = data[field]
    
    save_json(PRODUCTS_FILE, products)
    return jsonify({"message": "Product updated", "product": product}), 200

@products_bp.route("/admin/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    products = load_json(PRODUCTS_FILE)
    products = [p for p in products if p["id"] != product_id]
    save_json(PRODUCTS_FILE, products)
    return jsonify({"message": "Product deleted"}), 200

@products_bp.route("/products/<int:product_id>/review", methods=["POST"])
def add_review(product_id):
    data = request.get_json()
    username = data.get("username")
    comment = data.get("comment")
    rating = data.get("rating", 5)

    if not username or not comment:
        return jsonify({"error": "Username and comment required"}), 400

    products = load_json(PRODUCTS_FILE)
    product = find_product(product_id)
    
    if not product:
        return jsonify({"error": "Product not found"}), 404

    product.setdefault("reviews", []).append({
        "rating": rating,
        "comment": comment,
        "date": datetime.now().isoformat(),
        "reviewerName": username
    })
    
    for i, p in enumerate(products):
        if p["id"] == product_id:
            products[i] = product
            break
    
    save_json(PRODUCTS_FILE, products)
    return jsonify({"message": "Review added"}), 201
