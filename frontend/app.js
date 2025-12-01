let allProducts = [], filteredProducts = [], currentPage = 1, selectedProductId = null;
const itemsPerPage = 12;

async function initApp() {
    try {
        allProducts = await getProducts();
        filteredProducts = [...allProducts];
        setupBrands();
        displayProducts();
        updateCartCount();
    } catch (e) { showError('Failed to load products'); }
}

function setupBrands() {
    const brands = [...new Set(allProducts.map(p => p.brand).filter(Boolean))];
    document.getElementById('brandFilters').innerHTML = brands.map(b => `<label><input type="checkbox" value="${b}" onchange="applyFilters()"> ${b}</label>`).join('');
}

function calcRating(p) {
    if (!p.reviews?.length) return p.rating || 5;
    return Math.round(p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length * 10) / 10;
}

function applyFilters() {
    let f = [...allProducts];
    const search = document.getElementById('searchInput').value.toLowerCase();
    if (search) f = f.filter(p => p.title.toLowerCase().includes(search) || p.brand.toLowerCase().includes(search));
    
    const maxPrice = parseInt(document.getElementById('priceFilter').value);
    if (maxPrice < 5000) {
        f = f.filter(p => p.price <= maxPrice);
        document.getElementById('priceValue').textContent = `Max: $${maxPrice}`;
    }
    
    const brands = Array.from(document.querySelectorAll('#brandFilters input:checked')).map(cb => cb.value);
    if (brands.length) f = f.filter(p => brands.includes(p.brand));
    
    if (document.getElementById('inStockFilter').checked) f = f.filter(p => p.stock > 0);
    
    const sort = document.getElementById('sortSelect').value;
    if (sort === 'price-low') f.sort((a, b) => a.price - b.price);
    else if (sort === 'price-high') f.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') f.sort((a, b) => calcRating(b) - calcRating(a));
    
    filteredProducts = f;
    currentPage = 1;
    displayProducts();
}

function displayProducts() {
    const grid = document.getElementById('productsGrid');
    const start = (currentPage - 1) * itemsPerPage;
    const page = filteredProducts.slice(start, start + itemsPerPage);
    
    if (!page.length) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:2rem;color:#aaa">No products found</div>';
        document.getElementById('pagination').innerHTML = '';
        return;
    }
    
    grid.innerHTML = page.map(p => {
        const rating = calcRating(p);
        const img = p.thumbnail || p.images?.[0] || '';
        return `<div class="card" onclick="openModal(${p.id})"><div class="card-img"><img src="${img}" onerror="this.src=''"></div><div class="card-body"><div class="card-brand">${p.brand}</div><div class="card-title">${p.title}</div><div class="card-rating">${'⭐'.repeat(Math.min(5, Math.round(rating)))} (${rating})</div><div class="card-price">$${p.price}</div><div class="card-footer"><button class="btn btn-sm btn-primary" onclick="event.stopPropagation();addCart(${p.id})">Add</button></div></div></div>`;
    }).join('');
    
    const total = Math.ceil(filteredProducts.length / itemsPerPage);
    let pag = '';
    if (currentPage > 1) pag += `<button onclick="goPage(${currentPage - 1})">← Prev</button>`;
    for (let i = 1; i <= total; i++) {
        if (i === currentPage) pag += `<button class="active">${i}</button>`;
        else if (i <= 2 || i >= total - 1 || Math.abs(i - currentPage) <= 1) pag += `<button onclick="goPage(${i})">${i}</button>`;
    }
    if (currentPage < total) pag += `<button onclick="goPage(${currentPage + 1})">Next →</button>`;
    document.getElementById('pagination').innerHTML = pag;
}

function goPage(p) { currentPage = p; displayProducts(); window.scrollTo(0, 0); }
function clearFilters() { document.getElementById('searchInput').value = ''; document.getElementById('priceFilter').value = 5000; document.getElementById('inStockFilter').checked = false; document.getElementById('sortSelect').value = 'default'; document.querySelectorAll('#brandFilters input').forEach(cb => cb.checked = false); applyFilters(); }

function openModal(id) {
    selectedProductId = id;
    const p = allProducts.find(x => x.id === id);
    if (!p) return;
    const rating = calcRating(p);
    document.getElementById('modalImage').src = p.thumbnail || p.images?.[0] || '';
    document.getElementById('modalTitle').textContent = p.title;
    document.getElementById('modalDescription').textContent = p.description || '';
    document.getElementById('modalBrand').textContent = p.brand || '';
    document.getElementById('modalPrice').textContent = p.price;
    document.getElementById('modalDiscount').textContent = p.discountPercentage || 0;
    document.getElementById('modalRating').textContent = `${'⭐'.repeat(Math.min(5, Math.round(rating)))} (${rating})`;
    document.getElementById('modalStock').textContent = p.stock > 0 ? `${p.stock} in stock` : 'Out';
    document.getElementById('modalWarranty').textContent = p.warrantyInformation || '';
    document.getElementById('modalShipping').textContent = p.shippingInformation || '';
    document.getElementById('quantityInput').value = 1;
    document.getElementById('quantityInput').max = p.stock;
    document.getElementById('productModal').classList.add('active');
}

function closeProductModal(e) {
    if (e && e.target.id !== 'productModal') return;
    document.getElementById('productModal').classList.remove('active');
}

function addToCart() {
    if (!isLoggedIn()) { window.location.href = 'login.html'; return; }
    addCart(selectedProductId, parseInt(document.getElementById('quantityInput').value));
    closeProductModal();
}

async function addCart(id, qty = 1) {
    if (!isLoggedIn()) { window.location.href = 'login.html'; return; }
    try {
        await addToCart(getCurrentUser(), id, qty);
        showSuccess('✅ Added!');
        updateCartCount();
    } catch (e) { showError('Failed'); }
}

function goToCart() {
    if (!isLoggedIn()) window.location.href = 'login.html';
    else window.location.href = 'cart.html';
}

async function updateCartCount() {
    if (!isLoggedIn()) { document.getElementById('cart-count').textContent = '0'; return; }
    try {
        const cart = await getCart(getCurrentUser());
        document.getElementById('cart-count').textContent = cart.items?.length || 0;
    } catch (e) { }
}

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

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initApp);
else initApp();
