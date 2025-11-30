from flask import Flask, jsonify
from flask_cors import CORS

from .routes.users import users_bp
from .routes.products import products_bp
from .routes.cart import cart_bp
from .routes.orders import orders_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(users_bp)
app.register_blueprint(products_bp)
app.register_blueprint(cart_bp)
app.register_blueprint(orders_bp)

@app.route("/")
def home():
    return jsonify({
        "message": "E-Commerce Backend API",
        "version": "1.0",
        "endpoints": {
            "auth": ["/register", "/login"],
            "users": ["/user/<username>"],
            "products": ["/products", "/products/<id>", "/products?q=search"],
            "cart": ["/cart/<username>", "/cart/<username>/add", "/cart/<username>/remove"],
            "orders": ["/checkout", "/orders/<username>"],
            "admin": ["/admin/products", "/admin/products/<id>"]
        }
    }), 200

if __name__ == "__main__":
    app.run(debug=True)
