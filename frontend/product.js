let product = null;

async function initProduct() {
    updateAuthNav();
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) { window.location.href = 'index.html'; return; }
    try {
        product = await getProduct(id);
        displayProduct();
        loadComments();
        updateCartCount();
    } catch (e) { showError('Failed'); window.location.href = 'index.html'; }
}

function displayProduct() {
    const rating = calcRating(product);
    const img = product.thumbnail || product.images?.[0] || '';
    document.getElementById('mainImg').src = img;
    document.getElementById('title').textContent = product.title;
    document.getElementById('brand').textContent = product.brand || '';
    document.getElementById('price').textContent = `$${product.price}`;
    document.getElementById('stock').textContent = product.stock > 0 ? `${product.stock} in stock` : 'Out';
    document.getElementById('rating').textContent = `${'⭐'.repeat(Math.min(5, Math.round(rating)))} (${rating})`;
    document.getElementById('desc').textContent = product.description || '';
    document.getElementById('qty').max = product.stock;
    
    const thumbs = document.getElementById('thumbs');
    thumbs.innerHTML = (product.images || []).map(img => `<img src="${img}" onclick="document.getElementById('mainImg').src='${img}'" style="cursor:pointer;border-radius:6px;border:2px solid transparent" onmouseover="this.style.borderColor='#ff006e'" onmouseout="this.style.borderColor='transparent'">`).join('');
}

function calcRating(p) {
    if (!p.reviews?.length) return p.rating || 5;
    return Math.round(p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length * 10) / 10;
}

function loadComments() {
    const div = document.getElementById('comments');
    const reviews = product.reviews || [];
    if (!reviews.length) { div.innerHTML = '<p style="color:#aaa">No comments yet</p>'; return; }
    div.innerHTML = reviews.map(r => `<div style="background:rgba(255,255,255,.05);padding:1rem;border-radius:8px;border-left:3px solid #ff006e"><div style="display:flex;justify-content:space-between;margin-bottom:.5rem"><strong>${r.username}</strong><span style="color:#aaa">${'⭐'.repeat(r.rating)}</span></div><p style="color:#ccc">${r.comment}</p></div>`).join('');
}

async function addComment() {
    if (!isLoggedIn()) { window.location.href = 'login.html'; return; }
    const text = document.getElementById('commentText').value;
    const rating = parseInt(document.getElementById('commentRating').value);
    if (!text) { showError('Enter comment'); return; }
    try {
        await addReview(product.id, getCurrentUser(), text, rating);
        showSuccess('✅ Comment added!');
        document.getElementById('commentText').value = '';
        product = await getProduct(product.id);
        loadComments();
    } catch (e) { showError('Failed'); }
}

async function addToCartFromDetail() {
    if (!isLoggedIn()) { window.location.href = 'login.html'; return; }
    const qty = parseInt(document.getElementById('qty').value);
    try {
        await addToCart(getCurrentUser(), product.id, qty);
        showSuccess('✅ Added!');
        updateCartCount();
    } catch (e) { showError('Failed'); }
}

function updateAuthNav() {
    const nav = document.getElementById('authNav');
    if (isLoggedIn()) {
        nav.innerHTML = `<a href="profile.html" class="btn btn-secondary">👤 ${getCurrentUser()}</a><button class="btn btn-secondary" onclick="logout()">Logout</button>`;
    } else {
        nav.innerHTML = `<a href="login.html" class="btn btn-secondary">Login</a><a href="register.html" class="btn btn-secondary">Register</a>`;
    }
}

function logout() { clearCurrentUser(); window.location.href = 'index.html'; }

async function updateCartCount() {
    if (!isLoggedIn()) { document.getElementById('cart-count').textContent = '0'; return; }
    try {
        const cart = await getCart(getCurrentUser());
        document.getElementById('cart-count').textContent = cart.items?.length || 0;
    } catch (e) { }
}

function goToCart() { if (!isLoggedIn()) window.location.href = 'login.html'; else window.location.href = 'cart.html'; }

function showSuccess(msg) {
    const a = document.createElement('div');
    a.style.cssText = 'position:fixed;top:20px;right:20px;background:#4caf50;color:#fff;padding:1rem;border-radius:8px;z-index:2000';
    a.textContent = msg;
    document.body.appendChild(a);
    setTimeout(() => a.remove(), 3000);
}

function showError(msg) {
    const a = document.createElement('div');
    a.style.cssText = 'position:fixed;top:20px;right:20px;background:#f44336;color:#fff;padding:1rem;border-radius:8px;z-index:2000';
    a.textContent = msg;
    document.body.appendChild(a);
    setTimeout(() => a.remove(), 3000);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initProduct);
else initProduct();
