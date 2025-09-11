const express = require('express');
const mongoose = require('mongoose');
const Room = require('../models/Room');
const Message = require('../models/Message');

const router = express.Router();

// GET all chat rooms
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.find({});
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET messages for a specific room
router.get('/rooms/:roomId/messages', async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId }).sort({ timestamp: 1 });
    res.json(messages.map(msg => ({
      // Removed the 'isUser' field here
      id: msg._id, // Changed to msg._id for consistency
      userId: msg.userId,
      text: msg.text,
      timestamp: msg.timestamp,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;