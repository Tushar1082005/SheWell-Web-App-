const Doctor = require('../models/doctorModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper function to create and send JWT token (duplicated from doctorAuthController for convenience)
const createSendToken = (doctor, statusCode, res) => {
  const token = jwt.sign(
    { id: doctor._id, role: 'doctor' },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

  // Remove password from output
  doctor.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialty: doctor.specialty,
        isVerified: doctor.isVerified,
        isApproved: doctor.isApproved
      }
    }
  });
};

// Get doctor profile
exports.getProfile = async (req, res) => {
  try {
    console.log('Getting doctor profile...');
    
    // No need to look for token here - the protect middleware already did that
    // and added req.doctor to the request
    const doctor = await Doctor.findById(req.doctor.id);

    if (!doctor) {
      return res.status(404).json({
        status: 'fail',
        message: 'Doctor not found.',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        doctor,
      },
    });
  } catch (err) {
    console.error('Error fetching doctor profile:', err.message);
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

// Update doctor profile
exports.updateProfile = async (req, res) => {
  try {
    // Prevent password updates in this route
    if (req.body.password) {
      return res.status(400).json({
        status: 'fail',
        message: 'This route is not for password updates. Please use /change-password',
      });
    }

    // Filter out unwanted fields that should not be updated
    const filteredBody = filterObj(
      req.body,
      'name',
      'specialty',
      'email',
      'phone',
      'bio'
    );

    // Update doctor document
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.doctor.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        doctor: updatedDoctor,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Update password
exports.updatePassword = async (req, res) => {
  try {
    // Get doctor from collection
    const doctor = await Doctor.findById(req.doctor.id).select('+password');

    // Check if current password is correct
    if (
      !(await doctor.correctPassword(req.body.currentPassword, doctor.password))
    ) {
      return res.status(401).json({
        status: 'fail',
        message: 'Your current password is incorrect',
      });
    }

    // If so, update password
    doctor.password = req.body.newPassword;
    await doctor.save();

    // Log doctor in, send JWT
    createSendToken(doctor, 200, res);
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Helper function to filter objects
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(key => {
    if (allowedFields.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};