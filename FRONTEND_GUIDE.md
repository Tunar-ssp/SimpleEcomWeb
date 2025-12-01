# E-Commerce Frontend - Complete Guide

## 📁 Project Structure

```
frontend/
├── index.html          # Main products page with filters
├── cart.html           # Shopping cart page
├── login.html          # User login page
├── register.html       # User registration page
├── profile.html        # User profile & order history
├── style.css           # Global styles (expanded & readable)
├── api.js              # API communication module
├── app.js              # Main app logic (products, filters, pagination)
├── cart.js             # Cart management logic
├── auth.js             # Authentication logic
└── profile.js          # Profile & orders logic
```

## 🎯 Key Features

### 1. **Product Listing & Filtering**
- **Search**: Real-time search by product title, brand, or description
- **Price Filter**: Slider to filter products by max price
- **Brand Filter**: Checkbox filters for multiple brands
- **Rating Filter**: Filter by 3+ or 4+ stars
- **Stock Filter**: Show only in-stock products
- **Sorting**: Sort by price (low/high), rating, or newest

### 2. **Pagination**
- Products displayed 12 per page
- Smart pagination with page numbers and navigation
- Smooth scrolling to top when changing pages

### 3. **Product Details Modal**
- Click any product card to view full details
- Shows images, price, discount, rating, warranty, shipping info
- Add to cart with quantity selector
- Displays reviews from other customers

### 4. **Shopping Cart**
- View all cart items with images and prices
- Adjust quantities with +/- buttons
- Remove items from cart
- Real-time cart total calculation (with 10% tax)
- Proceed to checkout

### 5. **User Authentication**
- **Register**: Create account with validation (18+ age requirement)
- **Login**: Secure login with localStorage session
- **Profile**: View account info and order history
- **Edit Profile**: Update password, surname, gender
- **Logout**: Clear session and return to home

### 6. **Order Management**
- Checkout from cart
- View order history with dates and totals
- See all order items and prices

## 🚀 Getting Started

### Prerequisites
- Backend running on `http://127.0.0.1:5000`
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Running the Frontend

1. **Open in Browser**
   ```bash
   # Simply open index.html in your browser
   # Or use a local server:
   python -m http.server 8000
   # Then visit http://localhost:8000
   ```

2. **API Configuration**
   - Edit `api.js` line 3 if backend is on different URL:
   ```javascript
   const API_BASE_URL = 'http://127.0.0.1:5000';
   ```

## 📄 File Descriptions

### HTML Files

**index.html**
- Main shopping page
- Sidebar filters
- Product grid with pagination
- Product detail modal
- Search and sort controls

**cart.html**
- Shopping cart display
- Item quantity controls
- Order summary with tax calculation
- Checkout button

**login.html**
- Simple login form
- Username and password fields
- Link to registration

**register.html**
- Registration form with validation
- Fields: username, password, name, surname, gender, birthday
- Age validation (18+)

**profile.html**
- User account information
- Order history display
- Edit profile modal
- Logout button

### CSS File

