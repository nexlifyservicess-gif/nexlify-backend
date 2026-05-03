// backend/controllers/requestController.js
const Request = require('../models/Request');
const nodemailer = require('nodemailer');

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nexlify.servicess@gmail.com',
    pass: 'jzus oike lzey csiv', // Replace with actual App Password
  },
});

exports.getAllRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const query = search ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] } : {};

    const requests = await Request.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Request.countDocuments(query);

    res.json({
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request = await Request.findByIdAndUpdate(id, { status }, { new: true });

    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    // If status = 'completed', send notification to user
    if (status === 'completed') {
      const mailToUser = {
        from: 'nexlify.servicess@gmail.com',
        to: request.email,
        subject: 'Your Request at Nexlify Services is Completed',
        text: `Dear ${request.name},\n\nYour request for "${request.service || 'general inquiry'}" has been completed successfully.\n\nMessage recap: "${request.message}"\n\nThank you for choosing Nexlify Services!\nBest regards,\nNexlify Team\nnexlify.servicess@gmail.com`,
      };
      await transporter.sendMail(mailToUser);
    }

    res.json({ success: true, request });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};