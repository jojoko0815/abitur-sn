// Authentication Functions

// Show Register Modal
function showRegister() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Close Modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const data = await api.login(email, password);
        
        localStorage.setItem('token', data.token);
        state.token = data.token;
        state.user = data.user;
        
        showApp();
    } catch (error) {
        alert('Login fehlgeschlagen: ' + error.message);
    }
}

// Handle Register
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const school = document.getElementById('regSchool').value;
    
    try {
        const data = await api.register(name, email, password, school);
        
        localStorage.setItem('token', data.token);
        state.token = data.token;
        state.user = data.user;
        
        closeModal('registerModal');
        showApp();
    } catch (error) {
        alert('Registrierung fehlgeschlagen: ' + error.message);
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    state.token = null;
    state.user = null;
    
    const app = document.getElementById('app');
    const loginScreen = document.getElementById('loginScreen');
    
    if (app) app.style.display = 'none';
    if (loginScreen) loginScreen.style.display = 'flex';
}

// Check Authentication
async function checkAuth() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        showLoginScreen();
        return;
    }
    
    try {
        state.token = token;
        state.user = await api.getUser();
        showApp();
    } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        showLoginScreen();
    }
}

// Show Login Screen
function showLoginScreen() {
    const app = document.getElementById('app');
    const loginScreen = document.getElementById('loginScreen');
    
    if (app) app.style.display = 'none';
    if (loginScreen) loginScreen.style.display = 'flex';
}

// Show App
function showApp() {
    const app = document.getElementById('app');
    const loginScreen = document.getElementById('loginScreen');
    
    if (state.user) {
        const userName = document.getElementById('userName');
        const userSchool = document.getElementById('userSchool');
        const userAvatar = document.getElementById('userAvatar');
        
        if (userName) userName.textContent = state.user.name || 'User';
        if (userSchool) userSchool.textContent = state.user.school || '';
        if (userAvatar) {
            const initials = (state.user.name || 'U').split(' ').map(n => n[0]).join('');
            userAvatar.textContent = initials.toUpperCase();
        }
    }
    
    if (app) app.style.display = 'flex';
    if (loginScreen) loginScreen.style.display = 'none';
    
    loadDashboard();
}