const express = require("express");
const doctorAuthController = require("../controllers/doctorAuthController");
const doctorController = require("../controllers/doctorController");
const Doctor = require("../models/doctorModel");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const mongoose = require("mongoose");

const router = express.Router();

// Authentication routes
router.post("/signup", doctorAuthController.signup);
router.post("/login", doctorAuthController.login);
router.get("/verify-email/:token", doctorAuthController.verifyEmail);
router.post("/forgot-password", doctorAuthController.forgotPassword);
router.patch("/reset-password/:token", doctorAuthController.resetPassword);



// Protected routes - require doctor authentication
router.use(doctorAuthController.protect);



// Doctor profile routes
router.get("/profile", doctorController.getProfile);
router.patch("/update-profile", doctorController.updateProfile);
router.patch("/change-password", doctorController.updatePassword);



// this route is for the admin to get all doctors
router.get("/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Validate doctorId
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ error: "Invalid doctor ID" });
    }

    // Find doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.json(doctor);
  } catch (error) {
    console.error("Error fetching doctor:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all doctors (admin only)

router.get("/:doctorId/appointments", async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status } = req.query;

    // Validate doctorId
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ error: "Invalid doctor ID" });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // Build query based on status filter
    const query = { doctorId };
    if (status) {
      query.status = status;
    }

    // Fetch appointments for the doctor
    const appointments = await Appointment.find(query)
      .sort({ bookedAt: -1 }) // Sort by booking date (newest first)
      .exec();

    res.json({ appointments });
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific appointment by ID

router.patch("/:doctorId/appointments/:appointmentId", async (req, res) => {
  try {
    const { doctorId, appointmentId } = req.params;
    const { status, notes } = req.body;

    // Validate parameters
    if (
      !mongoose.Types.ObjectId.isValid(doctorId) ||
      !mongoose.Types.ObjectId.isValid(appointmentId)
    ) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Validate status
    if (!status || !["approved", "rejected", "completed"].includes(status)) {
      return res.status(400).json({
        error: "Invalid status. Must be 'approved', 'rejected', or 'completed'",
      });
    }

    // Find the appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Check if this appointment belongs to the doctor
    if (appointment.doctorId.toString() !== doctorId) {
      return res.status(403).json({
        error: "Unauthorized: This appointment doesn't belong to this doctor",
      });
    }

    // Update appointment status
    appointment.status = status;
    if (notes) {
      appointment.doctorNotes = notes;
    }

    // Save updated appointment
    const updatedAppointment = await appointment.save();

    // Send email notification (integrate with your existing email system)
    // You can expand this based on your email setup

    res.json({
      message: `Appointment ${status}`,
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ error: error.message });
  }
});


// Get all doctors (admin only)

router.get("/:doctorId/availability", async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Validate doctorId
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ error: "Invalid doctor ID" });
    }

    // Find doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.json({ availableSlots: doctor.availableSlots });
  } catch (error) {
    console.error("Error fetching doctor availability:", error);
    res.status(500).json({ error: error.message });
  }
});

