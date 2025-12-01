let allProducts = [], cartData = null;

async function initCart() {
    if (!isLoggedIn()) { window.location.href = 'login.html'; return; }
    try {
        allProducts = await getProducts();
        await loadCart();
    } catch (e) { showError('Failed to load cart'); }
}

async function loadCart() {
    try {
        cartData = await getCart(getCurrentUser());
        displayCart();
    } catch (e) { showError('Failed'); }
}

function displayCart() {
    const div = document.getElementById('cartItems');
    const items = cartData.items || [];
    if (!items.length) {
        div.innerHTML = '<div style="text-align:center;padding:3rem;color:#aaa"><p>🛒 Cart empty</p><a href="index.html" class="btn btn-primary">Shop</a></div>';
        updateSummary(0, 0);
        return;
    }
    let sub = 0;
    div.innerHTML = items.map(item => {
        const p = allProducts.find(x => x.id === item.product_id);
        if (!p) return '';
        const total = p.price * item.quantity;
        sub += total;
        const img = p.thumbnail || p.images?.[0] || '';
        return `<div style="background:linear-gradient(135deg,rgba(51,30,100,.3),rgba(24,36,62,.3));border:1px solid rgba(255,0,110,.2);border-radius:12px;padding:1.5rem;display:grid;grid-template-columns:100px 1fr auto;gap:1.5rem;align-items:center"><div style="width:100px;height:100px;background:rgba(255,255,255,.1);border-radius:8px;overflow:hidden"><img src="${img}" style="width:100%;height:100%;object-fit:cover"></div><div><h3 style="margin-bottom:.5rem;color:#ff006e">${p.title}</h3><p style="color:#aaa;font-size:.9rem">${p.brand}</p><p style="color:#8338ec;font-weight:600">$${p.price}</p></div><div style="display:flex;flex-direction:column;align-items:center;gap:.5rem"><div style="display:flex;gap:.5rem"><button class="btn btn-sm" style="width:35px;padding:.4rem" onclick="updateQty(${p.id},${item.quantity - 1})">−</button><input type="number" value="${item.quantity}" min="1" max="${p.stock}" onchange="updateQty(${p.id},this.value)" style="width:50px;padding:.4rem;text-align:center;border-radius:6px;border:1px solid rgba(255,0,110,.3);background:rgba(255,255,255,.05);color:#fff"><button class="btn btn-sm" style="width:35px;padding:.4rem" onclick="updateQty(${p.id},${item.quantity + 1})">+</button></div><p style="font-size:.85rem;color:#aaa">Stock: ${p.stock}</p></div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:.5rem"><div style="font-size:1.2rem;font-weight:bold;color:#ff006e">$${total}</div><button class="btn btn-sm" style="background:rgba(255,100,100,.2);border:1px solid rgba(255,100,100,.5);color:#ff6464" onclick="removeItem(${p.id})">🗑️ Remove</button></div></div>`;
    }).join('');
    updateSummary(sub, sub * 0.1);
}

async function updateQty(id, qty) {
    qty = parseInt(qty);
    if (qty < 1) { removeItem(id); return; }
    try {
        await updateCartItem(getCurrentUser(), id, qty);
        await loadCart();
        showSuccess('✅ Updated');
    } catch (e) { showError('Failed'); }
}

async function removeItem(id) {
    if (!confirm('Remove?')) return;
    try {
        await removeFromCart(getCurrentUser(), id);
        await loadCart();
        showSuccess('✅ Removed');
    } catch (e) { showError('Failed'); }
}

function updateSummary(sub, tax) {
    document.getElementById('subtotal').textContent = `$${sub.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${(sub + tax).toFixed(2)}`;
}

async function checkout() {
    if (!cartData.items?.length) { showError('Cart empty'); return; }
    try {
        await checkout(getCurrentUser());
        showSuccess('✅ Order placed!');
        setTimeout(() => window.location.href = 'profile.html', 1500);
    } catch (e) { showError(e.message || 'Failed'); }
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

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initCart);
else initCart();
