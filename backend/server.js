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

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Database Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB verbunden'))
  .catch(err => console.error('❌ MongoDB Fehler:', err));

// Models
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

// Auth Middleware
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

// File Upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ROUTES

// Auth
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

// Progress
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
            // SM2 Algorithm
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

// Flashcards
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

// File Upload & AI Processing
app.post('/api/upload', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Keine Datei' });
        
        const { subject, types } = req.body;
        
        // Hier würde die echte KI-Verarbeitung stattfinden
        // Für Demo simulieren wir die Antwort
        const mockResult = {
            topics: Math.floor(Math.random() * 3) + 1,
            flashcards: Math.floor(Math.random() * 10) + 5,
            quiz: Math.floor(Math.random() * 5) + 3
        };
        
        // Flashcards erstellen (simuliert)
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

// AI Tutor (OpenAI Integration)
app.post('/api/ai/chat', authMiddleware, async (req, res) => {
    try {
        const { message, context } = req.body;
        
        // OpenAI API Call (simuliert für Demo)
        const mockResponse = {
            response: `Das ist eine interessante Frage zu ${context || 'dem Thema'}. Basierend auf dem sächsischen Lehrplan würde ich sagen...`
        };
        
        // Echte Implementierung:
        // const response = await openai.chat.completions.create({
        //     model: 'gpt-4',
        //     messages: [
        //         { role: 'system', content: 'Du bist ein Abitur-Tutor für Sachsen...' },
        //         { role: 'user', content: message }
        //     ]
        // });
        
        res.json(mockResponse);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// User Profile
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

// Sessions
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

// Das MUSS am Ende deiner server.js stehen:
app.listen(PORT, () => {
    console.log(`🚀 Server läuft auf Port ${PORT}`);
});