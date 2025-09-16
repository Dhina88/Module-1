// Authentication and Session Management System
class AuthManager {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api'; // Backend API URL
        this.tokenKey = 'authToken';
        this.userKey = 'userData';
        this.sessionKey = 'sessionData';
        this.init();
    }

    init() {
        // Check if user is already logged in
        if (this.isLoggedIn()) {
            this.showDashboard();
        } else {
            this.showLogin();
        }
        
        // Set up form event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginFormElement');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerFormElement');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Password confirmation validation
        const confirmPassword = document.getElementById('confirmPassword');
        if (confirmPassword) {
            confirmPassword.addEventListener('input', () => this.validatePasswordMatch());
        }
    }

    // JWT Token Management
    generateJWT(payload) {
        // In a real application, this would be done on the server
        // For demo purposes, we'll create a simple token
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payloadEncoded = btoa(JSON.stringify(payload));
        const signature = btoa('demo-signature');
        return `${header}.${payloadEncoded}.${signature}`;
    }

    parseJWT(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return null;
            return JSON.parse(atob(parts[1]));
        } catch (error) {
            console.error('Error parsing JWT:', error);
            return null;
        }
    }

    // Authentication Methods
    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password'),
            rememberMe: formData.get('rememberMe') === 'on'
        };

        try {
            this.showLoading('loginFormElement');
            const response = await this.login(loginData);
            this.showMessage('Login successful!', 'success');
            this.showDashboard();
        } catch (error) {
            this.showMessage(error.message, 'error');
        } finally {
            this.hideLoading('loginFormElement');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        // Validate password match
        if (!this.validatePasswordMatch()) {
            this.showMessage('Passwords do not match', 'error');
            return;
        }

        // Validate consent
        const termsConsent = document.getElementById('termsConsent').checked;
        const privacyConsent = document.getElementById('privacyConsent').checked;
        
        if (!termsConsent || !privacyConsent) {
            this.showMessage('You must agree to Terms & Conditions and Privacy Policy', 'error');
            return;
        }

        const registerData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            termsConsent,
            privacyConsent,
            marketingConsent: formData.get('marketingConsent') === 'on'
        };

        try {
            this.showLoading('registerFormElement');
            const response = await this.register(registerData);
            this.showMessage('Account created successfully! Please sign in.', 'success');
            this.showLogin();
        } catch (error) {
            this.showMessage(error.message, 'error');
        } finally {
            this.hideLoading('registerFormElement');
        }
    }

    async login(credentials) {
        // Simulate API call - in real app, this would call your backend
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Demo validation
                if (credentials.email === 'demo@example.com' && credentials.password === 'password123') {
                    const userData = {
                        id: 1,
                        name: 'Demo User',
                        email: credentials.email,
                        loginTime: new Date().toISOString()
                    };
                    
                    const token = this.generateJWT({
                        userId: userData.id,
                        email: userData.email,
                        exp: Math.floor(Date.now() / 1000) + (credentials.rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60) // 30 days or 1 day
                    });

                    this.setSession(userData, token);
                    resolve({ user: userData, token });
                } else {
                    reject(new Error('Invalid email or password'));
                }
            }, 1000);
        });
    }

    async register(userData) {
        // Simulate API call - in real app, this would call your backend
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Demo validation
                if (userData.email && userData.password && userData.name) {
                    resolve({ message: 'User registered successfully' });
                } else {
                    reject(new Error('Registration failed. Please check your information.'));
                }
            }, 1000);
        });
    }

    // Session Management
    setSession(userData, token) {
        localStorage.setItem(this.userKey, JSON.stringify(userData));
        localStorage.setItem(this.tokenKey, token);
        
        const sessionData = {
            loginTime: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            expiresAt: this.getTokenExpiration(token)
        };
        localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
    }

    getSession() {
        const sessionData = localStorage.getItem(this.sessionKey);
        return sessionData ? JSON.parse(sessionData) : null;
    }

    updateLastActivity() {
        const sessionData = this.getSession();
        if (sessionData) {
            sessionData.lastActivity = new Date().toISOString();
            localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
        }
    }

    isLoggedIn() {
        const token = localStorage.getItem(this.tokenKey);
        if (!token) return false;

        const payload = this.parseJWT(token);
        if (!payload) return false;

        // Check if token is expired
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
            this.logout();
            return false;
        }

        return true;
    }

    getTokenExpiration(token) {
        const payload = this.parseJWT(token);
        return payload && payload.exp ? new Date(payload.exp * 1000).toISOString() : null;
    }

    logout() {
        localStorage.removeItem(this.userKey);
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.sessionKey);
        this.showLogin();
    }

    // UI Management
    showLogin() {
        document.getElementById('loginForm').classList.add('active');
        document.getElementById('registerForm').classList.remove('active');
        document.getElementById('dashboard').classList.add('hidden');
    }

    showRegister() {
        document.getElementById('registerForm').classList.add('active');
        document.getElementById('loginForm').classList.remove('active');
        document.getElementById('dashboard').classList.add('hidden');
    }

    showDashboard() {
        document.getElementById('dashboard').classList.remove('hidden');
        document.getElementById('loginForm').classList.remove('active');
        document.getElementById('registerForm').classList.remove('active');
        
        this.updateDashboardInfo();
    }

    updateDashboardInfo() {
        const userData = JSON.parse(localStorage.getItem(this.userKey) || '{}');
        const sessionData = this.getSession();
        
        document.getElementById('userName').textContent = userData.name || 'User';
        document.getElementById('lastLogin').textContent = new Date(sessionData?.loginTime || Date.now()).toLocaleString();
        document.getElementById('sessionExpiry').textContent = sessionData?.expiresAt ? 
            new Date(sessionData.expiresAt).toLocaleString() : 'Unknown';
    }

    // Form Validation
    validatePasswordMatch() {
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (confirmPassword && password !== confirmPassword) {
            document.getElementById('confirmPassword').style.borderColor = '#dc3545';
            return false;
        } else {
            document.getElementById('confirmPassword').style.borderColor = '#e1e5e9';
            return true;
        }
    }

    // Utility Methods
    showLoading(formId) {
        const form = document.getElementById(formId);
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading"></span> Processing...';
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = originalText;
    }

    hideLoading(formId) {
        const form = document.getElementById(formId);
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.innerHTML = submitBtn.dataset.originalText;
        submitBtn.disabled = false;
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;

        // Insert message at the top of the active form
        const activeForm = document.querySelector('.auth-form.active');
        if (activeForm) {
            activeForm.insertBefore(messageDiv, activeForm.firstChild);
            
            // Auto-remove message after 5 seconds
            setTimeout(() => {
                messageDiv.remove();
            }, 5000);
        }
    }
}

// Global Functions for HTML onclick events
function showLogin() {
    authManager.showLogin();
}

function showRegister() {
    authManager.showRegister();
}

function logout() {
    authManager.logout();
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Initialize the authentication manager when the page loads
let authManager;
document.addEventListener('DOMContentLoaded', () => {
    authManager = new AuthManager();
    
    // Update last activity every 5 minutes
    setInterval(() => {
        if (authManager.isLoggedIn()) {
            authManager.updateLastActivity();
        }
    }, 5 * 60 * 1000);
});
