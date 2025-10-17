// Admin Login JavaScript
class AdminAuth {
    constructor() {
        this.initializeLogin();
    }

    initializeLogin() {
        const loginForm = document.getElementById('loginForm');
        loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        
        // Check if already logged in
        if (this.isLoggedIn()) {
            window.location.href = './admin-dashboard.html';
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');
        
        try {
            // For demo purposes, we'll use hardcoded credentials
            // In a real application, this would be handled server-side
            const validCredentials = [
                { username: 'student', password: 'password', role: 'student' },
                { username: 'alumni', password: 'password', role: 'alumni' }
            ];
            
            const user = validCredentials.find(cred => 
                cred.username === username && cred.password === password
            );
            
            if (user) {
                // Store user session
                sessionStorage.setItem('adminUser', JSON.stringify({
                    username: user.username,
                    role: user.role,
                    loginTime: new Date().toISOString()
                }));
                
                // Redirect to dashboard
                window.location.href = './admin-dashboard.html';
            } else {
                this.showError('Invalid username or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Login failed. Please try again.');
        }
    }

    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 5000);
    }

    isLoggedIn() {
        const user = sessionStorage.getItem('adminUser');
        if (!user) return false;
        
        try {
            const userData = JSON.parse(user);
            const loginTime = new Date(userData.loginTime);
            const now = new Date();
            const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);
            
            // Session expires after 8 hours
            return hoursSinceLogin < 8;
        } catch (error) {
            return false;
        }
    }
}

// Initialize admin auth when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdminAuth();
});