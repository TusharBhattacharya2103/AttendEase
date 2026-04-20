const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
// Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://attend-ease-alpha.vercel.app'
    ];
    if (!origin || allowedOrigins.includes(origin) || origin.match(/\.vercel\.app$/)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_portal')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/professor', require('./routes/professor'));
app.use('/api/student', require('./routes/student'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/attendance', require('./routes/attendance'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Attendance Portal API Running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: err.message || 'Internal Server Error' 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;