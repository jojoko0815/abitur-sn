// frontend/js/app.js  –  komplett überarbeitet

// ── State ────────────────────────────────────────────────────────
let state = {
    token:          localStorage.getItem('token') || null,
    user:           null,
    kurs:           localStorage.getItem('kurs') || 'gk',
    currentView:    'dashboard',
    currentSubject: null,
    curriculum:     {},
    progress:       [],
    flashcards:     [],
    currentCardIdx: 0,
    sessionActive:  false,
    sessionStartTime: null,
};

// ── Init ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    startSessionTimer();
});

// ── Auth ─────────────────────────────────────────────────────────
async function checkAuth() {
    if (!state.token) { showLoginScreen(); return; }
    try {
        const res = await fetch(`${API_URL}/user`, {
            headers: { Authorization: `Bearer ${state.token}` }
        });
        if (!res.ok) throw new Error('Unauthorized');
        state.user = await res.json();
        if (state.user.kurs) { state.kurs = state.user.kurs; localStorage.setItem('kurs', state.kurs); }
        await loadCurriculum();
        showApp();
    } catch {
        localStorage.removeItem('token');
        state.token = null;
        showLoginScreen();
    }
}

function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
}

function showApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    if (state.user) {
        const name = state.user.name || 'Jonas K.';
        setText('userName',   name);
        setText('userSchool', state.user.school || '');
        const av = document.getElementById('userAvatar');
        if (av) av.textContent = name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
        // Pre-fill settings
        const sn = document.getElementById('settingsName');
        const se = document.getElementById('settingsEmail');
        const ss = document.getElementById('settingsSchool');
        if (sn) sn.value = name;
        if (se) se.value = state.user.email || '';
        if (ss) ss.value = state.user.school || '';
    }
    updateKursToggle();
    populateSubjectDropdown();
    loadDashboard();
}

function showRegister()      { document.getElementById('registerModal').style.display = 'flex'; }
function closeModal(id)      { document.getElementById(id).style.display = 'none'; }

