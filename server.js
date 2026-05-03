// backend/server.js - MINIMAL DEBUG VERSION
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Server is alive! 🚀', env: process.env.NODE_ENV });
});

app.get('/api/debug', (req, res) => {
  res.json({ success: true, message: 'Debug route working' });
});

// Minimal error handler
app.use((err, req, res, next) => {
  console.error('CRASH:', err);
  res.status(500).json({ success: false, message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Minimal server running on port ${PORT}`);
});
