const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false,
    },
    specialty: {
      type: String,
      required: [true, 'Please specify your medical specialty'],
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: [true, 'Please provide your medical license number'],
      unique: true,
      trim: true,
    },
    experience: {
      type: Number,
      default: 0,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    symptoms: {
      type: [String],
      default: [],
    },
    availableSlots: {
      type: [String],
      default: [],
    },
    twoFactorSecret: {
      type: String,
      select: false // Keep this secret
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    twoFactorTempSecret: String,
  },
  {
    timestamps: true,
  }
);

// Hash the password before saving
doctorSchema.pre('save', async function (next) {
  // Only run if password is modified
  if (!this.isModified('password')) return next();

  // Hash password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare passwords
doctorSchema.methods.correctPassword = async function (
  candidatePassword,
  doctorPassword
) {
  return await bcrypt.compare(candidatePassword, doctorPassword);
};

// Create password reset token
doctorSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Token expires in 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Create email verification token
doctorSchema.methods.createEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Token expires in 24 hours
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

  return verificationToken;
};

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;