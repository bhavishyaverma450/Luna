// File: routes/comments.js
const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const User = require("../models/User");

// Get comments for a specific article
router.get("/:articleId/comments", async (req, res) => {
  try {
    const { articleId } = req.params;
    const comments = await Comment.find({ articleId: Number(articleId) })
      .populate("userId", "name")
      .sort({ timestamp: -1 });

    const formattedComments = comments.map((comment) => ({
      _id: comment._id,
      articleId: comment.articleId,
      userId: comment.userId ? comment.userId._id : null,
      user: { name: comment.userId ? comment.userId.name : "Deleted User" },
      text: comment.text,
      timestamp: comment.timestamp.toISOString(),
    }));

    res.json(formattedComments);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Post a new comment
router.post("/:articleId/comments", async (req, res) => {
  const io = req.app.get("io");
  try {
    const { articleId } = req.params;
    const { userId, text } = req.body;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found with the provided ID." });
    }

    const newComment = new Comment({
      articleId: Number(articleId),
      userId,
      text,
    });
    await newComment.save();

    // Populate user
    const populatedComment = await newComment.populate("userId", "name");

    const formattedComment = {
      _id: populatedComment._id,
      articleId: populatedComment.articleId,
      userId: populatedComment.userId._id,
      user: { name: populatedComment.userId.name },
      text: populatedComment.text,
      timestamp: populatedComment.timestamp.toISOString(),
    };

    // 🔥 Emit to all clients
    io.emit("new_comment", formattedComment);

    // 🔥 Send the full comment object back to the user
    res.status(201).json(formattedComment);
  } catch (err) {
    console.error("Failed to submit comment:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
