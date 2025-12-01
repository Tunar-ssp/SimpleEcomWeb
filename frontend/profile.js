async function initProfile() {
    if (!isLoggedIn()) { window.location.href = 'login.html'; return; }
    try {
        const user = await getUserProfile(getCurrentUser());
        window.currentUser = user;
        const info = document.getElementById('profileInfo');
        info.innerHTML = `<div style="background:rgba(255,255,255,.05);padding:1rem;border-radius:8px;border-left:3px solid #ff006e"><p style="font-size:.85rem;color:#aaa">Username</p><p style="font-size:1.1rem;font-weight:600">${user.username}</p></div><div style="background:rgba(255,255,255,.05);padding:1rem;border-radius:8px;border-left:3px solid #ff006e"><p style="font-size:.85rem;color:#aaa">Name</p><p style="font-size:1.1rem;font-weight:600">${user.name} ${user.surname || ''}</p></div><div style="background:rgba(255,255,255,.05);padding:1rem;border-radius:8px;border-left:3px solid #ff006e"><p style="font-size:.85rem;color:#aaa">Gender</p><p style="font-size:1.1rem;font-weight:600">${user.gender}</p></div><div style="background:rgba(255,255,255,.05);padding:1rem;border-radius:8px;border-left:3px solid #ff006e"><p style="font-size:.85rem;color:#aaa">Birthday</p><p style="font-size:1.1rem;font-weight:600">${user.birthday}</p></div>`;
        
        const orders = await getUserOrders(getCurrentUser());
        const oh = document.getElementById('orderHistory');
        if (!orders?.length) { oh.innerHTML = '<div style="text-align:center;padding:2rem;color:#aaa"><p>No orders</p><a href="index.html" class="btn btn-primary">Shop</a></div>'; return; }
        oh.innerHTML = orders.map(o => `<div style="background:rgba(255,255,255,.05);padding:1rem;border-radius:8px;border-left:3px solid #ff006e;margin-bottom:.5rem"><div style="display:flex;justify-content:space-between;margin-bottom:.5rem"><strong>Order #${o.order_id}</strong><span style="color:#aaa;font-size:.9rem">${o.date}</span></div><div style="font-size:.9rem;color:#ccc;margin-bottom:.5rem">${o.items.map(i => `${i.title} (x${i.quantity})`).join(', ')}</div><div style="color:#ff006e;font-weight:600">Total: $${o.total_price}</div></div>`).join('');
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

function logout() {
    if (confirm('Logout?')) { clearCurrentUser(); window.location.href = 'index.html'; }
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

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initProfile);
else initProfile();
