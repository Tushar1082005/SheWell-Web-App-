const express = require('express');
const Patient = require('../models/User.js');

const router = express.Router();

// Get all patients
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { username, email, phoneNumber, symptoms, password, age, address } = req.body;
    
    // Check if patient already exists
    const existingUser = await Patient.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: "A patient with this email already exists",
        _id: existingUser._id 
      });
    }
    
    // Create new patient
    const newPatient = new Patient({
      username,
      email,
      phoneNumber: phoneNumber || '',
      password: password || Math.random().toString(36).slice(-8), // Random password if none provided
      symptoms: symptoms || [],
      age: age || null,
      address: address || ''
    });
    
    await newPatient.save();
    
    // Don't return the password in the response
    const patientResponse = { ...newPatient.toObject() };
    delete patientResponse.password;
    
    res.status(201).json(patientResponse);
  } catch (error) {
    console.error("Error creating patient:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update a patient
router.put('/:id', async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(patient);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a patient
router.delete('/:id', async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: 'Patient deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports =  router;