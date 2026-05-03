// backend/routes/portfolioRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const Project = require('../models/Project');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Multer setup for project images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/projects/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Only jpeg, jpg, png, gif allowed'));
  }
});

// Public: GET all projects (with pagination, search, category filter)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category = '' } = req.query;

    const query = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    if (category) query.category = category;

    const projects = await Project.find(query)
      .sort({ year: -1, createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Project.countDocuments(query);

    res.json({
      projects,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (err) {
    console.error('GET /api/projects error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Protected: CREATE project
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, year, link, imageUrl } = req.body;

    if (!title || !description || !category || !year) {
      return res.status(400).json({ success: false, message: 'Title, description, category, year required' });
    }

    let image = imageUrl || '';

    if (req.file) {
      image = `/uploads/projects/${req.file.filename}`;
    }

    const project = new Project({
      title,
      description,
      category,
      year: Number(year),
      link: link || '',
      image,
    });

    await project.save();

    res.status(201).json({ success: true, project });
  } catch (err) {
    console.error('POST project error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Failed to create project' });
  }
});

// Protected: UPDATE project
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, year, link, imageUrl } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (year) updateData.year = Number(year);
    if (link !== undefined) updateData.link = link;
    if (req.file) {
      updateData.image = `/uploads/projects/${req.file.filename}`;
    } else if (imageUrl) {
      updateData.image = imageUrl;
    }

    const updated = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    if (!updated) return res.status(404).json({ success: false, message: 'Project not found' });

    res.json({ success: true, project: updated });
  } catch (err) {
    console.error('PUT project error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Protected: DELETE project
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    console.error('DELETE project error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;