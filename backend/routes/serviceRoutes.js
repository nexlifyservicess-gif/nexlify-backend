// backend/routes/serviceRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const Service = require('../models/Service');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/services/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Only jpeg/jpg/png/gif allowed'));
  }
});

// Public: GET all services
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};

    const services = await Service.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Service.countDocuments(query);

    res.json({
      services,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Protected: CREATE
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;

    if (!name || !description) {
      return res.status(400).json({ success: false, message: 'Name and description required' });
    }

    let image = imageUrl || '';

    if (req.file) {
      image = `/uploads/services/${req.file.filename}`;
    }

    const service = new Service({
      name,
      description,
      image,
    });

    await service.save();

    res.status(201).json({ success: true, service });
  } catch (err) {
    console.error('POST service error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Failed to create' });
  }
});

// Protected: UPDATE
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const updateData = {};
    const { name, description, imageUrl } = req.body;

    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (req.file) {
      updateData.image = `/uploads/services/${req.file.filename}`;
    } else if (imageUrl) {
      updateData.image = imageUrl;
    }

    const updated = await Service.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updated) return res.status(404).json({ success: false, message: 'Not found' });

    res.json({ success: true, service: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Protected: DELETE
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Service.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;