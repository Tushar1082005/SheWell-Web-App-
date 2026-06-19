const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phoneNumber: String,
  symptoms: [String],
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  lastVisit: Date,
  nextAppointment: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Patient', PatientSchema);