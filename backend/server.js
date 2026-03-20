// backend/server.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');

const CURRICULUM = require('./curriculum');
const app  = express();
const PORT = process.env.PORT || 3000;

// ── Groq Client (sicher initialisieren) ─────────────────────────
// BUGFIX: Groq-Key validieren bevor Client erstellt wird
const GROQ_KEY = (process.env.GROQ_API_KEY || '').trim();
if (!GROQ_KEY) {
    console.error('❌ GROQ_API_KEY fehlt oder ist leer!');
    console.error('   → Lokal: in .env eintragen');
    console.error('   → Render: in Environment Variables eintragen');
}

let groq = null;
try {
    const { Groq } = require('groq-sdk');
    groq = new Groq({ apiKey: GROQ_KEY });
    console.log('✅ Groq Client initialisiert');
} catch (err) {
    console.error('❌ Groq SDK Fehler:', err.message);
    console.error('   → npm install ausführen (groq-sdk ^0.8.0 benötigt)');
}

// ── Middleware ───────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
app.use('/uploads', express.static('uploads'));

// ── MongoDB ──────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB verbunden'))
  .catch(err => console.error('❌ MongoDB Fehler:', err));

// ── Models ───────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema({
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: String, school: String, kurs: { type: String, default: 'gk' },
    settings: {
        breakInterval: { type: Number, default: 50 },
        altInterval:   { type: Number, default: 30 },
        dailyGoal:     { type: Number, default: 60 }
    },
    progress: { streak: { type: Number, default: 0 }, lastLogin: Date, totalHours: { type: Number, default: 0 } },
    createdAt: { type: Date, default: Date.now }
});
const ProgressSchema = new mongoose.Schema({
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topicId:   { type: String, required: true },
    subject:   { type: String, required: true },
    status:    { type: String, enum: ['unknown','known','unsure'], default: 'unknown' },
    interval:  { type: Number, default: 1 },
    eFactor:   { type: Number, default: 2.5 },
    nextReview:{ type: Date, default: Date.now },
    lastReview: Date,
    reviews:   [{ date: Date, quality: Number }]
});
const FlashcardSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: String, topic: String, question: String, answer: String,
    createdAt: { type: Date, default: Date.now }
});
const SessionSchema = new mongoose.Schema({
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topics: [String], startTime: Date, endTime: Date, duration: Number,
    completed: { type: Boolean, default: false }
});

const User      = mongoose.model('User',      UserSchema);
const Progress  = mongoose.model('Progress',  ProgressSchema);
const Flashcard = mongoose.model('Flashcard', FlashcardSchema);
const Session   = mongoose.model('Session',   SessionSchema);

// ── Auth Middleware ──────────────────────────────────────────────
const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Kein Token' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch {
        res.status(401).json({ error: 'Ungültiges Token' });
    }
};

// ── Upload ───────────────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename:    (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ════════════════════════════════════════════════════════════════
//  API ROUTES
// ════════════════════════════════════════════════════════════════

// Debug-Route: zeigt ob Key geladen ist (KEIN Key-Wert ausgeben!)
app.get('/api/debug', (req, res) => {
    res.json({
        groq_key_set:    !!GROQ_KEY && GROQ_KEY.length > 10,
        groq_key_prefix: GROQ_KEY ? GROQ_KEY.substring(0,7) + '…' : 'FEHLT',
        groq_client_ok:  !!groq,
        mongodb:         mongoose.connection.readyState === 1 ? 'verbunden' : 'getrennt',
        node_env:        process.env.NODE_ENV || 'nicht gesetzt'
    });
});

// ── Curriculum ───────────────────────────────────────────────────
app.get('/api/curriculum', (req, res) => res.json(CURRICULUM));
app.get('/api/curriculum/:subject', (req, res) => {
    const s = CURRICULUM[req.params.subject];
    s ? res.json(s) : res.status(404).json({ error: 'Fach nicht gefunden' });
});

