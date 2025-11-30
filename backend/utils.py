import json
import os
from datetime import datetime

DATA_DIR = "backend/data"
USERS_FILE = f"{DATA_DIR}/users.json"
CARTS_FILE = f"{DATA_DIR}/carts.json"
ORDERS_FILE = f"{DATA_DIR}/orders.json"
PRODUCTS_FILE = f"{DATA_DIR}/products.json"

def ensure_data_dir():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)

def load_json(path, default=[]):
    ensure_data_dir()
    if not os.path.exists(path):
        with open(path, "w") as f:
            json.dump(default, f, indent=4)
    with open(path, "r") as f:
        return json.load(f)

def save_json(path, data):
    ensure_data_dir()
    with open(path, "w") as f:
        json.dump(data, f, indent=4)

def calculate_product_rating(product):
    reviews = product.get("reviews", [])
    if not reviews:
        return product.get("rating", 5)
    avg = sum(r.get("rating", 5) for r in reviews) / len(reviews)
    return round(avg, 2)

def validate_age(birthday_str):
    try:
        birthday = datetime.strptime(birthday_str, "%Y-%m-%d")
    except:
        return False, "Birthday must be YYYY-MM-DD"
    
    today = datetime.today()
    age = today.year - birthday.year - ((today.month, today.day) < (birthday.month, birthday.day))
    
    if age < 18:
        return False, "You must be at least 18 to register"
    return True, None

def user_exists(username):
    users = load_json(USERS_FILE)
    return any(u["username"] == username for u in users)

def find_user(username):
    users = load_json(USERS_FILE)
    return next((u for u in users if u["username"] == username), None)

def find_product(product_id):
    products = load_json(PRODUCTS_FILE)
    return next((p for p in products if p["id"] == product_id), None)

def find_user_cart(username):
    carts = load_json(CARTS_FILE)
    return next((c for c in carts if c["username"] == username), None)
