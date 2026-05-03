const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../utils/auth');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  console.log('╔═══════════════════════════════════════╗');
  console.log('║          LOGIN ATTEMPT RECEIVED       ║');
  console.log('╚═══════════════════════════════════════╝');
  console.log('Email received     :', email);

  try {
    const user = await User.findOne({ email });
    console.log('User found         :', !!user);

    if (!user) {
      console.log('→ No user found → returning 401');
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    console.log('Password match result :', isMatch);

    if (!isMatch) {
      console.log('→ Password did NOT match → 401');
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in DB for revocation
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token as httpOnly cookie — FIXED for cross-origin
    res.cookie('refreshToken', refreshToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',  // true on HTTPS (Render)
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',  // 'none' for cross-origin
      maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
      path: '/',
    });

    // Do NOT set accessToken as cookie — send it in response for localStorage
    console.log('→ Login SUCCESS — returning accessToken in JSON');
    
    return res.json({ 
      success: true, 
      message: 'Logged in successfully',
      accessToken,  // ← FRONTEND NEEDS THIS
      user: { id: user._id, email: user.email }
    });
  } catch (error) {
    console.error('Login controller crashed:', error);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  console.log('Refresh attempt — cookie present:', !!refreshToken);
  
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'No refresh token' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ success: false, message: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(user);
    
    console.log('→ Refresh SUCCESS — returning new accessToken');

    res.json({ 
      success: true, 
      accessToken: newAccessToken  // ← FRONTEND NEEDS THIS
    });
  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(403).json({ success: false, message: 'Invalid refresh token' });
  }
};

exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    res.clearCookie('refreshToken', { path: '/' });
    res.json({ success: true, message: 'Logged out' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
};