const mongoose = require('mongoose');
const AppointmentSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Will be set when linking to existing users
    patientName: { type: String, required: true },
    patientEmail: { type: String },
    patientPhone: { type: String },
    slot: { type: String, required: true },
    symptoms: { type: [String], required: true },
    status: { 
      type: String, 
      enum: ['pending', 'accepted', 'rejected', 'completed'],
      default: 'pending'
    },
    notes: { type: String },
    doctorNotes: { type: String }, // Add this field for doctor's notes
    bookedAt: { type: Date, default: Date.now },
    lastVisitDate: { type: Date } // Add this field to track last visit
});

module.exports = mongoose.model('Appointment', AppointmentSchema);