// Add new availability slots
router.post("/:doctorId/availability", async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { slots } = req.body;

    // Validate input
    if (!slots || !Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ error: "Slots must be a non-empty array" });
    }

    // Find and update doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // Add new slots (avoiding duplicates)
    const updatedSlots = [...new Set([...doctor.availableSlots, ...slots])];
    doctor.availableSlots = updatedSlots;

    await doctor.save();

    res.json({
      message: "Availability updated",
      availableSlots: doctor.availableSlots,
    });
  } catch (error) {
    console.error("Error updating availability:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update this in your doctorRoutes.js file
router.put('/shewell/appointments/:appointmentId/status', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'accepted', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Update appointment status
    appointment.status = status;
    
    // If appointment is accepted and we have patient email, create or update patient
    if (status === 'accepted' && appointment.patientEmail) {
      // Look for an existing user with this email
      let user = await User.findOne({ email: appointment.patientEmail });
      
      if (!user) {
        // Create a new user
        user = new User({
          username: appointment.patientName || 'Patient',
          email: appointment.patientEmail,
          phoneNumber: appointment.patientPhone || '',
          password: Math.random().toString(36).slice(-8), // Random password
          symptoms: appointment.symptoms || [],
          isPatient: true,
          associatedDoctors: [appointment.doctorId]
        });
        
        await user.save();
        
        // Link the user to the appointment
        appointment.patientId = user._id;
        console.log('Created new user from appointment:', user._id);
      } else {
        // Update existing user's symptoms if we have new ones
        if (appointment.symptoms && appointment.symptoms.length > 0) {
          // Add new symptoms without duplicates
          const updatedSymptoms = [...new Set([...user.symptoms || [], ...appointment.symptoms])];
          user.symptoms = updatedSymptoms;
          
          // Update associated doctors if not already linked
          if (!user.associatedDoctors?.includes(appointment.doctorId)) {
            user.associatedDoctors = [...(user.associatedDoctors || []), appointment.doctorId];
          }
          
          // Update isPatient flag
          user.isPatient = true;
          
          await user.save();
        }
        
        // Link the user to the appointment
        appointment.patientId = user._id;
      }
    }
    
    // If appointment is completed, update lastVisit date
    if (status === 'completed') {
      appointment.lastVisitDate = new Date();
      
      // Update user's lastVisit if they exist
      if (appointment.patientId) {
        await User.findByIdAndUpdate(appointment.patientId, {
          lastVisit: new Date()
        });
      }
    }
    
    await appointment.save();

    // If appointment is rejected, add the slot back to doctor's available slots
    if (status === 'rejected') {
      const doctor = await Doctor.findById(appointment.doctorId);
      if (doctor && !doctor.availableSlots.includes(appointment.slot)) {
        doctor.availableSlots.push(appointment.slot);
        await doctor.save();
      }
    }

    res.json({ 
      message: "Appointment status updated successfully",
      appointment
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({ error: "Failed to update appointment status", message: error.message });
  }
});


// Update this in your doctorRoutes.js file
router.get("/:doctorId/patients", async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    console.log(`Fetching patients for doctor: ${doctorId}`);
    
    // Validate doctorId
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ error: "Invalid doctor ID" });
    }
    
    // Import Patient model (make sure it's the right one)
    const Patient = require('../models/Patient');
    
    // Find patients directly associated with this doctor
    const patients = await Patient.find({
      $or: [
        { doctorId },
        { associatedDoctors: doctorId }
      ]
    });
    
    console.log(`Found ${patients.length} patients directly`);
    
    // Also check appointments for patients who might not be in the patient model yet
    const appointments = await Appointment.find({
      doctorId,
      status: { $in: ['accepted', 'completed'] }
    });
    
    console.log(`Found ${appointments.length} appointments`);
    
    // Create temporary patient objects for those with appointments but no patient record
    const patientEmails = patients.map(p => p.email);
    const tempPatients = [];
    
    for (const appt of appointments) {
      if (!appt.patientEmail || patientEmails.includes(appt.patientEmail)) continue;
      
      patientEmails.push(appt.patientEmail);
      tempPatients.push({
        _id: `temp-${appt.patientEmail.replace(/[^a-z0-9]/gi, '')}`,
        username: appt.patientName || 'Unknown Patient',
        email: appt.patientEmail,
        phoneNumber: appt.patientPhone || '',
        symptoms: appt.symptoms || [],
        status: 'Active',
        lastVisit: appt.status === 'completed' ? appt.updatedAt : null
      });
    }
    
    console.log(`Adding ${tempPatients.length} temp patients`);
    const allPatients = [...patients, ...tempPatients];
    
    res.json({ patients: allPatients });
  } catch (error) {
    console.error("Error fetching doctor's patients:", error);
    res.status(500).json({ error: "Failed to fetch patients", message: error.message });
  }
});

module.exports = router;
