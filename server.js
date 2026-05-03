// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const contactRoutes = require('./routes/contactRoutes');
const adminRoutes = require('./routes/adminRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const requestRoutes = require('./routes/requestRoutes');
const projectRoutes = require('./routes/projectRoutes');

dotenv.config();

const app = express();

// ====================== CRITICAL: Trust Proxy for Railway ======================
app.set('trust proxy', 1);

// ====================== CORS ======================
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ====================== RATE LIMITER ======================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// ====================== ROUTES ======================
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/requests', requestRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Backend is live! 🚀', env: process.env.NODE_ENV });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ====================== DATABASE & START ======================
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} | Mode: ${process.env.NODE_ENV || 'development'}`);
});
