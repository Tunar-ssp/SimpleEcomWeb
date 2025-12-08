const API = 'http://localhost:5000';

async function apiCall(endpoint, options = {}) {
    const res = await fetch(`${API}${endpoint}`, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
}

async function getProducts() { return apiCall('/products'); }
async function getProduct(id) { return apiCall(`/products/${id}`); }
async function addReview(id, username, comment, rating) { return apiCall(`/products/${id}/review`, { method: 'POST', body: JSON.stringify({ username, comment, rating }) }); }
async function registerUser(data) { return apiCall('/register', { method: 'POST', body: JSON.stringify(data) }); }
async function loginUser(username, password) { return apiCall('/login', { method: 'POST', body: JSON.stringify({ username, password }) }); }
async function getUserProfile(username) { return apiCall(`/user/${username}`); }
async function updateUserProfile(username, data) { return apiCall(`/user/${username}`, { method: 'PUT', body: JSON.stringify(data) }); }
async function getCart(username) { return apiCall(`/cart/${username}`); }
async function addToCart(username, product_id, quantity = 1) { return apiCall(`/cart/${username}/add`, { method: 'POST', body: JSON.stringify({ product_id, quantity }) }); }
async function removeFromCart(username, product_id) { return apiCall(`/cart/${username}/remove`, { method: 'POST', body: JSON.stringify({ product_id }) }); }
async function updateCartItem(username, product_id, quantity) { return apiCall(`/cart/${username}/update`, { method: 'PUT', body: JSON.stringify({ product_id, quantity }) }); }
async function checkout(username) { return apiCall('/checkout', { method: 'POST', body: JSON.stringify({ username }) }); }
async function getUserOrders(username) { return apiCall(`/orders/${username}`); }

function getCurrentUser() { return localStorage.getItem('username'); }
function setCurrentUser(username) { localStorage.setItem('username', username); }
function clearCurrentUser() { localStorage.removeItem('username'); }
function isLoggedIn() { return !!getCurrentUser(); }
