// backend/models/Project.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['AI', 'AI Automation', 'Web', 'Content Writing'],
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
  },
  link: {
    type: String,
    default: '',
  },
  image: {
    type: String, // URL or path to image
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model('Project', projectSchema);