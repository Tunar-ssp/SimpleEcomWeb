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
    } catch (e) { showError('Failed to load product'); window.location.href = 'index.html'; }
}

function displayProduct() {
    const rating = calcRating(product);
    const img = product.thumbnail || product.images?.[0] || '';
    document.getElementById('mainImg').src = img;
    document.getElementById('title').textContent = product.title;
    document.getElementById('brand').textContent = product.brand || '';
    document.getElementById('price').textContent = `$${product.price}`;
    document.getElementById('stock').textContent = product.stock > 0 ? `${product.stock} Available` : '❌ Out';
    document.getElementById('rating').textContent = `${'⭐'.repeat(Math.min(5, Math.round(rating)))} (${rating})`;
    document.getElementById('desc').textContent = product.description || '';
    document.getElementById('qty').max = product.stock;
    
    const thumbs = document.getElementById('thumbs');
    thumbs.innerHTML = (product.images || []).map((img, i) => `<img src="${img}" onclick="setMainImage(this.src)" style="cursor:pointer;border-radius:6px;border:1px solid transparent;width:100%;height:50px;object-fit:cover;transition:all .2s" onmouseover="this.style.borderColor='#ff006e';this.style.boxShadow='0 0 10px rgba(255,0,110,.4)'" onmouseout="this.style.borderColor='transparent';this.style.boxShadow='none'">`).join('');
}

function setMainImage(src) {
    document.getElementById('mainImg').src = src;
}

function calcRating(p) {
    if (!p.reviews?.length) return p.rating || 5;
    return Math.round(p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length * 10) / 10;
}

function loadComments() {
    const div = document.getElementById('comments');
    const reviews = product.reviews || [];
    if (!reviews.length) { div.innerHTML = '<p style="color:#aaa;text-align:center;padding:2rem">No reviews yet. Be the first to review!</p>'; return; }
    div.innerHTML = reviews.map(r => {
        if (!r) return '';
        const nameSource = r.reviewerName || r.username || r.name || r.user;
        const reviewerName = nameSource && String(nameSource).trim() ? String(nameSource).trim() : 'Anonymous';
        const rating = r.rating || 0;
        const comment = r.comment || '';
        return `<div style="background:linear-gradient(135deg,rgba(51,30,100,.3),rgba(24,36,62,.3));padding:1.2rem;border-radius:8px;border-left:4px solid #ff006e"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem"><strong style="color:#ff006e">${reviewerName}</strong><span style="color:#8338ec;font-weight:600">${'⭐'.repeat(rating)}</span></div><p style="color:#ccc;line-height:1.5;font-size:.95rem">${comment}</p></div>`;
    }).join('');
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
    if (qty < 1 || qty > product.stock) { showError('Invalid quantity'); return; }
    try {
        await addToCart(getCurrentUser(), product.id, qty);
        showSuccess('✅ Added to cart!');
        updateCartCount();
    } catch (e) { showError('❌ Failed: ' + e.message); }
}

function updateQtyBtn(delta) {
    const input = document.getElementById('qty');
    let val = parseInt(input.value) + delta;
    if (val < 1) val = 1;
    if (val > product.stock) val = product.stock;
    input.value = val;
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
    a.style.cssText = 'position:fixed;top:20px;right:20px;background:#4caf50;color:#fff;padding:1rem 1.5rem;border-radius:8px;z-index:2000;box-shadow:0 4px 15px rgba(0,0,0,.3);font-weight:600';
    a.textContent = msg;
    document.body.appendChild(a);
    setTimeout(() => a.remove(), 3000);
}

function showError(msg) {
    const a = document.createElement('div');
    a.style.cssText = 'position:fixed;top:20px;right:20px;background:#f44336;color:#fff;padding:1rem 1.5rem;border-radius:8px;z-index:2000;box-shadow:0 4px 15px rgba(0,0,0,.3);font-weight:600';
    a.textContent = msg;
    document.body.appendChild(a);
    setTimeout(() => a.remove(), 3000);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initProduct);
else initProduct();
