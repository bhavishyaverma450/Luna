const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const Comment = require('../models/Comment');
const User = require('../models/User');

// Middleware to attach io instance to the request
router.use((req, res, next) => {
  req.io = req.app.get('io');
  next();
});

// Seed initial articles into the database
const seedArticles = async () => {
  const count = await Article.countDocuments();
  if (count === 0) {
    const initialArticles = [
      {
        title: "A message from Luna: Your guide to our app",
        readTime: "3 min read",
        image: "logo.png",
        postedBy: "Luna",
        postedWhen: "Today",
        isLunaArticle: true,
      },
      {
        title: "Understanding your period: What's normal?",
        readTime: "5 min read",
        image: "img.png",
        postedBy: "Jane Doe",
        postedWhen: "1 month ago",
      },
      {
        title: "Coping with cramps: Tips & tricks",
        readTime: "7 min read",
        image: "new.png",
        postedBy: "Sarah Lee",
        postedWhen: "2 weeks ago",
      },
      {
        title: "Signs of hormonal imbalance to watch out for",
        readTime: "9 min read",
        image: "img.png",
        postedBy: "Emily White",
        postedWhen: "1 month ago",
      },
      {
        title: "How diet affects your menstrual cycle",
        readTime: "6 min read",
        image: "calenderr.png",
        postedBy: "Jessica Chan",
        postedWhen: "Today",
      },
      {
        title: "The link between stress and your period",
        readTime: "8 min read",
        image: "new.png",
        postedBy: "Olivia Rodriguez",
        postedWhen: "2 days ago",
      },
    ];
    await Article.insertMany(initialArticles);
    console.log("Initial articles seeded successfully.");
  }
};
seedArticles();

// @route   GET /api/articles
// @desc    Get all articles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const articles = await Article.find();
    res.json(articles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/articles/:articleId/comments
// @desc    Get comments for a specific article
// @access  Public
router.get('/:articleId/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ articleId: req.params.articleId })
      .populate('userId', 'name')
      .sort({ timestamp: -1 });
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/articles/:articleId/comments
// @desc    Add a new comment to an article and broadcast it
// @access  Private (requires authentication)
router.post('/:articleId/comments', async (req, res) => {
  const dummyUser = await User.findOne({ email: 'anon@example.com' });
  if (!dummyUser) {
    return res.status(404).json({ msg: 'Dummy user not found' });
  }

  const { text } = req.body;
  const { articleId } = req.params;

  try {
    const newComment = new Comment({
      articleId,
      userId: dummyUser._id,
      text,
    });
    
    await newComment.save();
    
    await newComment.populate('userId', 'name');

    // Broadcast the new comment to all connected clients
    req.io.sockets.emit('new_comment', {
      _id: newComment._id,
      userId: newComment.userId,
      user: { name: newComment.userId.name },
      text: newComment.text,
      timestamp: newComment.timestamp,
    });
    
    res.status(201).json(newComment);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;