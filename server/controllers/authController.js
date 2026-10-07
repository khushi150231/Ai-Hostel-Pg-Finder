import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Student } from '../models/Student.js';
import { Owner } from '../models/Owner.js';
import { isValidEmail } from '../utils/validation.js';

const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'staynear_vadodara_jwt_super_secret_key_2026_student_finder';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn });
};

// @desc    Register a new student or owner
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const {
      fullName,
      name,
      email,
      phone,
      password,
      role = 'STUDENT',
      college,
      course,
      year,
      gender,
      budgetMin,
      budgetMax,
      preferredLocations,
      preferredRoomType,
      preferredAmenities,
      businessName,
    } = req.body;

    if (!email || !password || (!fullName && !name)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email and password',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address format',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const normalizedRole = role.toUpperCase();

    if (normalizedRole === 'OWNER') {
      // Check if owner email exists
      const existingOwner = await Owner.findOne({ email: email.toLowerCase() });
      if (existingOwner) {
        return res.status(409).json({
          success: false,
          message: 'An owner account with this email already exists',
        });
      }

      const owner = await Owner.create({
        name: name || fullName,
        email: email.toLowerCase(),
        phone: phone || '',
        passwordHash,
        businessName: businessName || '',
        role: 'OWNER',
        verificationStatus: 'PENDING',
      });

      const token = generateToken({
        id: owner._id,
        role: 'OWNER',
        email: owner.email,
        name: owner.name,
      });

      return res.status(201).json({
        success: true,
        message: 'Owner account registered successfully',
        token,
        user: {
          id: owner._id,
          name: owner.name,
          email: owner.email,
          role: 'OWNER',
          verificationStatus: owner.verificationStatus,
        },
      });
    }

    // Default: STUDENT registration
    const existingStudent = await Student.findOne({ email: email.toLowerCase() });
    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: 'A student account with this email already exists',
      });
    }

    const student = await Student.create({
      fullName: fullName || name,
      email: email.toLowerCase(),
      phone: phone || '',
      passwordHash,
      college: college || 'Parul University',
      course: course || '',
      year: year || '1st Year',
      gender: gender || 'male',
      budgetMin: budgetMin ? Number(budgetMin) : 2000,
      budgetMax: budgetMax ? Number(budgetMax) : 8000,
      preferredLocations: preferredLocations || [],
      preferredRoomType: preferredRoomType || 'Any',
      preferredAmenities: preferredAmenities || [],
      role: 'STUDENT',
    });

    const token = generateToken({
      id: student._id,
      role: 'STUDENT',
      email: student.email,
      name: student.fullName,
    });

    return res.status(201).json({
      success: true,
      message: 'Student account created successfully',
      token,
      user: {
        id: student._id,
        name: student.fullName,
        email: student.email,
        college: student.college,
        course: student.course,
        year: student.year,
        role: 'STUDENT',
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Try finding in Student collection
    let user = await Student.findOne({ email: cleanEmail }).select('+passwordHash');
    let role = 'STUDENT';

    // 2. If not found in Student, search Owner collection
    if (!user) {
      user = await Owner.findOne({ email: cleanEmail }).select('+passwordHash');
      if (user) {
        role = user.role || 'OWNER';
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken({
      id: user._id,
      role,
      email: user.email,
      name: user.fullName || user.name,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.fullName || user.name,
        email: user.email,
        role,
        college: user.college,
        course: user.course,
        year: user.year,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current authenticated user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user.userDoc,
      role: req.user.role,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Send password reset instructions
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const student = await Student.findOne({ email: cleanEmail });
    const owner = await Owner.findOne({ email: cleanEmail });

    if (!student && !owner) {
      return res.status(404).json({ success: false, message: 'No registered user found with that email' });
    }

    // In production, an email with reset token is dispatched
    const resetToken = jwt.sign(
      { email: cleanEmail },
      process.env.JWT_SECRET || 'staynear_vadodara_jwt_super_secret_key_2026_student_finder',
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      message: 'Password reset link has been dispatched to your email address.',
      resetToken, // Returned for dev/testing convenience
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const secret = process.env.JWT_SECRET || 'staynear_vadodara_jwt_super_secret_key_2026_student_finder';
    const decoded = jwt.verify(token, secret);

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await Student.updateOne({ email: decoded.email }, { passwordHash });
    await Owner.updateOne({ email: decoded.email }, { passwordHash });

    res.json({
      success: true,
      message: 'Password has been updated successfully. You can now log in with your new password.',
    });
  } catch (err) {
    next(err);
  }
};
