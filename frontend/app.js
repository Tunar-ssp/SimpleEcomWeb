/**
 * Main Application Module
 * Handles product display, filtering, and user interactions
 */

// Global state
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const itemsPerPage = 12;
let selectedProductId = null;

/**
 * Initialize the application
 */
async function initApp() {
    console.log('Initializing app...');
    
    try {
        // Load products
        await loadProducts();
        
        // Setup filter options
        setupFilterOptions();
        
        // Display initial products
        displayProducts();
        
        // Setup event listeners
        setupEventListeners();
        
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showError('Failed to load products. Please refresh the page.');
    }
}

/**
 * Load all products from API
 */
async function loadProducts() {
    try {
        allProducts = await getProducts();
        filteredProducts = [...allProducts];
        console.log(`Loaded ${allProducts.length} products`);
    } catch (error) {
        console.error('Error loading products:', error);
        throw error;
    }
}

/**
 * Setup filter options (brands, etc.)
 */
function setupFilterOptions() {
    // Extract unique brands
    const brands = [...new Set(allProducts.map(p => p.brand).filter(Boolean))];
    
    const brandFiltersDiv = document.getElementById('brandFilters');
    brandFiltersDiv.innerHTML = brands.map(brand => `
        <label>
            <input 
                type="checkbox" 
                value="${brand}" 
                onchange="applyFilters()"
            > ${brand}
        </label>
    `).join('');
}

/**
 * Apply all active filters
 */
function applyFilters() {
    // Start with all products
    let filtered = [...allProducts];
    
    // Search filter
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.title.toLowerCase().includes(searchTerm) ||
            p.brand.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // Price filter
    const priceFilter = document.getElementById('priceFilter');
    if (priceFilter.value) {
        const maxPrice = parseInt(priceFilter.value);
        filtered = filtered.filter(p => p.price <= maxPrice);
        document.getElementById('priceValue').textContent = `Max: $${maxPrice}`;
    }
    
    // Brand filter
    const checkedBrands = Array.from(
        document.querySelectorAll('#brandFilters input[type="checkbox"]:checked')
    ).map(cb => cb.value);
    
    if (checkedBrands.length > 0) {
        filtered = filtered.filter(p => checkedBrands.includes(p.brand));
    }
    
    // Rating filter
    const ratingCheckboxes = document.querySelectorAll(
        '.filter-group input[type="checkbox"][value="3"], .filter-group input[type="checkbox"][value="4"]'
    );
    
    let minRating = 0;
    ratingCheckboxes.forEach(cb => {
        if (cb.checked) {
            minRating = Math.max(minRating, parseInt(cb.value));
        }
    });
    
    if (minRating > 0) {
        filtered = filtered.filter(p => {
            const rating = calculateRating(p);
            return rating >= minRating;
        });
    }
    
    // Stock filter
    const inStockFilter = document.getElementById('inStockFilter');
    if (inStockFilter.checked) {
        filtered = filtered.filter(p => p.stock > 0);
    }
    
    // Sort
    const sortSelect = document.getElementById('sortSelect');
    const sortValue = sortSelect.value;
    
    switch (sortValue) {
        case 'price-low':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            filtered.sort((a, b) => calculateRating(b) - calculateRating(a));
            break;
        case 'newest':
            filtered.sort((a, b) => b.id - a.id);
            break;
    }
    
    filteredProducts = filtered;
    currentPage = 1;
    displayProducts();
}

/**
 * Calculate product rating from reviews
 */
function calculateRating(product) {
    if (!product.reviews || product.reviews.length === 0) {
        return product.rating || 5;
    }
    
    const avgRating = product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;
    return Math.round(avgRating * 10) / 10;
}

/**
 * Display products with pagination
 */
