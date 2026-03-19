// frontend/js/app.js

// ============================================
// API URL - WICHTIG!
// ============================================
const API_URL = window.location.origin + '/api';

// ============================================
// STATE
// ============================================
let state = {
    token: localStorage.getItem('token') || null,
    user: null,
    currentView: 'dashboard',
    sessionActive: false,
    sessionStartTime: null
};

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

// ============================================
// AUTH FUNCTIONS
// ============================================

// Check Authentication on Load
async function checkAuth() {
    if (state.token) {
        try {
            const res = await fetch(`${API_URL}/user`, {
                headers: { Authorization: `Bearer ${state.token}` }
            });
            if (res.ok) {
                state.user = await res.json();
                showApp();
            } else {
                logout();
            }
        } catch (err) {
            console.error('Auth Error:', err);
            logout();
        }
    }
}

// Show App (after login)
function showApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    
    if (state.user) {
        document.getElementById('userName').textContent = state.user.name || 'User';
        document.getElementById('userSchool').textContent = state.user.school || '';
        const initials = (state.user.name || 'U').split(' ').map(n => n[0]).join('');
        document.getElementById('userAvatar').textContent = initials.toUpperCase();
    }
    
    loadDashboard();
}

// Show Register Modal
function showRegister() {
    document.getElementById('registerModal').style.display = 'flex';
}

// Close Modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            state.token = data.token;
            state.user = data.user;
            localStorage.setItem('token', data.token);
            showApp();
        } else {
            alert(data.error || 'Login fehlgeschlagen');
        }
    } catch (err) {
        alert('Verbindungsfehler: ' + err.message);
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
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, school })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            state.token = data.token;
            state.user = data.user;
            localStorage.setItem('token', data.token);
            closeModal('registerModal');
            showApp();
        } else {
            alert(data.error || 'Registrierung fehlgeschlagen');
        }
    } catch (err) {
        alert('Verbindungsfehler: ' + err.message);
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    state.token = null;
    state.user = null;
    document.getElementById('app').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
}

// ============================================
// DASHBOARD
// ============================================
async function loadDashboard() {
    try {
        const [progressRes, userRes] = await Promise.all([
            fetch(`${API_URL}/progress`, { headers: { Authorization: `Bearer ${state.token}` } }),
            fetch(`${API_URL}/user`, { headers: { Authorization: `Bearer ${state.token}` } })
        ]);
        
        const progress = await progressRes.json();
        const user = await userRes.json();
        
        const knownTopics = progress.filter(p => p.status === 'known').length;
        const totalTopics = 120;
        const percent = Math.round((knownTopics / totalTopics) * 100);
        
        document.getElementById('streakDisplay').textContent = user.progress?.streak || 0;
        document.getElementById('topicsLearned').textContent = knownTopics;
        document.getElementById('progressPercent').textContent = `${percent}%`;
        document.getElementById('progressBar').style.width = `${percent}%`;
        document.getElementById('progressCount').textContent = `${knownTopics} von ${totalTopics} Themen`;
    } catch (err) {
        console.error('Dashboard Error:', err);
    }
}

// ============================================
// NAVIGATION
// ============================================
function switchView(view) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`view-${view}`).classList.add('active');
    document.querySelector(`[data-view="${view}"]`)?.classList.add('active');
    
    state.currentView = view;
}

// ============================================
// SESSION TIMER
// ============================================
function startSessionTimer() {
    if (state.sessionActive) {
        setInterval(() => {
            const diff = Math.floor((Date.now() - state.sessionStartTime) / 1000);
            const mins = Math.floor(diff / 60);
            const secs = diff % 60;
            document.getElementById('sessionTimer').textContent = 
                `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }, 1000);
    }
}

// ============================================
// QUICK START
// ============================================
function quickStart(subject) {
    switchView('subjects');
    setTimeout(() => openSubject(subject), 100);
}