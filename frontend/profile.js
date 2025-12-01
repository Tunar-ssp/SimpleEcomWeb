/**
 * Profile Module
 * Handles user profile and order history
 */

/**
 * Initialize profile page
 */
async function initProfile() {
    console.log('Initializing profile...');
    
    // Check if user is logged in
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        await loadProfile();
        await loadOrders();
        console.log('Profile initialized successfully');
    } catch (error) {
        console.error('Failed to initialize profile:', error);
        showError('Failed to load profile');
    }
}

/**
 * Load user profile
 */
async function loadProfile() {
    try {
        const username = getCurrentUser();
        const user = await getUserProfile(username);
        displayProfile(user);
    } catch (error) {
        console.error('Error loading profile:', error);
        showError('Failed to load profile');
    }
}

/**
 * Display user profile information
 */
function displayProfile(user) {
    const profileInfo = document.getElementById('profileInfo');
    
    profileInfo.innerHTML = `
        <div style="background: rgba(255, 255, 255, 0.05); padding: 1rem; border-radius: 8px; border-left: 3px solid #ff006e;">
            <p style="font-size: 0.85rem; color: #aaa;">Username</p>
            <p style="font-size: 1.1rem; font-weight: 600;">${user.username}</p>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.05); padding: 1rem; border-radius: 8px; border-left: 3px solid #ff006e;">
            <p style="font-size: 0.85rem; color: #aaa;">Full Name</p>
            <p style="font-size: 1.1rem; font-weight: 600;">${user.name} ${user.surname || ''}</p>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.05); padding: 1rem; border-radius: 8px; border-left: 3px solid #ff006e;">
            <p style="font-size: 0.85rem; color: #aaa;">Gender</p>
            <p style="font-size: 1.1rem; font-weight: 600; text-transform: capitalize;">${user.gender}</p>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.05); padding: 1rem; border-radius: 8px; border-left: 3px solid #ff006e;">
            <p style="font-size: 0.85rem; color: #aaa;">Birthday</p>
            <p style="font-size: 1.1rem; font-weight: 600;">${user.birthday}</p>
        </div>
    `;
    
    // Store user data for edit modal
    window.currentUser = user;
}

/**
 * Load user orders
 */
async function loadOrders() {
    try {
        const username = getCurrentUser();
        const orders = await getUserOrders(username);
        displayOrders(orders);
    } catch (error) {
        console.error('Error loading orders:', error);
        showError('Failed to load orders');
    }
}

/**
 * Display order history
 */
function displayOrders(orders) {
    const orderHistory = document.getElementById('orderHistory');
    
    if (!orders || orders.length === 0) {
        orderHistory.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #aaa;">
                <p>No orders yet</p>
                <a href="index.html" class="btn btn-primary" style="margin-top: 1rem; display: inline-block;">
                    Start Shopping
                </a>
            </div>
        `;
        return;
    }
    
    orderHistory.innerHTML = orders.map(order => createOrderHTML(order)).join('');
}

/**
 * Create HTML for an order
 */
function createOrderHTML(order) {
    const itemsList = order.items.map(item => 
        `${item.title} (x${item.quantity}) - $${item.price.toFixed(2)}`
    ).join('<br>');
    
    return `
        <div style="background: rgba(255, 255, 255, 0.05); padding: 1rem; border-radius: 8px; border-left: 3px solid #ff006e; margin-bottom: 0.5rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <strong>Order #${order.order_id}</strong>
                <span style="color: #aaa; font-size: 0.9rem;">${order.date}</span>
            </div>
            <div style="font-size: 0.9rem; color: #ccc; margin-bottom: 0.5rem;">
                ${itemsList}
            </div>
            <div style="color: #ff006e; font-weight: 600;">
                Total: $${order.total_price.toFixed(2)}
            </div>
        </div>
    `;
}

/**
 * Open edit profile modal
 */
function editProfile() {
    if (!window.currentUser) return;
    
    document.getElementById('editPassword').value = '';
    document.getElementById('editSurname').value = window.currentUser.surname || '';
    document.getElementById('editGender').value = window.currentUser.gender || 'male';
    
    document.getElementById('editModal').classList.add('active');
}

/**
 * Close edit profile modal
 */
function closeEditModal(event) {
    if (event && event.target.id !== 'editModal') return;
    document.getElementById('editModal').classList.remove('active');
}

/**
 * Save profile changes
 */
async function saveProfile(event) {
    event.preventDefault();
    
    const password = document.getElementById('editPassword').value;
    const surname = document.getElementById('editSurname').value;
    const gender = document.getElementById('editGender').value;
    
    const updateData = {};
    if (password) updateData.password = password;
    if (surname) updateData.surname = surname;
    if (gender) updateData.gender = gender;
    
    if (Object.keys(updateData).length === 0) {
        showError('No changes to save');
        return;
    }
    
    try {
        const username = getCurrentUser();
        await updateUserProfile(username, updateData);
        
        showSuccess('✅ Profile updated successfully');
        closeEditModal();
        
        // Reload profile
        await loadProfile();
    } catch (error) {
        console.error('Error updating profile:', error);
        showError(error.message || 'Failed to update profile');
    }
}

/**
 * Logout user
 */
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        clearCurrentUser();
        window.location.href = 'index.html';
    }
}

/**
 * Show success message
 */
function showSuccess(message) {
    const alert = document.createElement('div');
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;
    alert.textContent = message;
    document.body.appendChild(alert);
    
    setTimeout(() => alert.remove(), 3000);
}

/**
 * Show error message
 */
function showError(message) {
    const alert = document.createElement('div');
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f44336;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;
    alert.textContent = message;
    document.body.appendChild(alert);
    
    setTimeout(() => alert.remove(), 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Initialize profile when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfile);
} else {
    initProfile();
}
