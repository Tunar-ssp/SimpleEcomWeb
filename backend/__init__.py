from flask import Flask, request, jsonify
import json
import os
from datetime import datetime

app = Flask(__name__)


def load_json(path, default=[]):
    if not os.path.exists(path):
        with open(path, "w") as f:
            json.dump(default, f)
    with open(path, "r") as f:
        return json.load(f)

def save_json(path, data):
    with open(path, "w") as f:
        json.dump(data, f, indent=4)

USERS_FILE = "backend/data/users.json"
CARTS_FILE = "backend/data/carts.json"
ORDERS_FILE = "backend/data/orders.json"
PRODUCTS_FILE = "backend/data/products.json"


@app.route("/")
def home():
    return "Backend works!"


@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    name = data.get("name")
    surname = data.get("surname", "")
    gender = data.get("gender")
    birthday = data.get("birthday")

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400
    if gender.lower() not in ["male", "female"]:
        return jsonify({"error": "Gender must be male or female"}), 400
    if not name:
        return jsonify({"error": "Name is required"}), 400

    # Check age
    try:
        birthday_dt = datetime.strptime(birthday, "%Y-%m-%d")
    except:
        return jsonify({"error": "Birthday must be YYYY-MM-DD"}), 400

    today = datetime.today()
    age = today.year - birthday_dt.year - ((today.month, today.day) < (birthday_dt.month, birthday_dt.day))
    if age < 18:
        return jsonify({"error": "You must be at least 18 to register"}), 400

    users = load_json(USERS_FILE)
    for user in users:
        if user["username"] == username:
            return jsonify({"error": "Username already exists"}), 400

    users.append({
        "username": username,
        "password": password,
        "name": name,
        "surname": surname,
        "gender": gender.lower(),
        "birthday": birthday
    })
    save_json(USERS_FILE, users)
    return jsonify({"message": "Registration successful"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    users = load_json(USERS_FILE)
    for user in users:
        if user["username"] == username:
            if user["password"] == password:
                return jsonify({"message": "Login successful"}), 200
            else:
                return jsonify({"error": "Wrong password"}), 400
    return jsonify({"error": "User not found"}), 404

@app.route("/products", methods=["GET"])
def get_products():
    products = load_json(PRODUCTS_FILE)
    return jsonify(products), 200

@app.route("/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    products = load_json(PRODUCTS_FILE)
    for p in products:
        if p["id"] == product_id:
            return jsonify(p), 200
    return jsonify({"error": "Product not found"}), 404

@app.route("/add_product", methods=["POST"])
def add_product():
    data = request.get_json()
    required_fields = ["title", "description", "price", "brand"]
    for f in required_fields:
        if not data.get(f):
            return jsonify({"error": f"{f} is required"}), 400

    products = load_json(PRODUCTS_FILE)
    new_product = {
        "id": len(products) + 1,
        "title": data["title"],
        "description": data["description"],
        "price": data["price"],
        "discountPercentage": data.get("discountPercentage", 0),
        "rating": data.get("rating", 5),
        "stock": data.get("stock", 50),
        "brand": data["brand"],
        "weight": data.get("weight", 2),
        "dimensions": data.get("dimensions", {"width":0,"height":0,"depth":0}),
        "warrantyInformation": data.get("warrantyInformation", "1 year warranty"),
        "shippingInformation": data.get("shippingInformation", "Ships in 1 week"),
        "availabilityStatus": data.get("availabilityStatus", "In Stock"),
        "reviews": data.get("reviews", []),
        "images": data.get("images", []),
        "thumbnail": data.get("thumbnail", "")
    }
    products.append(new_product)
    save_json(PRODUCTS_FILE, products)
    return jsonify({"message": "Product added", "product": new_product}), 201

@app.route("/add_comment/<int:product_id>", methods=["POST"])
def add_comment(product_id):
    data = request.get_json()
    username = data.get("username")
    comment = data.get("comment")
    if not username or not comment:
        return jsonify({"error": "Username and comment required"}), 400

    products = load_json(PRODUCTS_FILE)
    for p in products:
        if p["id"] == product_id:
            p.setdefault("reviews", []).append({
                "rating": data.get("rating", 5),
                "comment": comment,
                "date": datetime.now().isoformat(),
                "reviewerName": username
            })
            save_json(PRODUCTS_FILE, products)
            return jsonify({"message": "Comment added"}), 201
    return jsonify({"error": "Product not found"}), 404

@app.route("/checkout", methods=["POST"])
def checkout():
    data = request.get_json()
    username = data.get("username")
    if not username:
        return jsonify({"error": "Username required"}), 400

    carts = load_json(CARTS_FILE)
    user_cart = next((c for c in carts if c["username"] == username), None)
    if not user_cart or not user_cart.get("cart"):
        return jsonify({"error": "Cart is empty"}), 400

    products = load_json(PRODUCTS_FILE)
    total = 0
    for item in user_cart["cart"]:
        product_id = item["product_id"]
        quantity = item["quantity"]
        product = next((p for p in products if p["id"] == product_id), None)
        if product:
            total += product["price"] * quantity
            product["stock"] -= quantity

    orders = load_json(ORDERS_FILE)
    new_order = {
        "order_id": len(orders) + 1,
        "username": username,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "items": user_cart["cart"],
        "total_price": total
    }
    orders.append(new_order)
    save_json(ORDERS_FILE, orders)

    save_json(PRODUCTS_FILE, products)
    user_cart["cart"] = []
    save_json(CARTS_FILE, carts)

    return jsonify({"message": "Order placed", "order": new_order}), 201

@app.route("/orders/<username>", methods=["GET"])
def get_orders(username):
    orders = load_json(ORDERS_FILE)
    user_orders = [o for o in orders if o["username"] == username]
    return jsonify(user_orders), 200

if __name__ == "__main__":
    app.run(debug=True)
