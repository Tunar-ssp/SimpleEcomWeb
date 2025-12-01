async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    try {
        await loginUser(username, password);
        setCurrentUser(username);
        showSuccess('✅ Login!');
        setTimeout(() => window.location.href = 'index.html', 1500);
    } catch (err) { showError(err.message || 'Failed'); }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const name = document.getElementById('name').value;
    const surname = document.getElementById('surname').value;
    const gender = document.getElementById('gender').value;
    const birthday = document.getElementById('birthday').value;
    
    if (password !== confirmPassword) { showError('Passwords not match'); return; }
    if (password.length < 6) { showError('Min 6 chars'); return; }
    
    try {
        await registerUser({ username, password, name, surname, gender, birthday });
        showSuccess('✅ Registered!');
        setTimeout(() => window.location.href = 'login.html', 1500);
    } catch (err) { showError(err.message || 'Failed'); }
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
