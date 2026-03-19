
// ============================================
// API URL - WICHTIG!
// ============================================

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

async function checkAuth() {
    if (state.token) {
        try {
            const res = await fetch(`${API_URL}/user`, {
                headers: { Authorization: `Bearer ${state.token}` }
            });
            if (res.ok) {
                state.user = await res.json();
                await loadCurriculum(); // ← NEU: Curriculum laden
                renderSubjectOverview(); // ← NEU: Fächer anzeigen
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
        const res = await fetch('${API_URL}/auth/login', {
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
// ============================================
// SESSION FUNCTIONS
// ============================================

function openCreateSessionModal() {
    const modal = document.getElementById('sessionModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function createSession() {
    const checkboxes = document.querySelectorAll('.session-topic:checked');
    if (checkboxes.length === 0) {
        alert('Bitte wähle mindestens ein Thema.');
        return;
    }
    
    const topics = Array.from(checkboxes).map(cb => cb.value);
    
    // Session erstellen (API Call)
    api.createSession(topics)
        .then(() => {
            closeModal('sessionModal');
            alert('Session erstellt!');
            loadSessions();
        })
        .catch(err => {
            alert('Fehler: ' + err.message);
        });
}

// ============================================
// FLASHCARD FUNCTIONS
// ============================================

let currentFlashcards = [];
let currentCardIndex = 0;

function flipCard() {
    const card = document.querySelector('.flashcard');
    if (card) {
        card.classList.toggle('flipped');
    }
}

async function rateCard(quality) {
    if (currentFlashcards.length === 0) return;
    
    const card = currentFlashcards[currentCardIndex];
    
    // Fortschritt speichern
    try {
        await api.updateProgress(card.topic || 'flashcard', card.subject, quality);
    } catch (err) {
        console.error('Error saving progress:', err);
    }
    
    // Nächste Karte
    currentCardIndex++;
    
    if (currentCardIndex < currentFlashcards.length) {
        showCard(currentCardIndex);
    } else {
        alert('Alle Karten durchgearbeitet! 🎉');
        loadFlashcards();
    }
}

async function showCard(index) {
    const card = document.querySelector('.flashcard');
    if (card) {
        card.classList.remove('flipped');
    }
    
    setTimeout(() => {
        const flashcard = currentFlashcards[index];
        const questionEl = document.getElementById('cardQuestion');
        const answerEl = document.getElementById('cardAnswer');
        const currentEl = document.getElementById('cardCurrent');
        const totalEl = document.getElementById('cardTotal');
        
        if (questionEl) questionEl.textContent = flashcard.question || 'Frage';
        if (answerEl) answerEl.textContent = flashcard.answer || 'Antwort';
        if (currentEl) currentEl.textContent = index + 1;
        if (totalEl) totalEl.textContent = currentFlashcards.length;
    }, 300);
}

async function loadFlashcards() {
    const subjectSelect = document.getElementById('flashcardSubject');
    const subject = subjectSelect ? subjectSelect.value : 'all';
    
    try {
        currentFlashcards = await api.getFlashcards(subject);
        currentCardIndex = 0;
        
        if (currentFlashcards.length > 0) {
            showCard(0);
        } else {
            const questionEl = document.getElementById('cardQuestion');
            const answerEl = document.getElementById('cardAnswer');
            if (questionEl) questionEl.textContent = 'Keine Karteikarten vorhanden';
            if (answerEl) answerEl.textContent = 'Lade erst Material hoch oder erstelle eigene Themen';
        }
    } catch (err) {
        console.error('Error loading flashcards:', err);
    }
}

// ============================================
// CHAT FUNCTIONS
// ============================================

function handleChatKey(e) {
    if (e.key === 'Enter') {
        sendChat();
    }
}

async function sendChat() {
    const input = document.getElementById('chatInput');
    const message = input ? input.value.trim() : '';
    
    if (!message) return;
    
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    // User message anzeigen
    chatMessages.innerHTML += `
        <div class="message user-message">
            <div class="message-content">
                <p>${message}</p>
            </div>
        </div>
    `;
    
    if (input) input.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // AI response
    try {
        const data = await api.chatWithAI(message, state.currentSubject || 'Allgemein');
        
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

// ============================================
// SUBJECT FUNCTIONS
// ============================================

function openSubject(subjectName) {
    state.currentSubject = subjectName;
    
    const overview = document.getElementById('subjectsOverview');
    const detail = document.getElementById('subjectDetail');
    const breadcrumb = document.getElementById('subjectBreadcrumb');
    
    if (overview) overview.style.display = 'none';
    if (detail) detail.style.display = 'block';
    if (breadcrumb) breadcrumb.innerHTML = ` / <span style="color:var(--text-main)">${subjectName}</span>`;
    
    loadTopics(subjectName);
}

function switchSubjectTab(tabName) {
    // Tabs aktualisieren
    document.querySelectorAll('.internal-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    const activeContent = document.getElementById(`tab-${tabName}`);
    
    if (activeTab) activeTab.classList.add('active');
    if (activeContent) activeContent.classList.add('active');
}

function loadTopics(subject) {
    const grid = document.getElementById('topicsGrid');
    if (!grid) return;
    
    grid.innerHTML = '<p>Lade Themen...</p>';
    
    // Hier würdest du normalerweise Topics von der API laden
    // Für jetzt nur Dummy-Daten
    setTimeout(() => {
        grid.innerHTML = `
            <div class="topic-card">
                <h3>Thema 1 in ${subject}</h3>
                <p>Beschreibung folgt...</p>
                <div class="knowledge-buttons">
                    <button class="btn btn-kanich" onclick="alert('Gespeichert!')">✔ Kann ich</button>
                    <button class="btn btn-unsicher" onclick="alert('Wird wiederholt!')">❌ Unsicher</button>
                </div>
            </div>
        `;
    }, 500);
}

function loadSubjects() {
    const container = document.getElementById('subjectsOverview');
    if (!container) return;
    
    const subjects = ['Mathematik', 'Physik', 'Chemie', 'Biologie', 'Deutsch', 'Englisch', 'Geschichte', 'Geographie', 'Gemeinschaftskunde', 'Ethik'];
    
    container.innerHTML = subjects.map(subject => `
        <div class="subject-card" onclick="openSubject('${subject}')">
            <span class="subject-icon">📚</span>
            <h3>${subject}</h3>
            <p>Themen laden...</p>
        </div>
    `).join('');
}

// ============================================
// SESSIONS & SETTINGS
// ============================================

function loadSessions() {
    // Sessions laden (wird später implementiert)
    console.log('Sessions laden...');
}

function saveProfile() {
    const name = document.getElementById('settingsName')?.value;
    const email = document.getElementById('settingsEmail')?.value;
    const school = document.getElementById('settingsSchool')?.value;
    
    api.updateUser({ name, email, school })
        .then(() => {
            alert('Profil gespeichert!');
            state.user = { ...state.user, name, email, school };
        })
        .catch(err => {
            alert('Fehler: ' + err.message);
        });
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

function deleteAccount() {
    if (confirm('⚠️ Wirklich löschen? Alle Daten gehen verloren!')) {
        logout();
    }
}

function createCustomTopic() {
    const title = document.getElementById('customTopicTitle')?.value;
    const desc = document.getElementById('customTopicDesc')?.value;
    
    if (!title) {
        alert('Bitte Thema eingeben');
        return;
    }
    
    const resultDiv = document.getElementById('customTopicResult');
    if (resultDiv) {
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <h4>✨ Thema wurde erstellt!</h4>
            <div class="card" style="background: var(--bg-dark); margin-top: 1rem;">
                <h4>${title}</h4>
                <p>${desc || 'KI-generierte Zusammenfassung...'}</p>
                <button class="btn btn-outline" style="margin-top: 0.5rem;" onclick="alert('Zum Lernplan hinzugefügt!')">➕ Zum Plan hinzufügen</button>
            </div>
        `;
    }
}

function viewFlashcards() {
    switchView('flashcards');
    loadFlashcards();
}

function startQuiz() {
    alert('Quiz wird gestartet... (Feature kommt bald!)');
}

function updateSettingDisplay(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = value + ' Min';
    }
}
// ============================================
// CURRICULUM FUNCTIONS
// ============================================

let curriculumData = {};

// Curriculum laden
async function loadCurriculum() {
    try {
        const res = await fetch(`${API_URL}/curriculum`);
        curriculumData = await res.json();
        return curriculumData;
    } catch (err) {
        console.error('Curriculum Error:', err);
        return {};
    }
}

// Fächer anzeigen
function renderSubjectOverview() {
    const container = document.getElementById('subjectsOverview');
    if (!container) return;
    
    container.innerHTML = Object.entries(curriculumData).map(([name, data]) => `
        <div class="subject-card" onclick="openSubject('${name}')">
            <span class="subject-icon">${data.icon}</span>
            <h3>${name}</h3>
            <p>${data.topics.length} Themen</p>
        </div>
    `).join('');
}

// Themen eines Fachs anzeigen
function loadTopics(subject) {
    const grid = document.getElementById('topicsGrid');
    if (!grid || !curriculumData[subject]) return;
    
    grid.innerHTML = curriculumData[subject].topics.map(topic => {
        const prog = state.progress?.[topic.id] || { status: 'unknown' };
        const statusIcon = prog.status === 'known' ? '🟢' : prog.status === 'unsure' ? '🔴' : '⚪';
        
        return `
            <div class="topic-card">
                <div class="topic-header">
                    <span class="badge ${topic.lkOnly ? 'badge-lk' : 'badge-gk'}">
                        ${topic.lkOnly ? 'LK' : 'GK'}
                    </span>
                    <span>${statusIcon}</span>
                </div>
                <h3>${topic.title}</h3>
                <p>${topic.description}</p>
                <p style="font-size:0.8rem; color:var(--accent)">🎯 ${topic.exam}</p>
                <div class="knowledge-buttons">
                    <button class="btn btn-kanich" onclick="updateKnowledge('${topic.id}', true)">✔ Kann ich</button>
                    <button class="btn btn-unsicher" onclick="updateKnowledge('${topic.id}', false)">❌ Unsicher</button>
                </div>
                <button class="btn btn-outline" style="width:100%; margin-top:0.5rem; font-size:0.8rem" onclick="generateTask('${subject}', '${topic.title}')">📝 Aufgabe generieren</button>
            </div>
        `;
    }).join('');
}

// Fach öffnen
function openSubject(subjectName) {
    state.currentSubject = subjectName;
    
    const overview = document.getElementById('subjectsOverview');
    const detail = document.getElementById('subjectDetail');
    const breadcrumb = document.getElementById('subjectBreadcrumb');
    
    if (overview) overview.style.display = 'none';
    if (detail) detail.style.display = 'block';
    if (breadcrumb) breadcrumb.innerHTML = ` / <span style="color:var(--text-main)">${subjectName}</span>`;
    
    loadTopics(subjectName);
}

// Wissen updaten
async function updateKnowledge(topicId, known) {
    try {
        const res = await fetch(`${API_URL}/progress`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({
                topicId,
                subject: state.currentSubject,
                quality: known ? 5 : 1
            })
        });
        
        if (res.ok) {
            alert(known ? '✅ Gespeichert!' : '📝 Wird wiederholt');
            if (state.currentSubject) loadTopics(state.currentSubject);
        }
    } catch (err) {
        alert('Fehler beim Speichern');
    }
}