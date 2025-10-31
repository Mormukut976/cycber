// Auth.js - Authentication functions
const API_BASE = 'https://cycber-1.onrender.com/api/v1';

// Modal Functions
function openLoginModal() {
    closeRegisterModal();
    document.getElementById('loginModal').style.display = 'block';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function openRegisterModal() {
    closeLoginModal();
    document.getElementById('registerModal').style.display = 'block';
}

function closeRegisterModal() {
    document.getElementById('registerModal').style.display = 'none';
}

function switchToRegister() {
    closeLoginModal();
    openRegisterModal();
}

function switchToLogin() {
    closeRegisterModal();
    openLoginModal();
}

// Auth Functions
async function login(email, password) {
    try {
        window.showLoading();
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok || data.status !== 'success') {
            throw new Error(data.message || 'Login failed');
        }
        const { token, user } = data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        closeLoginModal();
        window.updateUIForAuth(user);
        window.showNotification('Login successful!', 'success');
        return { success: true, user };
    } catch (error) {
        console.error('Login error:', error);
        window.showNotification(error.message || 'Login failed. Please try again.', 'error');
        return { success: false, message: error.message };
    } finally {
        window.hideLoading();
    }
}

async function register(name, email, password, confirmPassword) {
    try {
        if (password !== confirmPassword) {
            throw new Error('Passwords do not match');
        }
        window.showLoading();
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (!res.ok || data.status !== 'success') {
            throw new Error(data.message || 'Registration failed');
        }
        const { token, user } = data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        closeRegisterModal();
        window.updateUIForAuth(user);
        window.showNotification('Registration successful!', 'success');
        return { success: true, user };
    } catch (error) {
        console.error('Registration error:', error);
        window.showNotification(error.message || 'Registration failed', 'error');
        return { success: false, message: error.message };
    } finally {
        window.hideLoading();
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.updateUIForAuth(null);
    window.showNotification('Logged out successfully', 'info');
    window.location.reload();
}

// Form Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            await login(email, password);
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;

            await register(name, email, password, confirmPassword);
        });
    }
});

// Global functions
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.openRegisterModal = openRegisterModal;
window.closeRegisterModal = closeRegisterModal;
window.switchToRegister = switchToRegister;
window.switchToLogin = switchToLogin;
window.logout = logout;
