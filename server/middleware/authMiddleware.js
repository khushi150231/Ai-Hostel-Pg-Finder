import jwt from 'jsonwebtoken';
import { Student } from '../models/Student.js';
import { Owner } from '../models/Owner.js';

export const authenticateUser = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No access token provided.',
      });
    }

    const secret = process.env.JWT_SECRET || 'staynear_vadodara_jwt_super_secret_key_2026_student_finder';
    const decoded = jwt.verify(token, secret);

    // Look up user based on decoded role
    let user = null;
    if (decoded.role === 'STUDENT') {
      user = await Student.findById(decoded.id).select('-passwordHash');
    } else if (decoded.role === 'OWNER' || decoded.role === 'ADMIN') {
      user = await Owner.findById(decoded.id).select('-passwordHash');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account associated with token no longer exists.',
      });
    }

    req.user = {
      id: user._id.toString(),
      _id: user._id,
      email: user.email,
      name: user.fullName || user.name,
      role: decoded.role || user.role,
      userDoc: user,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access token expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or malformed authentication token.',
    });
  }
};

// Optional auth middleware: sets req.user if token is present, but doesn't block if absent
export const optionalAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      const token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'staynear_vadodara_jwt_super_secret_key_2026_student_finder';
      const decoded = jwt.verify(token, secret);
      req.user = decoded;
    }
  } catch {
    // Ignore invalid token in optional auth
  }
  next();
};

export const protect = authenticateUser;
export default authenticateUser;
