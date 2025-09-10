// periodLogs.js
const express = require('express');
const PeriodLog = require('../models/PeriodLog');
const jwt = require('jsonwebtoken');

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

// Add a new period log range
router.post('/add', auth, async (req, res) => {
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
router.get('/all', auth, async (req, res) => {
    try {
        const logs = await PeriodLog.find({ user: req.userId }).sort({ start_date: 1 }); 
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update all period logs for the user
router.post('/update', auth, async (req, res) => {
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

module.exports = router;