function displayProducts() {
    const grid = document.getElementById('productsGrid');
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const pageProducts = filteredProducts.slice(startIdx, endIdx);
    
    if (pageProducts.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #aaa;">
                <p style="font-size: 1.2rem;">No products found</p>
                <p>Try adjusting your filters</p>
            </div>
        `;
        document.getElementById('pagination').innerHTML = '';
        return;
    }
    
    grid.innerHTML = pageProducts.map(product => createProductCard(product)).join('');
    
    // Display pagination
    displayPagination();
}

/**
 * Create HTML for a product card
 */
function createProductCard(product) {
    const rating = calculateRating(product);
    const stars = '⭐'.repeat(Math.min(5, Math.round(rating)));
    const image = product.thumbnail || product.images?.[0] || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3C/svg%3E';
    
    return `
        <div class="card" onclick="openProductModal(${product.id})">
            <div class="card-img">
                <img src="${image}" alt="${product.title}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23ddd%22 width=%22200%22 height=%22200%22/%3E%3C/svg%3E'">
            </div>
            <div class="card-body">
                <div class="card-brand">${product.brand || 'Unknown'}</div>
                <div class="card-title">${product.title}</div>
                <div class="card-rating">${stars} (${rating})</div>
                <div class="card-price">$${product.price.toFixed(2)}</div>
                <div class="card-footer">
                    <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); addToCartQuick(${product.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Display pagination controls
 */
function displayPagination() {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginationDiv = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        paginationDiv.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Previous button
    if (currentPage > 1) {
        html += `<button onclick="goToPage(${currentPage - 1})">← Previous</button>`;
    }
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            html += `<button class="active">${i}</button>`;
        } else if (i <= 3 || i >= totalPages - 2 || Math.abs(i - currentPage) <= 1) {
            html += `<button onclick="goToPage(${i})">${i}</button>`;
        } else if (i === 4 || i === totalPages - 3) {
            html += `<button disabled>...</button>`;
        }
    }
    
    // Next button
    if (currentPage < totalPages) {
        html += `<button onclick="goToPage(${currentPage + 1})">Next →</button>`;
    }
    
    paginationDiv.innerHTML = html;
}

/**
 * Go to specific page
 */
function goToPage(page) {
    currentPage = page;
    displayProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Clear all filters
 */
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('priceFilter').value = 5000;
    document.getElementById('inStockFilter').checked = false;
    document.getElementById('sortSelect').value = 'default';
    
    // Uncheck all brand filters
    document.querySelectorAll('#brandFilters input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    
    // Uncheck rating filters
    document.querySelectorAll('.filter-group input[type="checkbox"][value="3"], .filter-group input[type="checkbox"][value="4"]').forEach(cb => {
        cb.checked = false;
    });
    
    document.getElementById('priceValue').textContent = 'Max: $5000';
    
    applyFilters();
}

/**
 * Open product detail modal
 */
function openProductModal(productId) {
    selectedProductId = productId;
    const product = allProducts.find(p => p.id === productId);
    
    if (!product) {
        showError('Product not found');
        return;
    }
    
    const rating = calculateRating(product);
    const stars = '⭐'.repeat(Math.min(5, Math.round(rating)));
    const image = product.thumbnail || product.images?.[0] || '';
    
    // Populate modal
    document.getElementById('modalImage').src = image;
    document.getElementById('modalTitle').textContent = product.title;
    document.getElementById('modalDescription').textContent = product.description || '';
    document.getElementById('modalBrand').textContent = product.brand || 'Unknown';
    document.getElementById('modalPrice').textContent = product.price.toFixed(2);
    document.getElementById('modalDiscount').textContent = product.discountPercentage || 0;
    document.getElementById('modalRating').textContent = `${stars} (${rating})`;
    document.getElementById('modalStock').textContent = product.stock > 0 ? `${product.stock} in stock` : 'Out of stock';
    document.getElementById('modalWarranty').textContent = product.warrantyInformation || 'No warranty';
    document.getElementById('modalShipping').textContent = product.shippingInformation || 'Standard shipping';
    document.getElementById('quantityInput').value = 1;
    document.getElementById('quantityInput').max = product.stock;
    
    // Show modal
    document.getElementById('productModal').classList.add('active');
}

/**
 * Close product modal
 */
function closeProductModal(event) {
    if (event && event.target.id !== 'productModal') return;
    document.getElementById('productModal').classList.remove('active');
    selectedProductId = null;
}

/**
 * Add product to cart from modal
 */
function addToCart() {
    if (!isLoggedIn()) {
        showError('Please login first');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }
    
    const quantity = parseInt(document.getElementById('quantityInput').value);
    addToCartQuick(selectedProductId, quantity);
    closeProductModal();
}

/**
 * Quick add to cart (from card)
 */
async function addToCartQuick(productId, quantity = 1) {
    if (!isLoggedIn()) {
        showError('Please login first');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }
    
    try {
        const username = getCurrentUser();
        await addToCart(username, productId, quantity);
        showSuccess('✅ Added to cart!');
        updateCartCount();
    } catch (error) {
        showError('Failed to add to cart');
    }
}

/**
 * Navigate to cart page
 */
function goToCart() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    window.location.href = 'cart.html';
}

/**
 * Update cart count in header
 */
async function updateCartCount() {
    if (!isLoggedIn()) {
        document.getElementById('cart-count').textContent = '0';
        return;
    }
    
    try {
        const username = getCurrentUser();
        const cart = await getCart(username);
        const count = cart.items?.length || 0;
        document.getElementById('cart-count').textContent = count;
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Update cart count on page load
    updateCartCount();
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

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
