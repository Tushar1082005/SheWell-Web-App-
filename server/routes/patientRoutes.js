const express = require('express');
const Patient = require('../models/Patient');
const router = express.Router();

// Add a patient
router.post('/', async (req, res) => {
  try {
    const { username, email, phoneNumber, symptoms, doctorId, status } = req.body;
    
    if (!username || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }
    
    // Check if patient already exists
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      // Update existing patient
      existingPatient.username = username;
      if (phoneNumber) existingPatient.phoneNumber = phoneNumber;
      
      // Update symptoms
      if (symptoms && symptoms.length > 0) {
        existingPatient.symptoms = [...new Set([...existingPatient.symptoms || [], ...symptoms])];
      }
      
      // Associate with doctor
      if (doctorId && !existingPatient.associatedDoctors.includes(doctorId)) {
        existingPatient.associatedDoctors.push(doctorId);
        existingPatient.doctorId = doctorId; // Set primary doctorId as well
      }
      
      await existingPatient.save();
      
      console.log(`Updated existing patient: ${existingPatient._id}`);
      return res.json(existingPatient);
    }
    
    // Create new patient
    const newPatient = new Patient({
      username,
      email,
      phoneNumber: phoneNumber || '',
      symptoms: symptoms || [],
      doctorId,
      associatedDoctors: doctorId ? [doctorId] : [],
      status: status || 'Active'
    });
    
    await newPatient.save();
    console.log(`Created new patient: ${newPatient._id}`);
    
    res.status(201).json(newPatient);
  } catch (error) {
    console.error("Error creating/updating patient:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all patients for a doctor
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    console.log(`Fetching patients for doctor: ${doctorId}`);
    
    // Find patients associated with this doctor
    const patients = await Patient.find({
      $or: [
        { doctorId },
        { associatedDoctors: doctorId }
      ]
    });
    
    console.log(`Found ${patients.length} patients for doctor ${doctorId}`);
    res.json({ patients });
  } catch (error) {
    console.error("Error fetching doctor's patients:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;