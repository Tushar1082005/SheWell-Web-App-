const Doctor = require('../models/doctorModel');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

// Helper function to create and send JWT token
const createSendToken = (doctor, statusCode, req, res) => {
  const token = jwt.sign(
    { id: doctor._id, role: 'doctor' },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '90d',
    }
  );

  // Remove password from output
  doctor.password = undefined;

  // Parse cookie expiry time with a fallback value
  const cookieExpiresIn = parseInt(process.env.JWT_COOKIE_EXPIRES_IN) || 90;

  // send token in cookie
  res.cookie('jwt', token, {
    expires: new Date(Date.now() + cookieExpiresIn * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'None',
  });

  res.status(statusCode).json({
    status: 'success',
    token,
    doctor,
  });
};


// Doctor signup
exports.signup = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      specialty,
      licenseNumber,
      experience,
      phone,
      address
    } = req.body;

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email is already registered',
      });
    }

    // Create a new doctor
    const newDoctor = await Doctor.create({
      name,
      email,
      password,
      specialty,
      licenseNumber,
      experience,
      phone,
      address
    });

    // Generate verification token
    const verificationToken = newDoctor.createEmailVerificationToken();
    await newDoctor.save({ validateBeforeSave: false });

    // Create verification URL
    const verificationURL = `${req.protocol}://${req.get(
      'host'
    )}/api/doctors/verify-email/${verificationToken}`;

    const message = `To verify your email address, please click on the link: ${verificationURL}.\nIf you did not create this account, please ignore this email.`;

    // Send verification email
    try {
      await sendEmail({
        email: newDoctor.email,
        subject: 'Email Verification for SheWell Health Platform',
        message,
      });

      res.status(201).json({
        status: 'success',
        message: 'Doctor account created! Please check your email to verify your account.',
      });
    } catch (err) {
      // If email sending fails, reset tokens and save
      newDoctor.emailVerificationToken = undefined;
      newDoctor.emailVerificationExpires = undefined;
      await newDoctor.save({ validateBeforeSave: false });

      return res.status(500).json({
        status: 'error',
        message: 'There was an error sending the verification email. Please try again later.',
      });
    }
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Email verification
exports.verifyEmail = async (req, res, next) => {
  try {
    // Get doctor based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const doctor = await Doctor.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    // If token has expired or is invalid
    if (!doctor) {
      return res.status(400).json({
        status: 'fail',
        message: 'Token is invalid or has expired',
      });
    }

    // Activate account
    doctor.isVerified = true;
    doctor.emailVerificationToken = undefined;
    doctor.emailVerificationExpires = undefined;
    await doctor.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully! You can now login.',
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

// Doctor login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password',
      });
    }

    // Check if doctor exists and password is correct
    const doctor = await Doctor.findOne({ email }).select('+password');

    if (!doctor || !(await doctor.correctPassword(password, doctor.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password',
      });
    }

    // Check if doctor has verified their email
    if (!doctor.isVerified) {
      return res.status(401).json({
        status: 'fail',
        message: 'Please verify your email address before logging in',
      });
    }

    // Check if doctor is approved by admin
    if (!doctor.isApproved) {
      return res.status(401).json({
        status: 'fail',
        message: 'Your account is pending approval from administrators',
      });
    }
    console.log("logged in doctor", doctor);
    // If everything is ok, send token to client
    createSendToken(doctor, 200, req, res);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    // Get doctor based on posted email
    const doctor = await Doctor.findOne({ email: req.body.email });
    if (!doctor) {
      return res.status(404).json({
        status: 'fail',
        message: 'There is no doctor with this email address',
      });
    }

    // Generate random reset token
    const resetToken = doctor.createPasswordResetToken();
    await doctor.save({ validateBeforeSave: false });

    // Send it to doctor's email
    const resetURL = `${req.protocol}://${req.get('host')}/doctor/reset-password/${resetToken}`;

    const message = `Forgot your password? Submit a request with your new password to: ${resetURL}.\nIf you didn't forget your password, please ignore this email.`;

    try {
      await sendEmail({
        email: doctor.email,
        subject: 'Your password reset token (valid for 10 minutes)',
        message,
      });

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!',
      });
    } catch (err) {
      doctor.passwordResetToken = undefined;
      doctor.passwordResetExpires = undefined;
      await doctor.save({ validateBeforeSave: false });

      return res.status(500).json({
        status: 'error',
        message: 'There was an error sending the email. Try again later!',
      });
    }
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    // Get doctor based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const doctor = await Doctor.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // If token has not expired, and there is a doctor, set the new password
    if (!doctor) {
      return res.status(400).json({
        status: 'fail',
        message: 'Token is invalid or has expired',
      });
    }

    doctor.password = req.body.password;
    doctor.passwordResetToken = undefined;
    doctor.passwordResetExpires = undefined;
    await doctor.save();

    // Log the doctor in, send JWT
    createSendToken(doctor, 200, req, res);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

// Protect routes - middleware to check if doctor is authenticated
exports.protect = async (req, res, next) => {
  try {
    // Get token and check if it exists
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      // Also check for token in cookies
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in! Please log in to get access',
      });
    }

    // Verification of token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Check if doctor still exists
    const currentDoctor = await Doctor.findById(decoded.id);
    if (!currentDoctor) {
      return res.status(401).json({
        status: 'fail',
        message: 'The doctor belonging to this token no longer exists',
      });
    }

    // Grant access to protected route
    req.doctor = currentDoctor;
    next();
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: 'Authentication failed',
    });
  }
};