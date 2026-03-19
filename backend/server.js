// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// Curriculum importieren
const CURRICULUM = require('./curriculum');
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// 1. MIDDLEWARE (zuerst!)
// ============================================
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ============================================
// 2. DATABASE CONNECTION
// ============================================
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB verbunden'))
  .catch(err => console.error('❌ MongoDB Fehler:', err));

// ============================================
// 3. MODELS
// ============================================
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: String,
    school: String,
    settings: {
        breakInterval: { type: Number, default: 50 },
        altInterval: { type: Number, default: 30 },
        dailyGoal: { type: Number, default: 60 }
    },
    progress: {
        streak: { type: Number, default: 0 },
        lastLogin: Date,
        totalHours: { type: Number, default: 0 }
    },
    createdAt: { type: Date, default: Date.now }
});

const ProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topicId: { type: String, required: true },
    subject: { type: String, required: true },
    status: { type: String, enum: ['unknown', 'known', 'unsure'], default: 'unknown' },
    interval: { type: Number, default: 1 },
    eFactor: { type: Number, default: 2.5 },
    nextReview: { type: Date, default: Date.now },
    lastReview: Date,
    reviews: [{ date: Date, quality: Number }]
});

const FlashcardSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: String,
    topic: String,
    question: String,
    answer: String,
    difficulty: { type: Number, default: 3 },
    createdAt: { type: Date, default: Date.now }
});

const SessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topics: [String],
    startTime: Date,
    endTime: Date,
    duration: Number,
    completed: { type: Boolean, default: false }
});

const User = mongoose.model('User', UserSchema);
const Progress = mongoose.model('Progress', ProgressSchema);
const Flashcard = mongoose.model('Flashcard', FlashcardSchema);
const Session = mongoose.model('Session', SessionSchema);

// ============================================
// 4. AUTH MIDDLEWARE
// ============================================
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Kein Token' });
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Ungültiges Token' });
    }
};

// ============================================
// 5. FILE UPLOAD CONFIG
// ============================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ============================================
// 6. API ROUTES (MÜSSEN VOR STATIC SERVING!)
// ============================================
// ============================================
// CURRICULUM ROUTES
// ============================================

// Alle Fächer + Themen
app.get('/api/curriculum', (req, res) => {
    res.json(CURRICULUM);
});

// Einzelnes Fach
app.get('/api/curriculum/:subject', (req, res) => {
    const subject = req.params.subject;
    if (CURRICULUM[subject]) {
        res.json(CURRICULUM[subject]);
    } else {
        res.status(404).json({ error: 'Fach nicht gefunden' });
    }
});

