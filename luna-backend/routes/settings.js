import express from 'express';
import Setting from '../models/Setting.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const auth = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Get settings
router.get('/', auth, async (req, res) => {
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
router.put('/update', auth, async (req, res) => {
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

export default router;
