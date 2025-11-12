import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Optional authentication - adds user to req if token exists, but doesn't fail
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        console.log('✅ Optional Auth: User authenticated:', req.user?._id);
      } catch (error) {
        console.log('⚠️  Optional Auth: Invalid token, proceeding as guest');
      }
    } else {
      console.log('ℹ️  Optional Auth: No token, proceeding as guest');
    }

    next();
  } catch (error) {
    console.error('Optional Auth Error:', error);
    next();
  }
};