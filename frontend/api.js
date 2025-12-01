/**
 * API Module
 * Handles all API calls to the backend
 */

const API_BASE_URL = 'http://127.0.0.1:5000';

/**
 * Generic fetch wrapper with error handling
 */
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * PRODUCTS API
 */

// Get all products
async function getProducts() {
    return apiCall('/products');
}

// Get single product by ID
async function getProduct(productId) {
    return apiCall(`/products/${productId}`);
}

// Search products
async function searchProducts(query) {
    return apiCall(`/products?q=${encodeURIComponent(query)}`);
}

// Add product review
async function addReview(productId, username, comment, rating) {
    return apiCall(`/products/${productId}/review`, {
        method: 'POST',
        body: JSON.stringify({
            username,
            comment,
            rating
        })
    });
}

/**
 * USERS API
 */

// Register new user
async function registerUser(userData) {
    return apiCall('/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
}

// Login user
async function loginUser(username, password) {
    return apiCall('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });
}

// Get user profile
async function getUserProfile(username) {
    return apiCall(`/user/${username}`);
}

// Update user profile
async function updateUserProfile(username, userData) {
    return apiCall(`/user/${username}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
    });
}

/**
 * CART API
 */

// Get user cart
async function getCart(username) {
    return apiCall(`/cart/${username}`);
}

// Add item to cart
async function addToCart(username, productId, quantity = 1) {
    return apiCall(`/cart/${username}/add`, {
        method: 'POST',
        body: JSON.stringify({
            product_id: productId,
            quantity
        })
    });
}

// Remove item from cart
async function removeFromCart(username, productId) {
    return apiCall(`/cart/${username}/remove`, {
        method: 'POST',
        body: JSON.stringify({ product_id: productId })
    });
}

// Update cart item quantity
async function updateCartItem(username, productId, quantity) {
    return apiCall(`/cart/${username}/update`, {
        method: 'PUT',
        body: JSON.stringify({
            product_id: productId,
            quantity
        })
    });
}

/**
 * ORDERS API
 */

// Checkout (create order)
async function checkout(username) {
    return apiCall('/checkout', {
        method: 'POST',
        body: JSON.stringify({ username })
    });
}

// Get user orders
async function getUserOrders(username) {
    return apiCall(`/orders/${username}`);
}

// Get single order
async function getOrder(orderId) {
    return apiCall(`/orders/${orderId}`);
}

/**
 * LOCAL STORAGE HELPERS
 */

// Get current logged-in user
function getCurrentUser() {
    return localStorage.getItem('username');
}

// Set current user
function setCurrentUser(username) {
    localStorage.setItem('username', username);
}

// Clear current user (logout)
function clearCurrentUser() {
    localStorage.removeItem('username');
}

// Check if user is logged in
function isLoggedIn() {
    return !!getCurrentUser();
}