**style.css** (Fully Expanded & Readable)
- Global styles with clear sections
- Header and navigation styling
- Button styles (primary, secondary, small)
- Filter sidebar styling
- Product card styling with hover effects
- Modal styling
- Form styling
- Pagination styling
- Responsive design (mobile-friendly)
- Color scheme: Purple/Pink gradient (#ff006e, #8338ec)

### JavaScript Modules

**api.js** - API Communication
```javascript
// Products
getProducts()
getProduct(productId)
searchProducts(query)
addReview(productId, username, comment, rating)

// Users
registerUser(userData)
loginUser(username, password)
getUserProfile(username)
updateUserProfile(username, userData)

// Cart
getCart(username)
addToCart(username, productId, quantity)
removeFromCart(username, productId)
updateCartItem(username, productId, quantity)

// Orders
checkout(username)
getUserOrders(username)
getOrder(orderId)

// Local Storage
getCurrentUser()
setCurrentUser(username)
clearCurrentUser()
isLoggedIn()
```

**app.js** - Main Application Logic
- `initApp()` - Initialize the app
- `loadProducts()` - Fetch all products
- `applyFilters()` - Apply all active filters
- `displayProducts()` - Render product grid with pagination
- `openProductModal(productId)` - Show product details
- `addToCartQuick(productId, quantity)` - Quick add to cart
- `updateCartCount()` - Update cart badge
- `goToPage(page)` - Navigate pagination
- `clearFilters()` - Reset all filters

**cart.js** - Shopping Cart Logic
- `initCart()` - Initialize cart page
- `loadCart()` - Fetch cart data
- `displayCart()` - Render cart items
- `updateQuantity(productId, newQuantity)` - Update item quantity
- `removeFromCartUI(productId)` - Remove item
- `checkout()` - Place order

**auth.js** - Authentication
- `handleLogin(event)` - Process login form
- `handleRegister(event)` - Process registration form
- Form validation and error handling

**profile.js** - User Profile
- `initProfile()` - Initialize profile page
- `loadProfile()` - Fetch user data
- `loadOrders()` - Fetch order history
- `editProfile()` - Open edit modal
- `saveProfile(event)` - Save profile changes
- `logout()` - Clear session and logout

## 🎨 Design System

### Colors
- **Primary Gradient**: #ff006e → #8338ec (Pink to Purple)
- **Background**: #0f0c29 → #302b63 (Dark Blue Gradient)
- **Accent**: #ff006e (Pink)
- **Secondary**: #8338ec (Purple)
- **Text**: #ffffff (White)
- **Muted**: #aaa, #888 (Gray)

### Typography
- **Font**: Segoe UI, Tahoma, Geneva, Verdana, sans-serif
- **Sizes**: 0.7rem to 1.5rem (responsive)
- **Weight**: 400 (normal), 600 (semi-bold), 700 (bold)

### Spacing
- **Padding**: 0.5rem to 2rem
- **Gap**: 0.5rem to 2rem
- **Margins**: Consistent with padding

### Responsive Breakpoints
- **Desktop**: Full layout with sidebar
- **Tablet/Mobile** (≤768px): 
  - Single column layout
  - Stacked filters
  - Smaller product cards
  - Full-width modals

## 🔄 Data Flow

### Product Browsing
```
1. App loads → Fetch all products from API
2. Display products in grid (12 per page)
3. User applies filters → Filter products in memory
4. Update display with filtered results
5. User clicks product → Show modal with details
6. User adds to cart → API call to backend
```

### Shopping Cart
```
1. User adds items → Store in backend
2. Navigate to cart → Fetch cart from API
3. Display items with quantities
4. User updates quantity → API call to update
5. User clicks checkout → Create order via API
6. Order placed → Clear cart, redirect to profile
```

### Authentication
```
1. User registers → Validate & send to API
2. User logs in → Store username in localStorage
3. Check localStorage on page load
4. If logged in → Show user-specific features
5. If not logged in → Redirect to login
6. User logs out → Clear localStorage
```

## 🧪 Testing Checklist

### Products Page
- [ ] Products load correctly
- [ ] Search works for title, brand, description
- [ ] Price filter works
- [ ] Brand filter works (multiple selections)
- [ ] Rating filter works
- [ ] Stock filter works
- [ ] Sorting works (price, rating, newest)
- [ ] Pagination works
- [ ] Product modal opens and displays correctly
- [ ] Add to cart works (requires login)
- [ ] Cart count updates

### Cart Page
- [ ] Cart items display correctly
- [ ] Quantity can be updated
- [ ] Items can be removed
- [ ] Total and tax calculate correctly
- [ ] Checkout works
- [ ] Empty cart message shows when empty

### Authentication
- [ ] Registration validates age (18+)
- [ ] Registration validates password match
- [ ] Login works with correct credentials
- [ ] Login fails with wrong credentials
- [ ] Session persists on page reload
- [ ] Logout clears session

### Profile Page
- [ ] User info displays correctly
- [ ] Order history shows all orders
- [ ] Edit profile modal opens
- [ ] Profile can be updated
- [ ] Logout button works

## 🐛 Common Issues & Solutions

### Issue: Products not loading
**Solution**: Check backend is running on http://127.0.0.1:5000

### Issue: Images not showing
**Solution**: Backend should return valid image URLs in product data

### Issue: Cart not updating
**Solution**: Ensure user is logged in (check localStorage)

### Issue: Filters not working
**Solution**: Check console for errors, verify product data structure

### Issue: Modal not closing
**Solution**: Click outside modal or press close button (×)

## 📝 Notes for Teaching

### Simple Concepts to Explain
1. **Filters**: Show how checkboxes and sliders filter data in memory
2. **Pagination**: Explain array slicing (start, end indices)
3. **Modals**: Show how CSS display/visibility works
4. **API Calls**: Explain fetch and async/await
5. **Local Storage**: Show how to persist user session

### Code Organization
- **Separation of Concerns**: Each JS file has one responsibility
- **Modular Functions**: Small, reusable functions
- **Comments**: Clear explanations throughout
- **Readable HTML**: Proper indentation and structure
- **Expandable CSS**: Organized by sections with comments

## 🔗 API Endpoints Used

```
GET  /products                    - Get all products
GET  /products/<id>               - Get single product
GET  /products?q=search           - Search products
POST /products/<id>/review        - Add review

POST /register                    - Register user
POST /login                       - Login user
GET  /user/<username>             - Get user profile
PUT  /user/<username>             - Update user

GET  /cart/<username>             - Get cart
POST /cart/<username>/add         - Add to cart
POST /cart/<username>/remove      - Remove from cart
PUT  /cart/<username>/update      - Update quantity

POST /checkout                    - Create order
GET  /orders/<username>           - Get user orders
GET  /orders/<id>                 - Get single order
```

## 📚 Learning Resources

- **JavaScript**: Arrow functions, async/await, fetch API
- **HTML**: Semantic structure, forms, accessibility
- **CSS**: Flexbox, Grid, gradients, animations
- **Web APIs**: localStorage, DOM manipulation, events
- **UX/UI**: Responsive design, user feedback, accessibility

---

**Created**: December 2025
**Version**: 1.0
**Status**: Production Ready