// Einzelnes Thema
app.get('/api/curriculum/:subject/:topicId', (req, res) => {
    const { subject, topicId } = req.params;
    if (CURRICULUM[subject]) {
        const topic = CURRICULUM[subject].topics.find(t => t.id === topicId);
        if (topic) {
            res.json(topic);
        } else {
            res.status(404).json({ error: 'Thema nicht gefunden' });
        }
    } else {
        res.status(404).json({ error: 'Fach nicht gefunden' });
    }
});
// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name, school } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'E-Mail bereits registriert' });
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ email, password: hashedPassword, name, school });
        
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        res.json({ token, user: { id: user._id, email, name, school } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Ungültige Anmeldedaten' });
        
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ error: 'Ungültige Anmeldedaten' });
        
        user.progress.lastLogin = new Date();
        await user.save();
        
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        res.json({ token, user: { id: user._id, email, name: user.name, school: user.school } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Progress Routes
app.get('/api/progress', authMiddleware, async (req, res) => {
    try {
        const progress = await Progress.find({ userId: req.userId });
        res.json(progress);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/progress', authMiddleware, async (req, res) => {
    try {
        const { topicId, subject, quality } = req.body;
        
        let progress = await Progress.findOne({ userId: req.userId, topicId });
        
        if (!progress) {
            progress = await Progress.create({
                userId: req.userId,
                topicId,
                subject,
                status: quality >= 4 ? 'known' : 'unsure',
                interval: quality >= 4 ? 1 : 1,
                nextReview: new Date(Date.now() + (quality >= 4 ? 1 : 1) * 24 * 60 * 60 * 1000)
            });
        } else {
            if (quality >= 4) {
                if (progress.interval === 1) progress.interval = 1;
                else if (progress.interval === 2) progress.interval = 6;
                else progress.interval = Math.round(progress.interval * progress.eFactor);
                
                progress.eFactor = progress.eFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
                if (progress.eFactor < 1.3) progress.eFactor = 1.3;
                progress.status = 'known';
            } else {
                progress.interval = 1;
                progress.eFactor = Math.max(1.3, progress.eFactor - 0.2);
                progress.status = 'unsure';
            }
            
            progress.nextReview = new Date(Date.now() + progress.interval * 24 * 60 * 60 * 1000);
            progress.lastReview = new Date();
            progress.reviews.push({ date: new Date(), quality });
        }
        
        await progress.save();
        res.json(progress);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Flashcards Routes
app.get('/api/flashcards', authMiddleware, async (req, res) => {
    try {
        const { subject } = req.query;
        const query = { userId: req.userId };
        if (subject && subject !== 'all') query.subject = subject;
        
        const flashcards = await Flashcard.find(query).limit(20);
        res.json(flashcards);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/flashcards', authMiddleware, async (req, res) => {
    try {
        const flashcards = req.body;
        const created = await Flashcard.insertMany(
            flashcards.map(fc => ({ ...fc, userId: req.userId }))
        );
        res.json(created);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upload Route
app.post('/api/upload', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Keine Datei' });
        
        const { subject, types } = req.body;
        
        const mockResult = {
            topics: Math.floor(Math.random() * 3) + 1,
            flashcards: Math.floor(Math.random() * 10) + 5,
            quiz: Math.floor(Math.random() * 5) + 3
        };
        
        const flashcards = [];
        for (let i = 0; i < mockResult.flashcards; i++) {
            flashcards.push({
                subject,
                topic: req.file.originalname,
                question: `Frage ${i + 1} aus ${req.file.originalname}`,
                answer: `Antwort ${i + 1} - KI-generiert`
            });
        }
        
        await Flashcard.insertMany(flashcards.map(fc => ({ ...fc, userId: req.userId })));
        
        res.json(mockResult);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// AI Tutor Route (mit Groq API)
app.post('/api/ai/chat', authMiddleware, async (req, res) => {
    try {
        const { message, context, subject } = req.body;
        
        // System Prompt mit Lehrplan-Kontext
        const systemPrompt = `Du bist ein hilfreicher Abitur-Tutor für Sachsen. 
Erkläre Themen aus dem sächsischen Lehrplan verständlich, präzise und schülergerecht.

Aktueller Kontext: ${context || 'Allgemein'}
Fach: ${subject || 'Nicht spezifiziert'}

Antworte:
- Kurz und strukturiert (max. 5 Sätze pro Abschnitt)
- Mit Beispielen aus dem Lehrplan
- Auf Deutsch
- Ermutigend und motivierend`;

        // Groq API Call
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama3-8b-8192',  // Schnell & gut für Deutsch
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
                temperature: 0.7,
                max_tokens: 500,
                top_p: 1,
                stream: false
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Groq API Error: ${response.status} - ${errorData.error?.message || 'Unknown'}`);
        }
        
        const data = await response.json();
        
        // Antwort zurückgeben
        res.json({ 
            response: data.choices[0]?.message?.content || 'Keine Antwort erhalten',
            source: 'groq-llama3',
            model: 'llama3-8b-8192'
        });
        
    } catch (err) {
        console.error('Groq AI Error:', err);
        res.status(500).json({ 
            error: 'AI nicht verfügbar',
            response: 'Entschuldigung, der AI-Tutor ist gerade nicht erreichbar. Bitte versuche es später nochmal.'
        });
    }
});

// User Routes
app.get('/api/user', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/user', authMiddleware, async (req, res) => {
    try {
        const { name, email, school, settings } = req.body;
        const user = await User.findByIdAndUpdate(
            req.userId,
            { name, email, school, settings },
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Session Routes
app.post('/api/sessions', authMiddleware, async (req, res) => {
    try {
        const session = await Session.create({
            userId: req.userId,
            topics: req.body.topics,
            startTime: new Date()
        });
        res.json(session);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/sessions/:id', authMiddleware, async (req, res) => {
    try {
        const session = await Session.findByIdAndUpdate(
            req.params.id,
            { 
                endTime: new Date(),
                duration: req.body.duration,
                completed: true
            },
            { new: true }
        );
        res.json(session);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// 7. FRONTEND SERVING (NACH API ROUTES!)
// ============================================
app.use(express.static(path.join(__dirname, '../frontend')));

// Catch-all route (GANZ AM ENDE!)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ============================================
// 8. SERVER START
// ============================================
app.listen(PORT, () => {
    console.log(`🚀 Server läuft auf Port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔌 API: http://localhost:${PORT}/api`);
});