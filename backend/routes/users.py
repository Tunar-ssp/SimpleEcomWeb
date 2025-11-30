from flask import Blueprint, request, jsonify
from utils import (
    load_json, save_json, validate_age, user_exists, find_user,
    USERS_FILE, ORDERS_FILE
)
from datetime import datetime

users_bp = Blueprint('users', __name__)

@users_bp.route("/register", methods=["POST"])
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

    valid, msg = validate_age(birthday)
    if not valid:
        return jsonify({"error": msg}), 400

    if user_exists(username):
        return jsonify({"error": "Username already exists"}), 400

    users = load_json(USERS_FILE)
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

@users_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    user = find_user(username)
    if not user:
        return jsonify({"error": "User not found"}), 404
    if user["password"] != password:
        return jsonify({"error": "Wrong password"}), 400

    return jsonify({"message": "Login successful", "username": username}), 200

@users_bp.route("/user/<username>", methods=["GET"])
def get_user(username):
    user = find_user(username)
    if not user:
        return jsonify({"error": "User not found"}), 404

    orders = load_json(ORDERS_FILE)
    user_orders = [o for o in orders if o["username"] == username]

    return jsonify({
        "username": user["username"],
        "name": user["name"],
        "surname": user["surname"],
        "gender": user["gender"],
        "birthday": user["birthday"],
        "orders": user_orders
    }), 200

@users_bp.route("/user/<username>", methods=["PUT"])
def update_user(username):
    user = find_user(username)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    
    if "password" in data:
        user["password"] = data["password"]
    if "surname" in data:
        user["surname"] = data["surname"]
    if "gender" in data:
        if data["gender"].lower() not in ["male", "female"]:
            return jsonify({"error": "Gender must be male or female"}), 400
        user["gender"] = data["gender"].lower()

    users = load_json(USERS_FILE)
    for i, u in enumerate(users):
        if u["username"] == username:
            users[i] = user
            break
    save_json(USERS_FILE, users)
    
    return jsonify({"message": "User updated successfully"}), 200
