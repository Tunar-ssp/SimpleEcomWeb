/**
 * Shopping Cart Module
 * Handles cart display, updates, and checkout
 */

let allProducts = [];
let cartData = null;

/**
 * Initialize cart page
 */
async function initCart() {
    console.log('Initializing cart...');
    
    // Check if user is logged in
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        // Load all products for reference
        allProducts = await getProducts();
        
        // Load cart
        await loadCart();
        
        console.log('Cart initialized successfully');
    } catch (error) {
        console.error('Failed to initialize cart:', error);
        showError('Failed to load cart');
    }
}

/**
 * Load cart from API
 */
async function loadCart() {
    try {
        const username = getCurrentUser();
        cartData = await getCart(username);
        displayCart();
    } catch (error) {
        console.error('Error loading cart:', error);
        showError('Failed to load cart');
    }
}

/**
 * Display cart items
 */
function displayCart() {
    const cartItemsDiv = document.getElementById('cartItems');
    const items = cartData.items || [];
    
    if (items.length === 0) {
        cartItemsDiv.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #aaa;">
                <p style="font-size: 1.2rem; margin-bottom: 1rem;">🛒 Your cart is empty</p>
                <a href="index.html" class="btn btn-primary">Continue Shopping</a>
            </div>
        `;
        updateSummary(0, 0);
        return;
    }
    
    // Create cart items HTML
    let subtotal = 0;
    const itemsHTML = items.map(item => {
        const product = allProducts.find(p => p.id === item.product_id);
        if (!product) return '';
        
        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;
        
        return createCartItemHTML(product, item, itemTotal);
    }).join('');
    
    cartItemsDiv.innerHTML = itemsHTML;
    
    // Update summary
    const tax = subtotal * 0.1;
    updateSummary(subtotal, tax);
}

/**
 * Create HTML for a cart item
 */
function createCartItemHTML(product, item, itemTotal) {
    const image = product.thumbnail || product.images?.[0] || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3C/svg%3E';
    
    return `
        <div style="background: linear-gradient(135deg, rgba(51, 30, 100, 0.3), rgba(24, 36, 62, 0.3)); border: 1px solid rgba(255, 0, 110, 0.2); border-radius: 12px; padding: 1.5rem; display: grid; grid-template-columns: 100px 1fr auto; gap: 1.5rem; align-items: center;">
            <!-- Product Image -->
            <div style="width: 100px; height: 100px; background: rgba(255, 255, 255, 0.1); border-radius: 8px; overflow: hidden;">
                <img src="${image}" alt="${product.title}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            
            <!-- Product Info -->
            <div>
                <h3 style="margin-bottom: 0.5rem; color: #ff006e;">${product.title}</h3>
                <p style="color: #aaa; font-size: 0.9rem; margin-bottom: 0.5rem;">${product.brand}</p>
                <p style="color: #8338ec; font-weight: 600;">$${product.price.toFixed(2)} each</p>
            </div>
            
            <!-- Quantity Controls -->
            <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button 
                        class="btn btn-sm" 
                        style="width: 35px; padding: 0.4rem;" 
                        onclick="updateQuantity(${product.id}, ${item.quantity - 1})"
                    >−</button>
                    <input 
                        type="number" 
                        value="${item.quantity}" 
                        min="1" 
                        max="${product.stock}"
                        onchange="updateQuantity(${product.id}, this.value)"
                        style="width: 50px; padding: 0.4rem; text-align: center; border-radius: 6px; border: 1px solid rgba(255, 0, 110, 0.3); background: rgba(255, 255, 255, 0.05); color: #fff;"
                    >
                    <button 
                        class="btn btn-sm" 
                        style="width: 35px; padding: 0.4rem;" 
                        onclick="updateQuantity(${product.id}, ${item.quantity + 1})"
                    >+</button>
                </div>
                <p style="font-size: 0.85rem; color: #aaa;">Stock: ${product.stock}</p>
            </div>
            
            <!-- Item Total & Remove -->
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem;">
                <div style="font-size: 1.2rem; font-weight: bold; background: linear-gradient(135deg, #ff006e, #8338ec); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                    $${itemTotal.toFixed(2)}
                </div>
                <button 
                    class="btn btn-sm" 
                    style="background: rgba(255, 100, 100, 0.2); border: 1px solid rgba(255, 100, 100, 0.5); color: #ff6464;"
                    onclick="removeFromCartUI(${product.id})"
                >
                    🗑️ Remove
                </button>
            </div>
        </div>
    `;
}

/**
 * Update item quantity
 */
async function updateQuantity(productId, newQuantity) {
    const quantity = parseInt(newQuantity);
    
    if (quantity < 1) {
        removeFromCartUI(productId);
        return;
    }
    
    try {
        const username = getCurrentUser();
        await updateCartItem(username, productId, quantity);
        await loadCart();
        showSuccess('✅ Cart updated');
    } catch (error) {
        console.error('Error updating quantity:', error);
        showError('Failed to update cart');
    }
}

/**
 * Remove item from cart
 */
async function removeFromCartUI(productId) {
    if (!confirm('Remove this item from cart?')) return;
    
    try {
        const username = getCurrentUser();
        await removeFromCart(username, productId);
        await loadCart();
        showSuccess('✅ Item removed');
    } catch (error) {
        console.error('Error removing item:', error);
        showError('Failed to remove item');
    }
}

/**
 * Update order summary
 */
function updateSummary(subtotal, tax) {
    const total = subtotal + tax;
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

/**
 * Proceed to checkout
 */
async function checkout() {
    if (!cartData.items || cartData.items.length === 0) {
        showError('Cart is empty');
        return;
    }
    
    try {
        const username = getCurrentUser();
        const order = await checkout(username);
        
        showSuccess('✅ Order placed successfully!');
        
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 1500);
    } catch (error) {
        console.error('Checkout error:', error);
        showError(error.message || 'Checkout failed');
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

// Initialize cart when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCart);
} else {
    initCart();
}