async function handleLogin(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type=submit]');
    if (btn) { btn.textContent = 'Anmelden…'; btn.disabled = true; }
    try {
        const res  = await fetch(`${API_URL}/auth/login`, {
            method: 'POST', headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
                email:    document.getElementById('email').value,
                password: document.getElementById('password').value
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login fehlgeschlagen');
        state.token = data.token;
        state.user  = data.user;
        localStorage.setItem('token', data.token);
        await loadCurriculum();
        showApp();
    } catch (err) {
        alert(err.message);
        if (btn) { btn.textContent = 'Anmelden'; btn.disabled = false; }
    }
}

async function handleRegister(e) {
    e.preventDefault();
    try {
        const res  = await fetch(`${API_URL}/auth/register`, {
            method: 'POST', headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
                name:     document.getElementById('regName').value,
                email:    document.getElementById('regEmail').value,
                password: document.getElementById('regPassword').value,
                school:   document.getElementById('regSchool').value
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        state.token = data.token;
        state.user  = data.user;
        localStorage.setItem('token', data.token);
        closeModal('registerModal');
        await loadCurriculum();
        showApp();
    } catch (err) {
        alert('Registrierung fehlgeschlagen: ' + err.message);
    }
}

function logout() {
    localStorage.removeItem('token');
    state.token = null; state.user = null;
    showLoginScreen();
}

// ── GK/LK ────────────────────────────────────────────────────────
function setKurs(kurs) {
    state.kurs = kurs;
    localStorage.setItem('kurs', kurs);
    updateKursToggle();
    if (state.currentSubject) renderTopics(state.currentSubject);
    if (state.currentView === 'subjects') renderSubjectOverview();
}

function updateKursToggle() {
    document.querySelectorAll('.kurs-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.kurs === state.kurs);
    });
}

// ── Curriculum ───────────────────────────────────────────────────
async function loadCurriculum() {
    try {
        const res = await fetch(`${API_URL}/curriculum`);
        if (res.ok) state.curriculum = await res.json();
    } catch { state.curriculum = {}; }
}

function getTopics(subjectData) {
    const gk = subjectData.topicsGK || subjectData.topics || [];
    const lk = subjectData.topicsLK || [];
    return state.kurs === 'lk' ? [...gk, ...lk] : gk;
}

// ── Dashboard ────────────────────────────────────────────────────
async function loadDashboard() {
    try {
        const [progressRes, userRes] = await Promise.all([
            fetch(`${API_URL}/progress`,   { headers: { Authorization: `Bearer ${state.token}` } }),
            fetch(`${API_URL}/user`,        { headers: { Authorization: `Bearer ${state.token}` } })
        ]);
        const progress = await progressRes.json();
        const user     = await userRes.json();
        state.progress = Array.isArray(progress) ? progress : [];
        state.user     = user;

        const known = state.progress.filter(p => p.status === 'known').length;
        const total = Object.values(state.curriculum).reduce((acc, s) => acc + getTopics(s).length, 0) || 120;
        const pct   = Math.round((known / total) * 100);

        setText('streakDisplay',   user.progress?.streak || 0);
        setText('topicsLearned',   known);
        setText('totalHours',      (user.progress?.totalHours || 0) + 'h');
        setText('accuracy',        state.progress.length > 0
            ? Math.round(known / state.progress.length * 100) + '%' : '0%');
        setText('progressPercent', pct + '%');
        setText('progressCount',   `${known} von ${total} Themen`);
        const bar = document.getElementById('progressBar');
        if (bar) bar.style.width = pct + '%';

        // Heutige Wiederholungen
        const due = state.progress.filter(p => p.nextReview && new Date(p.nextReview) <= new Date());
        const dueEl = document.getElementById('todayReviews');
        if (dueEl) {
            dueEl.innerHTML = due.length === 0
                ? '<p class="empty-state">✅ Keine Wiederholungen – weiter so!</p>'
                : due.slice(0,5).map(p =>
                    `<div class="review-item" onclick="quickStart('${p.subject}')">
                        📌 <strong>${p.subject}</strong> – ${p.topicId}
                        <span class="badge badge-unsicher">Wiederholen</span>
                    </div>`).join('');
        }
        renderSRSTable(state.progress.slice(0,10));
    } catch (err) { console.error('Dashboard Error:', err); }
}

function renderSRSTable(progress) {
    const tbody = document.getElementById('srsTableBody');
    if (!tbody) return;
    tbody.innerHTML = progress.length === 0
        ? '<tr><td colspan="6" class="empty-state">Noch keine Themen geübt</td></tr>'
        : progress.map(p => `<tr>
            <td>${p.topicId}</td>
            <td>${p.subject}</td>
            <td>${p.nextReview ? new Date(p.nextReview).toLocaleDateString('de-DE') : '–'}</td>
            <td>${p.interval || 1} Tage</td>
            <td>${p.status === 'known' ? '🟢 Bekannt' : p.status === 'unsure' ? '🔴 Unsicher' : '⚪ Unbekannt'}</td>
            <td><button class="btn btn-outline btn-sm" onclick="quickStart('${p.subject}')">↻</button></td>
        </tr>`).join('');
}

// ── Navigation ───────────────────────────────────────────────────
function switchView(view) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById(`view-${view}`)?.classList.add('active');
    document.querySelector(`[data-view="${view}"]`)?.classList.add('active');
    state.currentView = view;
    const labels = { dashboard:'Dashboard', subjects:'Fächer', sessions:'Lernplan', flashcards:'Karteikarten', 'ai-tutor':'AI Tutor', settings:'Einstellungen' };
    setText('currentPath', labels[view] || view);
    if (view === 'dashboard')  loadDashboard();
    if (view === 'subjects')   renderSubjectOverview();
    if (view === 'flashcards') loadFlashcards();
}

function quickStart(subject) {
    switchView('subjects');
    setTimeout(() => openSubject(subject), 50);
}

// ── Subjects ─────────────────────────────────────────────────────
function renderSubjectOverview() {
    const container = document.getElementById('subjectsOverview');
    if (!container) return;
    const entries = Object.entries(state.curriculum);
    if (!entries.length) { container.innerHTML = '<p class="empty-state">Fächer werden geladen…</p>'; return; }
    container.innerHTML = entries.map(([name, data]) => {
        const topics = getTopics(data);
        const known  = state.progress.filter(p => p.subject === name && p.status === 'known').length;
        const pct    = topics.length ? Math.round(known / topics.length * 100) : 0;
        return `<div class="subject-card" onclick="openSubject('${name}')">
            <span class="subject-icon">${data.icon}</span>
            <h3>${name}</h3>
            <p>${topics.length} Themen · ${known} bekannt</p>
            <div class="subject-progress-bar"><div style="width:${pct}%;background:var(--accent);height:3px;border-radius:2px"></div></div>
        </div>`;
    }).join('');
}

function openSubject(subjectName) {
    state.currentSubject = subjectName;
    document.getElementById('subjectsOverview').style.display = 'none';
    document.getElementById('subjectDetail').style.display   = 'block';
    const bc = document.getElementById('subjectBreadcrumb');
    if (bc) bc.innerHTML = ` / <span style="color:var(--accent)">${subjectName}</span>`;
    setText('currentPath', 'Fächer / ' + subjectName);
    switchSubjectTab('curriculum');
    renderTopics(subjectName);
}

function switchSubjectTab(tab) {
    document.querySelectorAll('.internal-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`)?.classList.add('active');
    document.getElementById(`tab-${tab}`)?.classList.add('active');
}

function renderTopics(subjectName) {
    const grid = document.getElementById('topicsGrid');
    if (!grid) return;
    const data   = state.curriculum[subjectName];
    if (!data)   { grid.innerHTML = '<p>Fach nicht gefunden</p>'; return; }
    const topics = getTopics(data);
    if (!topics.length) { grid.innerHTML = '<p class="empty-state">Keine Themen gefunden</p>'; return; }
    grid.innerHTML = topics.map(t => {
        const prog   = state.progress.find(p => p.topicId === t.id) || { status:'unknown' };
        const icon   = prog.status === 'known' ? '🟢' : prog.status === 'unsure' ? '🔴' : '⚪';
        const badge  = t.lkOnly
            ? '<span class="badge badge-lk">LK</span>'
            : '<span class="badge badge-gk">GK</span>';
        return `<div class="topic-card">
            <div class="topic-header">${badge}<span>${icon}</span></div>
            <h3>${t.title}</h3>
            <p>${t.desc || t.description || ''}</p>
            ${t.exam ? `<p class="topic-exam">🎯 ${t.exam}</p>` : ''}
            <div class="knowledge-buttons">
                <button class="btn btn-kanich"   onclick="markTopic('${t.id}','${subjectName}',5)">✔ Kann ich</button>
                <button class="btn btn-unsicher" onclick="markTopic('${t.id}','${subjectName}',1)">❌ Unsicher</button>
            </div>
            <button class="btn btn-outline" style="width:100%;margin-top:.5rem;font-size:.8rem"
                onclick="generateTask('${subjectName}','${t.title.replace(/'/g,"\\'").replace(/"/g,'\\"')}')">
                📝 Aufgabe generieren
            </button>
        </div>`;
    }).join('');
}

async function markTopic(topicId, subject, quality) {
    try {
        await fetch(`${API_URL}/progress`, {
            method: 'POST',
            headers: { 'Content-Type':'application/json', Authorization: `Bearer ${state.token}` },
            body: JSON.stringify({ topicId, subject, quality })
        });
        const res = await fetch(`${API_URL}/progress`, { headers: { Authorization: `Bearer ${state.token}` } });
        state.progress = await res.json();
        renderTopics(subject);
    } catch (err) { alert('Fehler: ' + err.message); }
}

// ── Generate Task ────────────────────────────────────────────────
async function generateTask(subject, topic) {
    const modal   = document.getElementById('topicModal');
    const titleEl = document.getElementById('topicModalTitle');
    const bodyEl  = document.getElementById('topicModalContent');
    if (!modal) return;
    if (titleEl) titleEl.textContent = `📝 ${topic}`;
    if (bodyEl)  bodyEl.innerHTML = '<p>🤖 Aufgabe wird generiert…</p>';
    modal.style.display = 'flex';
    try {
        const res  = await fetch(`${API_URL}/ai/task`, {
            method: 'POST',
            headers: { 'Content-Type':'application/json', Authorization: `Bearer ${state.token}` },
            body: JSON.stringify({ subject, topic, difficulty:'mittel', kurs: state.kurs.toUpperCase() })
        });
        const task = await res.json();
        if (!res.ok) throw new Error(task.error);

        const qHtml    = (task.question||topic).replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
        const formula  = task.formula?.trim() ? `<div class="formula-box">${task.formula}</div>` : '';
        const inputs   = (task.steps||[]).map(s =>
            `<div style="margin:.5rem 0">
                <div style="font-size:.8rem;color:var(--accent);margin-bottom:3px">${s.label}</div>
                <input type="text" id="task-inp-${s.key}" placeholder="${s.placeholder}"
                    class="input-field" style="width:100%" autocomplete="off">
            </div>`).join('');

        bodyEl.innerHTML = `
            <p style="margin-bottom:.8rem">${qHtml}</p>
            ${formula}
            ${inputs}
            <button class="btn btn-primary" style="margin-top:.8rem" onclick="checkTaskAnswer(${JSON.stringify(task).replace(/'/g,"&#39;")})">✓ Prüfen</button>
            <div id="task-fb" style="margin-top:.5rem"></div>
            ${task.hint ? `<p style="margin-top:.5rem;color:var(--text-muted);font-size:.85rem">💡 ${task.hint}</p>` : ''}`;
    } catch {
        if (bodyEl) bodyEl.innerHTML = `<p>Aufgabe zu <strong>${topic}</strong> konnte nicht geladen werden.<br><small>Bitte versuche es erneut oder stelle dem AI-Tutor deine Frage.</small></p>`;
    }
}

function checkTaskAnswer(task) {
    const fb = document.getElementById('task-fb');
    if (!fb) return;
    let allOk = true;
    (task.steps||[]).forEach(s => {
        const inp = document.getElementById(`task-inp-${s.key}`);
        if (!inp) return;
        const val = inp.value.trim().toLowerCase().replace(/\s+/g,'').replace(/,/g,'.');
        const acc = (task.answers?.[s.key]||[]).map(a => a.toLowerCase().replace(/\s+/g,'').replace(/,/g,'.'));
        const ok  = !acc.length || acc.some(a => val===a || val.includes(a));
        inp.style.borderColor = ok ? '#22c55e' : '#ef4444';
        if (!ok) allOk = false;
    });
    const sol = (task.solution||[]).map(s=>`<strong>${s.label}:</strong> ${s.text}`).join('<br>');
    fb.innerHTML = allOk
        ? '<p style="color:#22c55e;margin-top:.5rem">✅ Richtig! Sehr gut!</p>'
        : `<p style="color:#ef4444;margin-top:.5rem">✗ Nicht ganz. <button class="btn btn-outline" style="font-size:.75rem;margin-left:.5rem" onclick="document.getElementById('task-sol').style.display='block'">Lösung anzeigen</button></p>
           <div id="task-sol" style="display:none;margin-top:.5rem;font-size:.85rem;color:var(--text-muted)">${sol}</div>`;
}

// ── Flashcards ───────────────────────────────────────────────────
function populateSubjectDropdown() {
    const sel = document.getElementById('flashcardSubject');
    if (!sel) return;
    sel.innerHTML = '<option value="all">Alle Fächer</option>' +
        Object.keys(state.curriculum).map(n => `<option value="${n}">${n}</option>`).join('');
}

async function loadFlashcards() {
    const subject = document.getElementById('flashcardSubject')?.value || 'all';
    try {
        const res = await fetch(`${API_URL}/flashcards?subject=${subject}`, {
            headers: { Authorization: `Bearer ${state.token}` }
        });
        state.flashcards    = await res.json();
        state.currentCardIdx = 0;
        state.flashcards.length ? showCard(0) : (setText('cardQuestion','Keine Karteikarten'), setText('cardAnswer','Lade Material hoch!'));
    } catch (err) { console.error(err); }
}

function showCard(i) {
    const c = state.flashcards[i];
    if (!c) return;
    document.querySelector('.flashcard')?.classList.remove('flipped');
    setTimeout(() => {
        setText('cardQuestion', c.question || 'Frage');
        setText('cardAnswer',   c.answer   || 'Antwort');
        setText('cardCurrent',  i + 1);
        setText('cardTotal',    state.flashcards.length);
    }, 150);
}

function flipCard()  { document.querySelector('.flashcard')?.classList.toggle('flipped'); }

async function rateCard(quality) {
    const c = state.flashcards[state.currentCardIdx];
    if (c) {
        await fetch(`${API_URL}/progress`, {
            method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${state.token}`},
            body: JSON.stringify({ topicId: c.topic||'flashcard', subject: c.subject||'Allgemein', quality })
        }).catch(()=>{});
    }
    state.currentCardIdx++;
    if (state.currentCardIdx < state.flashcards.length) showCard(state.currentCardIdx);
    else { alert('🎉 Alle Karten durch!'); state.currentCardIdx = 0; loadFlashcards(); }
}

function viewFlashcards() { switchView('flashcards'); loadFlashcards(); }
function startQuiz()      { alert('Quiz-Feature kommt bald!'); }

// ── File Upload ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const dropZone  = document.getElementById('dropZone');
    if (fileInput) fileInput.addEventListener('change', e => handleFileUpload(e.target.files[0]));
    if (dropZone) {
        dropZone.addEventListener('dragover',  e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
        dropZone.addEventListener('drop', e => {
            e.preventDefault(); dropZone.classList.remove('drag-over');
            if (e.dataTransfer.files[0]) handleFileUpload(e.dataTransfer.files[0]);
        });
    }
});

async function handleFileUpload(file) {
    if (!file) return;
    const prog = document.getElementById('uploadProgress');
    const bar  = document.getElementById('uploadProgressBar');
    const stat = document.getElementById('uploadStatus');
    const res  = document.getElementById('uploadResult');
    if (prog) prog.style.display = 'block';
    if (res)  res.style.display  = 'none';
    if (stat) stat.textContent = 'Hochladen…';
    if (bar)  bar.style.width = '30%';
    const fd = new FormData();
    fd.append('file', file);
    fd.append('subject', state.currentSubject || 'Allgemein');
    try {
        if (bar) bar.style.width = '70%';
        if (stat) stat.textContent = 'Wird analysiert…';
        const r    = await fetch(`${API_URL}/upload`, {
            method:'POST', headers:{ Authorization:`Bearer ${state.token}` }, body: fd
        });
        const data = await r.json();
        if (bar) bar.style.width = '100%';
        setTimeout(() => {
            if (prog) prog.style.display = 'none';
            if (res)  res.style.display  = 'block';
            setText('resultTopics', data.topics    || 0);
            setText('resultCards',  data.flashcards || 0);
            setText('resultQuiz',   data.quiz       || 0);
        }, 400);
    } catch (err) {
        if (prog) prog.style.display = 'none';
        alert('Upload-Fehler: ' + err.message);
    }
}

// ── AI Chat ──────────────────────────────────────────────────────
function handleChatKey(e) { if (e.key === 'Enter') sendChat(); }

async function sendChat() {
    const input = document.getElementById('chatInput');
    const msg   = input?.value.trim();
    if (!msg) return;
    const msgs = document.getElementById('chatMessages');
    if (!msgs) return;
    msgs.innerHTML += `<div class="message user-message"><div class="message-content"><p>${escHtml(msg)}</p></div></div>`;
    input.value = '';
    msgs.scrollTop = msgs.scrollHeight;
    const tid = 'typing-' + Date.now();
    msgs.innerHTML += `<div class="message ai-message" id="${tid}"><div class="message-avatar">🤖</div><div class="message-content"><p>…</p></div></div>`;
    msgs.scrollTop = msgs.scrollHeight;
    try {
        const res  = await fetch(`${API_URL}/ai/chat`, {
            method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${state.token}`},
            body: JSON.stringify({ message: msg, context: state.currentSubject || 'Allgemein' })
        });
        const data = await res.json();
        document.getElementById(tid)?.remove();
        if (!res.ok) throw new Error(data.error);
        msgs.innerHTML += `
            <div class="message ai-message">
                <div class="message-avatar">🤖</div>
                <div class="message-content"><p>${fmtAI(data.response || '')}</p></div>
            </div>`;
    } catch (err) {
        document.getElementById(tid)?.remove();
        msgs.innerHTML += `<div class="message ai-message"><div class="message-avatar">🤖</div><div class="message-content"><p class="text-danger">Fehler: ${escHtml(err.message)}</p></div></div>`;
    }
    msgs.scrollTop = msgs.scrollHeight;
}

// ── Sessions ─────────────────────────────────────────────────────
function startSessionTimer() {
    setInterval(() => {
        if (!state.sessionActive) return;
        const s = Math.floor((Date.now() - state.sessionStartTime) / 1000);
        setText('sessionTimer', `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`);
    }, 1000);
}

function openCreateSessionModal() {
    const modal = document.getElementById('sessionModal');
    if (!modal) return;
    const c = document.getElementById('sessionTopics');
    if (c) c.innerHTML = Object.entries(state.curriculum).map(([n,d]) =>
        `<label class="session-topic-label"><input type="checkbox" class="session-topic" value="${n}"> ${d.icon} ${n}</label>`
    ).join('');
    modal.style.display = 'flex';
}

async function createSession() {
    const checked = document.querySelectorAll('.session-topic:checked');
    if (!checked.length) { alert('Bitte mindestens ein Fach wählen.'); return; }
    const topics = Array.from(checked).map(cb => cb.value);
    try {
        await fetch(`${API_URL}/sessions`, {
            method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${state.token}`},
            body: JSON.stringify({ topics })
        });
        state.sessionActive    = true;
        state.sessionStartTime = Date.now();
        closeModal('sessionModal');
        alert(`✅ Session gestartet! Fächer: ${topics.join(', ')}`);
    } catch (err) { alert('Fehler: ' + err.message); }
}

function loadSessions() {
    const cal = document.getElementById('sessionsCalendar');
    if (cal) cal.innerHTML = '<p class="empty-state">Keine vergangenen Sessions.</p>';
}

// ── Settings ─────────────────────────────────────────────────────
async function saveProfile() {
    try {
        const res = await fetch(`${API_URL}/user`, {
            method:'PUT', headers:{'Content-Type':'application/json', Authorization:`Bearer ${state.token}`},
            body: JSON.stringify({
                name:   document.getElementById('settingsName')?.value,
                email:  document.getElementById('settingsEmail')?.value,
                school: document.getElementById('settingsSchool')?.value,
                kurs:   state.kurs
            })
        });
        state.user = await res.json();
        alert('✅ Profil gespeichert!');
    } catch (err) { alert('Fehler: ' + err.message); }
}

function exportData() {
    const blob = new Blob([JSON.stringify({ user: state.user, progress: state.progress, ts: new Date().toISOString() }, null, 2)], { type:'application/json' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `abitursn-export-${new Date().toISOString().split('T')[0]}.json` });
    a.click();
}

function deleteAccount() { if (confirm('⚠️ Konto wirklich löschen? Alle Daten gehen verloren!')) logout(); }

function createCustomTopic() {
    const title = document.getElementById('customTopicTitle')?.value;
    if (!title) { alert('Bitte Thema eingeben'); return; }
    const r = document.getElementById('customTopicResult');
    if (r) { r.style.display = 'block'; r.innerHTML = `<div class="card" style="background:var(--bg-dark);margin-top:1rem"><h4>${escHtml(title)}</h4><p>${escHtml(document.getElementById('customTopicDesc')?.value||'')}</p></div>`; }
}

function updateSettingDisplay(id, val) { setText(id, val + ' Min'); }

// ── Helpers ───────────────────────────────────────────────────────
function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function fmtAI(t) {
    return escHtml(t)
        .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
        .replace(/`([^`]+)`/g,'<code>$1</code>')
        .replace(/\n\n/g,'</p><p>').replace(/\n/g,'<br>');
}
