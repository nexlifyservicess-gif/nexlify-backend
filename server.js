// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const contactRoutes = require('./routes/contactRoutes');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const adminRoutes = require('./routes/adminRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const requestRoutes = require('./routes/requestRoutes');
const projectRoutes = require('./routes/projectRoutes');
const authMiddleware = require('./middleware/authMiddleware');

dotenv.config();

const app = express();

// ────────────────────────────────────────────────
//  CORS CONFIG — FIXED FOR PRODUCTION
// ────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'https://your-vercel-app.vercel.app',  // ← Add your Vercel URL after deployment
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    
    // Allow all origins in development, specific ones in production
    if (process.env.NODE_ENV === 'development' || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,  // ← CRITICAL: allows cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
}));

// ❌ REMOVED: app.options('*', cors()); — crashes Express 4+, not needed since cors() middleware above handles all preflight automatically

// Static Files for Uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Middlewares
app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());

// Relaxed Rate Limiter (Fixed)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,        // 15 minutes
  max: 400,                        // Increased limit
  message: { success: false, message: 'Too many requests, please wait a moment.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => 
    req.path === '/api/admin/refresh' || 
    req.path === '/api/admin/me' ||
    req.method === 'OPTIONS'
});
app.use(limiter);

app.use(express.json());

// Routes
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/requests', requestRoutes);   // authMiddleware is already inside the route file

// Test Route
app.get('/', (req, res) => {
  res.json({ message: 'Backend is live! 🚀', env: process.env.NODE_ENV || 'development' });
});

// 404 & Error Handlers
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} | Mode: ${process.env.NODE_ENV || 'development'}`);
});