const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');

dotenv.config();

const authRoutes = require('./routes/auth');
const periodRoutes = require('./routes/periodLogs');
const settingsRoutes = require('./routes/settings');

const app = express();
app.use(cors());

app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.log('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/period', periodRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/', (req, res) => res.send('🚀 Luna backend running...'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));