// js/app.js

// API Base URL
const API_URL = process.env.API_URL || 'http://localhost:3000/api';

// State
let state = {
    token: null,
    user: null,
    currentView: 'dashboard',
    currentSubject: null,
    sessionActive: false,
    sessionStartTime: null,
    flashcards: [],
    currentCardIndex: 0
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadSubjects();
    setupDragDrop();
});

// Auth
async function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        state.token = token;
        try {
            const res = await fetch(`${API_URL}/user`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                state.user = await res.json();
                showApp();
            } else {
                localStorage.removeItem('token');
            }
        } catch (err) {
            console.error('Auth Fehler:', err);
        }
    }
}

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
            localStorage.setItem('token', data.token);
            state.token = data.token;
            state.user = data.user;
            showApp();
        } else {
            alert(data.error);
        }
    } catch (err) {
        alert('Verbindungsfehler');
    }
}

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
            localStorage.setItem('token', data.token);
            state.token = data.token;
            state.user = data.user;
            closeModal('registerModal');
            showApp();
        } else {
            alert(data.error);
        }
    } catch (err) {
        alert('Registrierung fehlgeschlagen');
    }
}

function logout() {
    localStorage.removeItem('token');
    state.token = null;
    state.user = null;
    document.getElementById('app').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
}

function showApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    document.getElementById('userName').textContent = state.user.name;
    document.getElementById('userSchool').textContent = state.user.school || '';
    document.getElementById('userAvatar').textContent = state.user.name.split(' ').map(n => n[0]).join('');
    
    loadDashboard();
    startSessionTimer();
}

function showRegister() {
    document.getElementById('registerModal').style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

// Navigation
function switchView(view) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`view-${view}`).classList.add('active');
    document.querySelector(`[data-view="${view}"]`)?.classList.add('active');
    
    state.currentView = view;
    document.getElementById('currentPath').textContent = view.charAt(0).toUpperCase() + view.slice(1);
    
    if (view === 'dashboard') loadDashboard();
    if (view === 'subjects') loadSubjects();
    if (view === 'sessions') loadSessions();
    if (view === 'flashcards') loadFlashcards();
    if (view === 'settings') loadSettings();
}

// Dashboard
async function loadDashboard() {
    try {
        const [progressRes, userRes] = await Promise.all([
            fetch(`${API_URL}/progress`, { headers: { Authorization: `Bearer ${state.token}` } }),
            fetch(`${API_URL}/user`, { headers: { Authorization: `Bearer ${state.token}` } })
        ]);
        
        const progress = await progressRes.json();
        const user = await userRes.json();
        
        // Update Stats
        const knownTopics = progress.filter(p => p.status === 'known').length;
        const totalTopics = 120; // Total from curriculum
        const percent = Math.round((knownTopics / totalTopics) * 100);
        
        document.getElementById('streakDisplay').textContent = user.progress?.streak || 0;
        document.getElementById('topicsLearned').textContent = knownTopics;
        document.getElementById('totalHours').textContent = `${(user.progress?.totalHours || 0) / 60}h`;
        document.getElementById('progressPercent').textContent = `${percent}%`;
        document.getElementById('progressBar').style.width = `${percent}%`;
        document.getElementById('progressCount').textContent = `${knownTopics} von ${totalTopics} Themen`;
        
        // Today's Reviews
        const today = new Date();
        const dueReviews = progress.filter(p => new Date(p.nextReview) <= today);
        
        if (dueReviews.length > 0) {
            document.getElementById('todayReviews').innerHTML = `
                <p>📚 ${dueReviews.length} Wiederholungen anstehend</p>
                <button class="btn btn-primary" onclick="startReviewSession()">Jetzt lernen</button>
            `;
        }
    } catch (err) {
        console.error('Dashboard Fehler:', err);
    }
}

// Subjects
const SUBJECTS = {
    "Mathematik": { icon: "📐", topics: [...] },
    "Physik": { icon: "⚡", topics: [...] },
    // ... all subjects from curriculum
};

function loadSubjects() {
    const container = document.getElementById('subjectsOverview');
    container.innerHTML = '';
    
    Object.entries(SUBJECTS).forEach(([name, data]) => {
        const card = document.createElement('div');
        card.className = 'subject-card';
        card.innerHTML = `
            <span class="subject-icon">${data.icon}</span>
            <h3>${name}</h3>
            <p>${data.topics.length} Themen</p>
        `;
        card.onclick = () => openSubject(name);
        container.appendChild(card);
    });
}

function openSubject(name) {
    state.currentSubject = name;
    document.getElementById('subjectsOverview').style.display = 'none';
    document.getElementById('subjectDetail').style.display = 'block';
    document.getElementById('currentPath').textContent = name;
    
    loadTopics(name);
}

