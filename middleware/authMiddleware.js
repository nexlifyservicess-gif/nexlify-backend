const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Support both cookie and Authorization header
  let token = req.cookies?.accessToken;

  if (!token && req.headers.authorization) {
    token = req.headers.authorization.replace('Bearer ', '');
  }

  if (!token) {
    console.log('→ No token found in cookie or header');
    return res.status(401).json({ message: 'No token' });
  }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
    if (err) {
      console.log('→ Token verification failed');
      return res.status(403).json({ message: 'Invalid token' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Not admin' });
    }
    req.user = user;
    next();
  });
};