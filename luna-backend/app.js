const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http'); // Import http for Socket.IO
const { Server } = require("socket.io"); // Import Server class

dotenv.config();

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const articlesRoutes = require('./routes/articles'); // <-- NEW
const Room = require('./models/Room');
const Message = require('./models/Message');
const User = require('./models/User');

// New models for articles
const Article = require('./models/Article'); // <-- NEW
const Comment = require('./models/Comment'); // <-- NEW

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(bodyParser.json());
app.set('io', io);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    initDb();
  })
  .catch(err => console.log('❌ MongoDB connection error:', err));

const initDb = async () => {
  // Initialize rooms and dummy user
  const roomCount = await Room.countDocuments();
  if (roomCount === 0) {
    const initialRooms = [
      { name: "Body & Cycles" },
      { name: "PCOS & Endometriosis" },
      { name: "Reproductive Health" },
      { name: "Sex & Relationships" },
      { name: "Mental Health" },
    ];
    await Room.insertMany(initialRooms);
    console.log("Initial chat rooms created.");
  }
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    await User.create({ name: 'AnonymousUser', email: 'anon@example.com', password: 'hashedpassword' });
    console.log("Dummy user created.");
  }
  
  // Seed articles on startup
  const articleCount = await Article.countDocuments();
  if (articleCount === 0) {
    const initialArticles = [
      { title: "A message from Luna: Your guide to our app", readTime: "3 min read", image: "logo.png", postedBy: "Luna", postedWhen: "Today", isLunaArticle: true },
      { title: "Understanding your period: What's normal?", readTime: "5 min read", image: "img.png", postedBy: "Jane Doe", postedWhen: "1 month ago" },
      { title: "Coping with cramps: Tips & tricks", readTime: "7 min read", image: "new.png", postedBy: "Sarah Lee", postedWhen: "2 weeks ago" },
      { title: "Signs of hormonal imbalance to watch out for", readTime: "9 min read", image: "img.png", postedBy: "Emily White", postedWhen: "1 month ago" },
      { title: "How diet affects your menstrual cycle", readTime: "6 min read", image: "calenderr.png", postedBy: "Jessica Chan", postedWhen: "Today" },
      { title: "The link between stress and your period", readTime: "8 min read", image: "new.png", postedBy: "Olivia Rodriguez", postedWhen: "2 days ago" },
    ];
    await Article.insertMany(initialArticles);
    console.log("Initial articles created.");
  }
};

// --- Socket.IO Events ---
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join', (data) => {
    socket.join(data.room);
    console.log(`${data.username} has joined room ${data.room}`);
  });

  socket.on('send_message', async (data) => {
    const { roomId, userId, text } = data;
    try {
      const newMessage = new Message({
        roomId: new mongoose.Types.ObjectId(roomId),
        userId: new mongoose.Types.ObjectId(userId),
        text: text
      });
      await newMessage.save();

      io.to(roomId).emit('new_message', {
        id: newMessage._id,
        userId: newMessage.userId,
        text: newMessage.text,
        isUser: true,
        timestamp: newMessage.timestamp
      });
    } catch (error) {
      console.error("Error saving/broadcasting message:", error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/articles', articlesRoutes); // <-- NEW

app.get('/', (req, res) => res.send('🚀 Luna backend running...'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));