// ── Auth ─────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name, school } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'E-Mail und Passwort erforderlich' });
        if (await User.findOne({ email })) return res.status(400).json({ error: 'E-Mail bereits registriert' });
        const hash  = await bcrypt.hash(password, 10);
        const user  = await User.create({ email, password: hash, name, school });
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, email, name, school, kurs: user.kurs } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !await bcrypt.compare(password, user.password))
            return res.status(400).json({ error: 'Ungültige Anmeldedaten' });
        user.progress.lastLogin = new Date();
        await user.save();
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, email, name: user.name, school: user.school, kurs: user.kurs } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── User ─────────────────────────────────────────────────────────
app.get('/api/user', auth, async (req, res) => {
    try { res.json(await User.findById(req.userId).select('-password')); }
    catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/user', auth, async (req, res) => {
    try { res.json(await User.findByIdAndUpdate(req.userId, req.body, { new: true }).select('-password')); }
    catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Progress ─────────────────────────────────────────────────────
app.get('/api/progress', auth, async (req, res) => {
    try { res.json(await Progress.find({ userId: req.userId })); }
    catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/progress', auth, async (req, res) => {
    try {
        const { topicId, subject, quality } = req.body;
        let p = await Progress.findOne({ userId: req.userId, topicId });
        if (!p) p = new Progress({ userId: req.userId, topicId, subject });
        if (quality >= 4) {
            if (p.interval <= 1)       p.interval = 1;
            else if (p.interval === 2) p.interval = 6;
            else                       p.interval = Math.round(p.interval * p.eFactor);
            p.eFactor = Math.max(1.3, p.eFactor + 0.1 - (5-quality)*(0.08+(5-quality)*0.02));
            p.status  = 'known';
        } else {
            p.interval = 1;
            p.eFactor  = Math.max(1.3, p.eFactor - 0.2);
            p.status   = 'unsure';
        }
        p.nextReview = new Date(Date.now() + p.interval * 86400000);
        p.lastReview = new Date();
        p.reviews.push({ date: new Date(), quality });
        await p.save();
        res.json(p);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Flashcards ───────────────────────────────────────────────────
app.get('/api/flashcards', auth, async (req, res) => {
    try {
        const q = { userId: req.userId };
        if (req.query.subject && req.query.subject !== 'all') q.subject = req.query.subject;
        res.json(await Flashcard.find(q).limit(20));
    } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/flashcards', auth, async (req, res) => {
    try {
        const cards = Array.isArray(req.body) ? req.body : [req.body];
        res.json(await Flashcard.insertMany(cards.map(c => ({ ...c, userId: req.userId }))));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Upload ───────────────────────────────────────────────────────
app.post('/api/upload', auth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Keine Datei' });
        res.json({ topics: 2, flashcards: 8, quiz: 4 });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── AI Chat ──────────────────────────────────────────────────────
app.post('/api/ai/chat', auth, async (req, res) => {
    // BUGFIX: Groq Client prüfen
    if (!groq) return res.status(503).json({
        error: 'Groq nicht verfügbar. Bitte GROQ_API_KEY in den Umgebungsvariablen prüfen und npm install ausführen.'
    });

    try {
        const { message, context } = req.body;
        if (!message) return res.status(400).json({ error: 'Nachricht fehlt' });

        const completion = await groq.chat.completions.create({
            // BUGFIX: Stabiles Modell – falls 70b nicht verfügbar ist
            model: 'llama-3.1-8b-instant',
            messages: [
                {
                    role: 'system',
                    content: `Du bist ein Abitur-Tutor für das sächsische Gymnasium (Klasse 11/12).
Kontext: ${context || 'Allgemein'}. Antworte auf Deutsch, klar und verständlich.
Erkläre Schritt für Schritt mit Beispielen. Formeln in Klartext (kein LaTeX). Max 4 Absätze.`
                },
                { role: 'user', content: message }
            ],
            max_tokens: 600,
            temperature: 0.7
        });

        const response = completion.choices[0]?.message?.content || 'Keine Antwort generiert.';
        res.json({ response });

    } catch (err) {
        console.error('Groq Chat Error:', err.message);

        // Hilfreiche Fehlermeldung je nach Fehlertyp
        if (err.status === 401 || err.message?.includes('401') || err.message?.includes('auth')) {
            return res.status(401).json({ error: 'Groq API Key ungültig. Bitte Key in Render Environment Variables prüfen.' });
        }
        if (err.status === 429) {
            return res.status(429).json({ error: 'Groq Rate Limit erreicht. Bitte kurz warten.' });
        }
        if (err.message?.includes('model')) {
            return res.status(500).json({ error: 'Modell nicht verfügbar. Bitte Model-Name prüfen.' });
        }
        res.status(500).json({ error: 'AI Fehler: ' + err.message });
    }
});

// ── AI Aufgabe generieren ─────────────────────────────────────────
app.post('/api/ai/task', auth, async (req, res) => {
    if (!groq) return res.status(503).json({ error: 'Groq nicht verfügbar. GROQ_API_KEY prüfen.' });

    try {
        const { subject, topic, difficulty = 'mittel', kurs = 'GK' } = req.body;

        const completion = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [{
                role: 'user',
                content: `Erstelle eine ${difficulty} Abituraufgabe.
Fach: ${subject} | Thema: ${topic} | Kurs: ${kurs} | Sachsen Gymnasium
Antworte NUR mit JSON (kein Markdown, kein anderer Text):
{"question":"Aufgabe mit **fett** für wichtige Teile","formula":"Formel oder leer lassen","steps":[{"label":"Bez.:","placeholder":"Hinweis","key":"k1"}],"hint":"Tipp","solution":[{"label":"Schritt 1","text":"Lösung"}],"answers":{"k1":["antwort"]}}`
            }],
            max_tokens: 700,
            temperature: 0.5
        });

        const text  = completion.choices[0]?.message?.content || '';
        const clean = text.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
        const match = clean.match(/\{[\s\S]*\}/);
        if (!match) return res.status(500).json({ error: 'Aufgabe konnte nicht generiert werden.' });
        res.json(JSON.parse(match[0]));
    } catch (err) {
        console.error('Groq Task Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ── Sessions ─────────────────────────────────────────────────────
app.post('/api/sessions', auth, async (req, res) => {
    try {
        const s = await Session.create({ userId: req.userId, topics: req.body.topics, startTime: new Date() });
        res.json(s);
    } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/sessions/:id', auth, async (req, res) => {
    try {
        const s = await Session.findByIdAndUpdate(
            req.params.id,
            { endTime: new Date(), duration: req.body.duration, completed: true },
            { new: true }
        );
        res.json(s);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Frontend Serving ─────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/index.html')));

// ── Start ────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚀 Server: http://localhost:${PORT}`);
    console.log(`🔌 API:    http://localhost:${PORT}/api`);
    console.log(`🔍 Debug:  http://localhost:${PORT}/api/debug\n`);
});
