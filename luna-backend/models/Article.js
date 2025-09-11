const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  readTime: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  postedBy: {
    type: String,
    required: true,
  },
  postedWhen: {
    type: String,
    required: true,
  },
  isLunaArticle: {
    type: Boolean,
    default: false,
  },
  // You can add more fields for the full article content here if you wish
  // For this example, we'll assume the client stores the main content
});

module.exports = mongoose.model('Article', ArticleSchema);