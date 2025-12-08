async function initProfile() {
    if (!isLoggedIn()) { window.location.href = 'login.html'; return; }
    try {
        const user = await getUserProfile(getCurrentUser());
        window.currentUser = user;
        const info = document.getElementById('profileInfo');
        info.innerHTML = `<div style="background:rgba(255,255,255,.05);padding:1rem;border-radius:8px;border-left:3px solid #ff006e"><p style="font-size:.85rem;color:#aaa">Username</p><p style="font-size:1.1rem;font-weight:600">${user.username}</p></div><div style="background:rgba(255,255,255,.05);padding:1rem;border-radius:8px;border-left:3px solid #ff006e"><p style="font-size:.85rem;color:#aaa">Name</p><p style="font-size:1.1rem;font-weight:600">${user.name} ${user.surname || ''}</p></div><div style="background:rgba(255,255,255,.05);padding:1rem;border-radius:8px;border-left:3px solid #ff006e"><p style="font-size:.85rem;color:#aaa">Gender</p><p style="font-size:1.1rem;font-weight:600">${user.gender}</p></div><div style="background:rgba(255,255,255,.05);padding:1rem;border-radius:8px;border-left:3px solid #ff006e"><p style="font-size:.85rem;color:#aaa">Birthday</p><p style="font-size:1.1rem;font-weight:600">${user.birthday}</p></div>`;
        
        const orders = await getUserOrders(getCurrentUser());
        const oh = document.getElementById('orderHistory');
        if (!orders?.length) { oh.innerHTML = '<div style="text-align:center;padding:2rem;color:#aaa"><p>📭 No orders yet</p><a href="index.html" class="btn btn-primary">Start Shopping</a></div>'; return; }
        oh.innerHTML = orders.map((o, idx) => `<div style="background:linear-gradient(135deg,rgba(51,30,100,.4),rgba(24,36,62,.4));padding:1.2rem;border-radius:8px;border-left:4px solid #ff006e;margin-bottom:1rem;box-shadow:0 4px 10px rgba(0,0,0,.2)"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.8rem"><div style="display:flex;align-items:center;gap:.5rem"><span style="background:#ff006e;color:#fff;padding:.3rem .6rem;border-radius:6px;font-weight:700;font-size:.85rem\">#${idx + 1}</span><strong style="font-size:1.05rem;color:#fff">${new Date(o.date).toLocaleDateString()}</strong></div><span style="color:#8338ec;font-weight:600;font-size:.9rem">${new Date(o.date).toLocaleTimeString().slice(0, -3)}</span></div><div style="background:rgba(255,255,255,.05);padding:.8rem;border-radius:6px;margin-bottom:.8rem"><p style="color:#aaa;font-size:.85rem;margin-bottom:.4rem">📦 Items:</p><div style="display:flex;flex-wrap:wrap;gap:.5rem">${o.items.map(i => `<span style="background:rgba(255,0,110,.2);color:#ff006e;padding:.4rem .8rem;border-radius:6px;font-size:.85rem;white-space:nowrap">${i.title} <strong>×${i.quantity}</strong></span>`).join('')}</div></div><div style="display:flex;justify-content:space-between;align-items:center;padding-top:.8rem;border-top:1px solid rgba(255,0,110,.2)"><div style="color:#aaa;font-size:.9rem">Qty: ${o.items.reduce((s, i) => s + i.quantity, 0)} items</div><div style="color:#ff006e;font-weight:700;font-size:1.2rem">$${o.total?.toFixed(2) || '0.00'}</div></div></div>`).join('');
    } catch (e) { showError('Failed'); }
}

function editProfile() {
    if (!window.currentUser) return;
    document.getElementById('editPassword').value = '';
    document.getElementById('editSurname').value = window.currentUser.surname || '';
    document.getElementById('editGender').value = window.currentUser.gender || 'male';
    document.getElementById('editModal').classList.add('active');
}

function closeEditModal(e) {
    if (e && e.target.id !== 'editModal') return;
    document.getElementById('editModal').classList.remove('active');
}

async function saveProfile(e) {
    e.preventDefault();
    const data = {};
    const pwd = document.getElementById('editPassword').value;
    const sur = document.getElementById('editSurname').value;
    const gen = document.getElementById('editGender').value;
    if (pwd) data.password = pwd;
    if (sur) data.surname = sur;
    if (gen) data.gender = gen;
    if (!Object.keys(data).length) { showError('No changes'); return; }
    try {
        await updateUserProfile(getCurrentUser(), data);
        showSuccess('✅ Updated');
        closeEditModal();
        await initProfile();
    } catch (e) { showError(e.message || 'Failed'); }
}

function logout() { clearCurrentUser(); window.location.href = 'index.html'; }

function goToCart() { window.location.href = 'cart.html'; }

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

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initProfile);
else initProfile();
