const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PeriodLog = require('../models/PeriodLog');
const Setting = require('../models/Setting.js');

const router = express.Router();

// JWT authentication middleware
const auth = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// --- AUTHENTICATION ROUTES ---

// Signup
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Email already registered' });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashed });
        res.status(201).json({ userId: user._id });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Invalid password' });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, userId: user._id, name: user.name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Check email
router.post('/check-email', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user) return res.json({ exists: true });
        res.json({ exists: false });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- PERIOD LOGGING ROUTES ---

// Add a new period log range
router.post('/period/add', auth, async (req, res) => {
    const { start_date, end_date } = req.body;
    try {
        const newLog = await PeriodLog.create({
            user: req.userId,
            start_date,
            end_date
        });
        res.status(201).json(newLog);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all period log ranges for the user
router.get('/period/all', auth, async (req, res) => {
    try {
        const logs = await PeriodLog.find({ user: req.userId }).sort({ start_date: 1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update all period logs for the user
router.post('/period/update', auth, async (req, res) => {
    const { periods } = req.body;
    try {
        await PeriodLog.deleteMany({ user: req.userId });
        
        if (periods && periods.length > 0) {
            const newLogs = periods.map((p) => ({
                user: req.userId,
                start_date: p.start,
                end_date: p.end
            }));
            await PeriodLog.insertMany(newLogs);
        }

        res.json({ message: 'Periods updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- SETTINGS ROUTES ---

// Get settings
router.get('/settings', auth, async (req, res) => {
    try {
        let setting = await Setting.findOne({ user: req.userId });
        if (!setting) {
            setting = await Setting.create({ user: req.userId });
        }
        res.json(setting);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update settings
router.put('/settings/update', auth, async (req, res) => {
    try {
        const updated = await Setting.findOneAndUpdate(
            { user: req.userId },
            req.body,
            { new: true, upsert: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;