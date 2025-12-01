/**
 * Authentication Module
 * Handles login and registration
 */

/**
 * Handle login form submission
 */
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        await loginUser(username, password);
        
        // Save username to localStorage
        setCurrentUser(username);
        
        showSuccess('✅ Login successful! Redirecting...');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } catch (error) {
        showError(error.message || 'Login failed');
    }
}

/**
 * Handle registration form submission
 */
async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const name = document.getElementById('name').value;
    const surname = document.getElementById('surname').value;
    const gender = document.getElementById('gender').value;
    const birthday = document.getElementById('birthday').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    // Validate password length
    if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }
    
    try {
        await registerUser({
            username,
            password,
            name,
            surname,
            gender,
            birthday
        });
        
        showSuccess('✅ Registration successful! Redirecting to login...');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    } catch (error) {
        showError(error.message || 'Registration failed');
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