function loadTopics(subject) {
    const grid = document.getElementById('topicsGrid');
    grid.innerHTML = '';
    
    SUBJECTS[subject].topics.forEach(topic => {
        const card = document.createElement('div');
        card.className = 'topic-card';
        card.innerHTML = `
            <div class="topic-header">
                <span class="badge ${topic.lkOnly ? 'badge-lk' : 'badge-gk'}">
                    ${topic.lkOnly ? 'LK' : 'GK'}
                </span>
            </div>
            <h3>${topic.title}</h3>
            <p>${topic.desc}</p>
            <div class="knowledge-buttons">
                <button class="btn btn-kanich" onclick="updateKnowledge('${topic.id}', true)">✔ Kann ich</button>
                <button class="btn btn-unsicher" onclick="updateKnowledge('${topic.id}', false)">❌ Unsicher</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function switchSubjectTab(tab) {
    document.querySelectorAll('.internal-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tab}"]`)?.classList.add('active');
    document.getElementById(`tab-${tab}`)?.classList.add('active');
}

// Knowledge Tracking
async function updateKnowledge(topicId, known) {
    try {
        const res = await fetch(`${API_URL}/progress`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${state.token}`
            },
            body: JSON.stringify({
                topicId,
                subject: state.currentSubject,
                quality: known ? 5 : 1
            })
        });
        
        if (res.ok) {
            alert(known ? '✅ Gespeichert!' : '📝 Wird wiederholt');
            loadTopics(state.currentSubject);
        }
    } catch (err) {
        alert('Fehler beim Speichern');
    }
}

// File Upload
function setupDragDrop() {
    const dropZone = document.getElementById('dropZone');
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--accent)';
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = 'var(--border)';
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border)';
        handleFile(e.dataTransfer.files[0]);
    });
    
    document.getElementById('fileInput').addEventListener('change', (e) => {
        handleFile(e.target.files[0]);
    });
}

async function handleFile(file) {
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subject', state.currentSubject);
    
    const types = document.querySelectorAll('input[name="uploadType"]:checked');
    formData.append('types', Array.from(types).map(t => t.value).join(','));
    
    document.getElementById('uploadProgress').style.display = 'block';
    
    try {
        const res = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${state.token}` },
            body: formData
        });
        
        const result = await res.json();
        
        document.getElementById('uploadProgress').style.display = 'none';
        document.getElementById('uploadResult').style.display = 'block';
        document.getElementById('resultTopics').textContent = result.topics;
        document.getElementById('resultCards').textContent = result.flashcards;
        document.getElementById('resultQuiz').textContent = result.quiz;
    } catch (err) {
        alert('Upload fehlgeschlagen');
    }
}

// Flashcards
async function loadFlashcards() {
    const subject = document.getElementById('flashcardSubject').value;
    
    try {
        const res = await fetch(`${API_URL}/flashcards?subject=${subject}`, {
            headers: { Authorization: `Bearer ${state.token}` }
        });
        
        state.flashcards = await res.json();
        state.currentCardIndex = 0;
        
        if (state.flashcards.length > 0) {
            showCard(0);
        } else {
            document.getElementById('cardQuestion').textContent = 'Keine Karteikarten vorhanden';
            document.getElementById('cardAnswer').textContent = 'Lade erst Material hoch oder erstelle eigene Themen';
        }
        
        document.getElementById('cardTotal').textContent = state.flashcards.length;
    } catch (err) {
        console.error('Flashcards Fehler:', err);
    }
}

function showCard(index) {
    const card = document.querySelector('.flashcard');
    card.classList.remove('flipped');
    
    setTimeout(() => {
        const fc = state.flashcards[index];
        document.getElementById('cardQuestion').textContent = fc.question;
        document.getElementById('cardAnswer').textContent = fc.answer;
        document.getElementById('cardCurrent').textContent = index + 1;
    }, 300);
}

function flipCard() {
    document.querySelector('.flashcard').classList.toggle('flipped');
}

async function rateCard(quality) {
    // Save rating
    state.currentCardIndex++;
    
    if (state.currentCardIndex < state.flashcards.length) {
        showCard(state.currentCardIndex);
    } else {
        alert('🎉 Alle Karten durchgearbeitet!');
        loadFlashcards();
    }
}

// AI Tutor
async function sendChat() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;
    
    const chatMessages = document.getElementById('chatMessages');
    
    // User message
    chatMessages.innerHTML += `
        <div class="message user-message">
            <div class="message-content">
                <p>${message}</p>
            </div>
        </div>
    `;
    
    input.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // AI response
    try {
        const res = await fetch(`${API_URL}/ai/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${state.token}`
            },
            body: JSON.stringify({
                message,
                context: state.currentSubject
            })
        });
        
        const data = await res.json();
        
        chatMessages.innerHTML += `
            <div class="message ai-message">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <p>${data.response}</p>
                </div>
            </div>
        `;
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (err) {
        chatMessages.innerHTML += `
            <div class="message ai-message">
                <div class="message-content">
                    <p class="text-danger">Fehler bei der Verbindung</p>
                </div>
            </div>
        `;
    }
}

function handleChatKey(e) {
    if (e.key === 'Enter') sendChat();
}

// Session Timer
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

function quickStart(subject) {
    switchView('subjects');
    setTimeout(() => openSubject(subject), 100);
}

// Settings
function loadSettings() {
    document.getElementById('settingsName').value = state.user.name;
    document.getElementById('settingsEmail').value = state.user.email;
    document.getElementById('settingsSchool').value = state.user.school || '';
}

async function saveProfile() {
    try {
        const res = await fetch(`${API_URL}/user`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${state.token}`
            },
            body: JSON.stringify({
                name: document.getElementById('settingsName').value,
                email: document.getElementById('settingsEmail').value,
                school: document.getElementById('settingsSchool').value,
                settings: {
                    breakInterval: parseInt(document.getElementById('settingsBreakInterval').value),
                    altInterval: parseInt(document.getElementById('settingsAltInterval').value),
                    dailyGoal: parseInt(document.getElementById('settingsDailyGoal').value)
                }
            })
        });
        
        if (res.ok) {
            alert('✅ Einstellungen gespeichert');
            state.user = await res.json();
        }
    } catch (err) {
        alert('Fehler beim Speichern');
    }
}

function exportData() {
    const data = {
        user: state.user,
        timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abitur-sn-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
}

async function deleteAccount() {
    if (confirm('⚠️ Wirklich löschen? Alle Daten gehen verloren!')) {
        // Implement delete endpoint
        logout();
    }
}