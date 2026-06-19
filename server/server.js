const express = require("express");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const twilio = require("twilio");
const nodemailer = require("nodemailer");
const Patient = require("./models/Patient");

// Initialize Express app
const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8080',
];


const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Configure middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(cookieParser());
app.use(express.json());

// Database connection
const { dbConnect } = require("./config/Database");
dbConnect();

// Import and use route modules
const sheWellRouter = require("./routes/sheWellRoutes");
app.use("/api/shewell", sheWellRouter);

// Define database models
// Doctor model
const {doctorSchema} = require("./models/doctorModel");
const Doctor = mongoose.model('Doctor', doctorSchema);

// Appointment model

const Appointment = require("./models/Appointment");

// Reply schema
const replySchema = new mongoose.Schema({
  text: String,
  audioUrl: String,
  author: String,
  timestamp: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 }
});

// Discussion schema
const discussionSchema = new mongoose.Schema({
  text: String,
  audioUrl: String,
  author: String,
  timestamp: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  replies: [replySchema],
  lastActivity: { type: Date, default: Date.now }
});
const Discussion = mongoose.model('Discussion', discussionSchema);

// NGO Location model
const NgoLocationSchema = new mongoose.Schema({
  name: String,
  phoneNumber: String,
  landmark: String,
  lat: Number,
  lng: Number
});
const NgoLocation = mongoose.model('NgoLocation', NgoLocationSchema);

// Configure Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
const client = twilio(accountSid, authToken);

// Configure Email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || "rutanshc0101@gmail.com",
    pass: process.env.EMAIL_PASS || 'lgkk pjie ivpy vobz'
  }
});

// API Routes

// SOS routes
app.post("/api/send-sos", async (req, res) => {
  try {
    const { phone, latitude, longitude } = req.body;
    if (!phone || !latitude || !longitude) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const messageBody = `🚨 SOS Alert! 🚨\nLocation: https://www.google.com/maps?q=${latitude},${longitude}`;

    const message = await client.messages.create({
      body: messageBody,
      messagingServiceSid: "MG3caf49aa35f472de4ae363bfa0adf549",
      to: "+917814736226",
    });

    res.json({ success: true, messageSid: message.sid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// NGO Location routes
app.post("/api/shewell/locations", async (req, res) => {
  try {
    const { name, phoneNumber, landmark, lat, lng } = req.body;
    const newLocation = new NgoLocation({ 
      name, 
      phoneNumber,
      landmark,
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    });
    
    await newLocation.save();
    res.status(201).json(newLocation);
  } catch (error) {
    res.status(500).json({ message: "Error saving location", error });
  }
});

app.get("/api/shewell/locations", async (req, res) => {
  try {
    const locations = await NgoLocation.find();
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching locations", error });
  }
});

// Discussion routes
app.get('/api/shewell/discussions', async (req, res) => {
  try {
    const { sortBy = 'likes', searchQuery = '' } = req.query;
    
    let query = {};
    if (searchQuery) {
      query = {
        $or: [
          { text: { $regex: searchQuery, $options: 'i' } },
          { author: { $regex: searchQuery, $options: 'i' } }
        ]
      };
    }

    let sort = {};
    switch (sortBy) {
      case 'likes':
        sort = { likes: -1 };
        break;
      case 'newest':
        sort = { timestamp: -1 };
        break;
      case 'activity':
        sort = { lastActivity: -1 };
        break;
      default:
        sort = { likes: -1 };
    }

    const discussions = await Discussion.find(query)
      .sort(sort)
      .limit(10)
      .exec();

    res.json(discussions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/shewell/discussions', async (req, res) => {
  const { text, audioUrl, author } = req.body;
  
  if (!text && !audioUrl) {
    return res.status(400).json({ message: 'Content is required' });
  }

  const discussion = new Discussion({
    text,
    audioUrl,
    author,
    lastActivity: Date.now()
  });

  try {
    const newDiscussion = await discussion.save();
    res.status(201).json(newDiscussion);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/shewell/discussions/:id/like', async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ message: 'Discussion not found' });
    
    discussion.likes += 1;
    const updatedDiscussion = await discussion.save();
    res.json(updatedDiscussion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/shewell/discussions/:id', async (req, res) => {
  try {
    const discussion = await Discussion.findByIdAndDelete(req.params.id);
    if (!discussion) return res.status(404).json({ message: 'Discussion not found' });
    res.json({ message: 'Discussion deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/shewell/discussions/:id/replies', async (req, res) => {
  const { text, audioUrl, author } = req.body;
  
  if (!text && !audioUrl) {
    return res.status(400).json({ message: 'Content is required' });
  }

  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ message: 'Discussion not found' });

    discussion.replies.push({
      text,
      audioUrl,
      author,
      timestamp: Date.now()
    });
    
    discussion.lastActivity = Date.now();
    const updatedDiscussion = await discussion.save();
    res.status(201).json(updatedDiscussion.replies.slice(-1)[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/shewell/discussions/:discussionId/replies/:replyId/like', async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.discussionId);
    if (!discussion) return res.status(404).json({ message: 'Discussion not found' });

    const reply = discussion.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ message: 'Reply not found' });

    reply.likes += 1;
    const updatedDiscussion = await discussion.save();
    res.json(updatedDiscussion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/shewell/discussions/:discussionId/replies/:replyId', async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.discussionId);
    if (!discussion) return res.status(404).json({ message: 'Discussion not found' });

    discussion.replies = discussion.replies.filter(
      reply => reply._id.toString() !== req.params.replyId
    );
    
    const updatedDiscussion = await discussion.save();
    res.json(updatedDiscussion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Doctor routes
app.post('/api/shewell/add-doctor', async (req, res) => {
  try {
    const { name, specialty, symptoms, availableSlots } = req.body;

    // Validate required fields
    if (!name || !specialty || !symptoms || !availableSlots) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newDoctor = new Doctor({
      name,
      specialty,
      symptoms,
      availableSlots: availableSlots
    });

    await newDoctor.save();
    res.status(201).json(newDoctor);
  } catch (error) {
    console.error("Error adding doctor:", error);
    res.status(500).json({ error: error.message });
  }
});

// Replace the existing match-doctors endpoint with this enhanced version
app.post('/api/shewell/match-doctors', async (req, res) => {
  try {
    const { symptoms } = req.body;
    
    // Find matching doctors and calculate a relevance score
    const allDoctors = await Doctor.find({});
    
    const matchedDoctors = allDoctors.map(doctor => {
      // Calculate match score based on symptom overlap
      const matchingSymptoms = doctor.symptoms.filter(
        docSymptom => symptoms.some(
          s => docSymptom.toLowerCase().includes(s.toLowerCase())
        )
      );
      
      const matchScore = matchingSymptoms.length / symptoms.length;
      
      return {
        ...doctor.toObject(),
        matchScore,
        matchingSymptoms
      };
    })
    .filter(doctor => doctor.matchScore > 0) // Only return doctors with at least one matching symptom
    .sort((a, b) => b.matchScore - a.matchScore); // Sort by highest match score first
    
    res.json({ doctors: matchedDoctors });
  } catch (error) {
    console.error("Error finding doctors:", error);
    res.status(500).json({ error: "Error finding doctors" });
  }
});

app.post("/api/shewell/book-appointment", async (req, res) => {
  try {
    const { doctorId, slot, symptoms, patientEmail, patientName, patientPhone } = req.body;
    
    if (!doctorId || !slot || !symptoms || !patientName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.availableSlots.includes(slot)) {
      return res.status(400).json({ error: "Invalid time slot" });
    }

    // Create appointment
    const newAppointment = new Appointment({ 
      doctorId,
      patientName,
      patientEmail,
      patientPhone,
      slot,
      symptoms,
      status: 'pending',
      bookedAt: new Date()
    });

    await newAppointment.save();

    // Update doctor's available slots
    doctor.availableSlots = doctor.availableSlots.filter(s => s !== slot);
    await doctor.save();

    // Send confirmation emails
    // Use doctor's email from doctor object, fall back to admin email if not available
    const doctorEmailAddress = doctor.email || process.env.ADMIN_EMAIL || "rutanshc0101@gmail.com";
    
    // Only send email to patient if they provided an email
    if (patientEmail) {
      // Check if patient already exists
      let patient = await Patient.findOne({ email: patientEmail });
      
      if (!patient) {
        // Create new patient record
        patient = new Patient({
          username: patientName,
          email: patientEmail,
          phoneNumber: patientPhone,
          symptoms,
          doctorId,
          status: 'Active'
        });
        await patient.save();
        console.log("Created new patient record for:", patientEmail);
      }
    }
    
    // Always send notification to doctor
    const doctorMailOptions = {
      from: process.env.EMAIL_USER || "rutanshc0101@gmail.com",
      to: doctorEmailAddress,
      subject: 'New Appointment Request',
      text: `You have a new appointment request from ${patientName} for ${formatDate(slot)}. 
             Patient contact: ${patientEmail || "No email provided"}, ${patientPhone || "No phone provided"}.
             Symptoms: ${symptoms.join(", ")}`
    };
    
    try {
      await transporter.sendMail(doctorMailOptions);
      console.log(`Notification email sent to doctor: ${doctorEmailAddress}`);
    } catch (emailError) {
      console.error("Error sending doctor email:", emailError);
      // Don't fail the whole request if email fails
    }

    res.json({ 
      message: "Appointment request submitted successfully",
      appointment: newAppointment
    });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ error: "Failed to book appointment" });
  }
});

// Helper function to format dates nicely for emails
function formatDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});




// Add this to your server.js file
app.get('/api/shewell/test-patient-api', async (req, res) => {
  try {
    // Log models to check if they're loaded correctly
    console.log('Available models:', Object.keys(mongoose.models));
    res.json({ 
      status: 'ok', 
      message: 'Patient API is working',
      models: Object.keys(mongoose.models) 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




// Add this to your server.js file
const patientRoutes = require('./routes/patientRoutes');
app.use('/api/patients', patientRoutes);

// Add specifically for shewell client
app.use('/api/shewell/patients', patientRoutes);

app.post('/api/shewell/add-patient', async (req, res) => {
  try {
    const { username, email, phoneNumber, symptoms, doctorId, status } = req.body;
    
    if (!username || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }
    
    // Safely parse doctorId if present
    let mongoObjectId = null;
    if (doctorId) {
      try {
        mongoObjectId = new mongoose.Types.ObjectId(doctorId);
      } catch (idError) {
        console.error("Invalid doctorId format:", doctorId);
        // We'll continue but with null doctorId
      }
    }
    
    // Format symptoms as array if it's a string or other format
    let symptomsList = symptoms;
    if (typeof symptoms === 'string') {
      symptomsList = symptoms
        .split(',')
        .map(s => s.trim())
        .filter(s => s !== '');
    } else if (!Array.isArray(symptoms)) {
      symptomsList = [];
    }
    
    // First check if patient exists
    const existingPatient = await Patient.findOne({ email });
    
    if (existingPatient) {
      // Update existing patient
      existingPatient.username = username;
      if (phoneNumber) existingPatient.phoneNumber = phoneNumber;
      if (symptomsList && symptomsList.length > 0) {
        existingPatient.symptoms = [...new Set([...existingPatient.symptoms || [], ...symptomsList])];
      }
      if (mongoObjectId) existingPatient.doctorId = mongoObjectId;
      if (status) existingPatient.status = status;
      
      await existingPatient.save();
      console.log("Updated existing patient:", existingPatient._id);
      
      return res.json(existingPatient);
    }
    
    // Create new patient
    const newPatient = new Patient({
      username,
      email,
      phoneNumber: phoneNumber || '',
      symptoms: symptomsList,
      doctorId: mongoObjectId,
      status: status || 'Active'
    });
    
    await newPatient.save();
    console.log("Created new patient:", newPatient._id);
    
    res.status(201).json(newPatient);
  } catch (error) {
    console.error("Error adding patient:", error);
    res.status(500).json({ 
      error: "Failed to add patient", 
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
});








// Get patients for a doctor
app.get('/api/doctors/:doctorId/patients', async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    console.log("Fetching patients for doctor:", doctorId);
    
    // Safely handle the ObjectId conversion
    let mongoObjectId;
    try {
      mongoObjectId = new mongoose.Types.ObjectId(doctorId);
    } catch (idError) {
      return res.status(400).json({ 
        error: "Invalid doctor ID format", 
        details: idError.message 
      });
    }
    
    // Find patients directly associated with this doctor
    // Use the proper doctorId format
    const patients = await Patient.find({ doctorId: mongoObjectId });
    
    console.log(`Found ${patients.length} patients directly for doctor ${doctorId}`);
    
    // Also find patients who have appointments with this doctor
    const appointmentsWithPatients = await Appointment.find({ doctorId: mongoObjectId });
    console.log(`Found ${appointmentsWithPatients.length} appointments for doctor ${doctorId}`);
    
    const patientIdsFromAppointments = appointmentsWithPatients.map(appointment => {
      return {
        email: appointment.patientEmail,
        name: appointment.patientName,
        phone: appointment.patientPhone,
        symptoms: appointment.symptoms || []
      };
    });
    
    // Create temporary patient objects for patients who came through appointments
    // but aren't registered as patients yet
    const tempPatients = [];
    for (const patientInfo of patientIdsFromAppointments) {
      if (!patientInfo.email) continue;
      
      // Check if this patient already exists in our patients list
      const exists = patients.some(p => p.email === patientInfo.email);
      if (!exists) {
        // Create a temporary patient entry
        tempPatients.push({
          _id: `temp-${patientInfo.email.replace(/[^a-z0-9]/gi, '')}`,
          username: patientInfo.name || 'Anonymous Patient',
          email: patientInfo.email,
          phoneNumber: patientInfo.phone || 'Not available',
          symptoms: patientInfo.symptoms || [],
          lastVisit: null
        });
      }
    }
    
    // Combine both lists
    const allPatients = [...patients, ...tempPatients];
    console.log(`Returning ${allPatients.length} total patients (${patients.length} registered + ${tempPatients.length} temporary)`);
    
    res.json({ patients: allPatients });
  } catch (error) {
    console.error("Error fetching patients for doctor:", error);
    res.status(500).json({ 
      error: "Failed to fetch patients", 
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
});


// Add these routes to your existing Express app

app.get('/api/shewell/doctor-appointments/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status } = req.query;
    
    console.log("Received doctor ID:", doctorId);
    
    // This is the fix - create a MongoDB ObjectId properly
    let mongoObjectId;
    try {
      mongoObjectId = new mongoose.Types.ObjectId(doctorId);
    } catch (idError) {
      return res.status(400).json({ error: "Invalid doctor ID format" });
    }
    
    let query = { doctorId: mongoObjectId };
    
    // Filter by status if provided
    if (status && ['pending', 'accepted', 'rejected', 'completed'].includes(status)) {
      query.status = status;
    }

    console.log("Query:", JSON.stringify(query));

    // Get appointments with all fields
    const appointments = await Appointment.find(query)
      .select('patientName patientEmail patientPhone slot symptoms status _id bookedAt')
      .sort({ bookedAt: -1 })
      .exec();
      
    console.log("Found appointments:", appointments.length);

    res.json({ appointments });
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    res.status(500).json({ 
      error: "Failed to fetch appointments", 
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack 
    });
  }
});

app.put('/api/shewell/appointments/:appointmentId/status', async (req, res) => {
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
    await appointment.save();

    // If appointment is rejected, add the slot back to doctor's available slots
    if (status === 'rejected') {
      try {
        const doctor = await Doctor.findById(appointment.doctorId);
        if (doctor && !doctor.availableSlots.includes(appointment.slot)) {
          doctor.availableSlots.push(appointment.slot);
          await doctor.save();
        }
      } catch (docError) {
        console.error("Error updating doctor slots:", docError);
        // Continue anyway since we successfully updated the appointment
      }
    }

    res.json({ 
      message: "Appointment status updated successfully",
      appointment
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({ error: "Failed to update appointment status" });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });

    res.json({
      totalPatients,
      totalAppointments,
      pendingAppointments,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});




const appointmentRoutes = require('./routes/appointmentRoutes');
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);





const doctorRoutes = require('./routes/doctorRoutes');
app.use('/api/doctors', doctorRoutes);



// Analytics data endpoint for doctors
app.get('/api/shewell/doctor-analytics/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    // Create MongoDB ObjectId
    let mongoObjectId;
    try {
      mongoObjectId = new mongoose.Types.ObjectId(doctorId);
    } catch (idError) {
      return res.status(400).json({ error: "Invalid doctor ID format" });
    }
    
    // Get appointments for monthly graph
    const appointments = await Appointment.find({ doctorId: mongoObjectId });
    
    // Process monthly appointments data
    const monthCounts = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize all months with 0
    monthNames.forEach(month => {
      monthCounts[month] = 0;
    });
    
    // Count appointments by month
    appointments.forEach(appointment => {
      const date = new Date(appointment.bookedAt);
      const month = monthNames[date.getMonth()];
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });
    
    // Format for chart
    const monthlyAppointments = Object.entries(monthCounts).map(([month, count]) => ({
      month,
      appointments: count
    }));
    
    // Get demographic data (using age if available, otherwise use mock data)
    const patients = await Patient.find({ doctorId: mongoObjectId });
    const ageGroups = { '18-24': 0, '25-34': 0, '35-44': 0, '45-54': 0, '55+': 0 };
    
    patients.forEach(patient => {
      if (patient.age) {
        if (patient.age < 25) ageGroups['18-24']++;
        else if (patient.age < 35) ageGroups['25-34']++;
        else if (patient.age < 45) ageGroups['35-44']++;
        else if (patient.age < 55) ageGroups['45-54']++;
        else ageGroups['55+']++;
      }
    });
    
    const demographics = Object.entries(ageGroups).map(([name, value]) => ({
      name, 
      value: value || 0 // Default to 0 if no patients in that age group
    }));
    
    // Get treatment categories from appointments
    // This assumes you store the appointment type or category
    const treatmentTypes = {};
    appointments.forEach(appointment => {
      // You might need to adjust this based on your data model
      const type = appointment.appointmentType || 'Consultation';
      treatmentTypes[type] = (treatmentTypes[type] || 0) + 1;
    });
    
    // Fallback if no categories found
    const defaultCategories = ['Consultation', 'Check-up', 'Treatment', 'Follow-up'];
    if (Object.keys(treatmentTypes).length === 0) {
      defaultCategories.forEach(type => {
        treatmentTypes[type] = Math.floor(Math.random() * 30) + 5; // Random data between 5-35
      });
    }
    
    const treatmentCategories = Object.entries(treatmentTypes).map(([name, value]) => ({
      name,
      value
    }));
    
    res.json({
      monthlyAppointments,
      demographics,
      treatmentCategories
    });
    
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ 
      error: "Failed to fetch analytics data",
      message: error.message
    });
  }
});




// Add this endpoint to your server.js file

// Doctor dashboard appointment status update endpoint with improved patient creation
app.put('/api/shewell/doctor-dashboard/appointments/:appointmentId/status', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;
    
    console.log(`Updating appointment ${appointmentId} status to ${status}`);
    
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
      console.log(`Processing patient data for email: ${appointment.patientEmail}`);
      
      try {
        // First check if patient exists in Patient model
        let patient = await Patient.findOne({ email: appointment.patientEmail });
        
        if (!patient) {
          console.log('Creating new patient record in Patient model');
          // Create new patient in the Patient model
          patient = new Patient({
            username: appointment.patientName || 'New Patient',
            email: appointment.patientEmail,
            phoneNumber: appointment.patientPhone || '',
            symptoms: appointment.symptoms || [],
            doctorId: appointment.doctorId,
            associatedDoctors: [appointment.doctorId],
            status: 'Active',
            createdAt: new Date()
          });
          
          await patient.save();
          console.log(`Created new Patient record with ID: ${patient._id}`);
        } else {
          console.log(`Found existing patient in Patient model: ${patient._id}`);
          // Update existing patient
          if (appointment.symptoms && appointment.symptoms.length > 0) {
            console.log('Updating patient symptoms');
            patient.symptoms = [...new Set([...(patient.symptoms || []), ...appointment.symptoms])];
          }
          
          // Associate with doctor if not already
          if (patient.doctorId?.toString() !== appointment.doctorId.toString()) {
            patient.doctorId = appointment.doctorId;
          }
          
          // Add to associated doctors if not already included
          if (!patient.associatedDoctors) patient.associatedDoctors = [];
          
          const doctorIdStr = appointment.doctorId.toString();
          if (!patient.associatedDoctors.find(id => id.toString() === doctorIdStr)) {
            patient.associatedDoctors.push(appointment.doctorId);
          }
          
          await patient.save();
          console.log(`Updated Patient record: ${patient._id}`);
        }
        
        // Also check User model
        try {
          console.log('Checking User model');
          let user = await User.findOne({ email: appointment.patientEmail });
          
          if (!user) {
            console.log('Creating new user record in User model');
            // Create new User
            user = new User({
              username: appointment.patientName || 'New Patient',
              email: appointment.patientEmail,
              phoneNumber: appointment.patientPhone || '',
              password: Math.random().toString(36).slice(-8), // Random password
              symptoms: appointment.symptoms || [],
              isPatient: true,
              associatedDoctors: [appointment.doctorId],
              createdAt: new Date()
            });
            
            await user.save();
            console.log(`Created new User record with ID: ${user._id}`);
            appointment.patientId = user._id;
          } else {
            console.log(`Found existing user in User model: ${user._id}`);
            // Update existing User
            user.symptoms = [...new Set([...(user.symptoms || []), ...(appointment.symptoms || [])])];
            user.isPatient = true;
            
            // Add doctor association if needed
            if (!user.associatedDoctors) user.associatedDoctors = [];
            
            const doctorIdStr = appointment.doctorId.toString();
            if (!user.associatedDoctors.find(id => id && id.toString() === doctorIdStr)) {
              user.associatedDoctors.push(appointment.doctorId);
            }
            
            await user.save();
            console.log(`Updated User record: ${user._id}`);
            appointment.patientId = user._id;
          }
        } catch (userError) {
          console.error('Error processing User record:', userError);
          // Continue anyway - Patient record is more important for dashboard
        }
      } catch (patientError) {
        console.error('Error creating/updating patient record:', patientError);
        // Continue anyway since we should update appointment status
      }
    }
    
    // If appointment is completed, update lastVisit date
    if (status === 'completed') {
      console.log('Setting completed date');
      appointment.lastVisitDate = new Date();
    }
    
    await appointment.save();
    console.log(`Appointment ${appointmentId} status updated to ${status}`);

    // If appointment is rejected, add the slot back to doctor's available slots
    if (status === 'rejected') {
      try {
        const doctor = await Doctor.findById(appointment.doctorId);
        if (doctor && !doctor.availableSlots.includes(appointment.slot)) {
          doctor.availableSlots.push(appointment.slot);
          await doctor.save();
          console.log('Added slot back to doctor available slots');
        }
      } catch (docError) {
        console.error("Error updating doctor slots:", docError);
        // Continue anyway since we successfully updated the appointment
      }
    }

    res.json({ 
      message: "Appointment status updated successfully",
      appointment
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({ 
      error: "Failed to update appointment status", 
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack 
    });
  }
});




// Add this debugging endpoint
app.get('/api/debug/patients', async (req, res) => {
  try {
    const patients = await Patient.find().limit(10);
    res.json({
      count: await Patient.countDocuments(),
      models: Object.keys(mongoose.models),
      samplePatients: patients
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




const axios = require('axios');


app.post('/api/chat', async (req, res) => {
  try {
    const { message, language, previousMessages = [] } = req.body;
    console.log("Received message:", message);
    console.log("Received language:", language);
    console.log("Received previous messages:", previousMessages);
    
    // Map frontend language selections to proper language names for the AI
    const languageMap = {
      'english': 'English',
      'spanish': 'Spanish (Español)',
      'french': 'French (Français)',
      'hindi': 'Hindi (हिन्दी)',
      // Add more languages as needed
    };
    
    const responseLanguage = languageMap[language.toLowerCase()];
    console.log("Response language:", responseLanguage);
    
    // Azure OpenAI endpoint structure
    const endpoint = `${process.env.OPENAI_API_BASE}/openai/deployments/${process.env.OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=${process.env.OPENAI_API_VERSION}`;
    
    const response = await axios.post(
      endpoint,
      {
        messages: [
          {
            role: "system",
            content: `You are an AI medical assistant specializing in women's health with the role of a gynecologist/obstetrician. 
            You only provide information on women's health topics including but not limited to:
            - Menstrual health and menstrual disorders
            - Pregnancy, childbirth, and postpartum care
            - Reproductive health and fertility
            - Gynecological conditions and diseases
            - Breast health and breast cancer awareness
            - Menopause and hormonal changes
            - Sexual health for women
            - Contraception and family planning
            - Common infections and conditions specific to women
            - Preventive care and wellness for women
            
            IMPORTANT: You must respond in ${responseLanguage}. All text should be in ${responseLanguage}.
            
            Include this disclaimer at the end of every response (translated to ${responseLanguage}):
            **Medical Disclaimer:** This information is AI-generated and should not replace professional medical advice. Always consult with a qualified healthcare provider for medical concerns.`
          },
          ...previousMessages,
          { role: "user", content: message }
        ],
        temperature: 0.4,
        max_tokens: 600
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.OPENAI_API_KEY
        }
      }
    );
    
    res.json({ response: response.data.choices[0].message.content });
  } catch (error) {
    console.error('Azure OpenAI Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'An error occurred while processing your request',
      details: error.response?.data?.error?.message || error.message
    });
  }
});




app.post('/api/shewell/symptom-help', async (req, res) => {
  try {
    const { query } = req.body;
    console.log("Received symptom help query:", query);
    
    // Check if query is not health-related
    const nonHealthTerms = ["movie", "film", "cinema", "show", "music", "song", "weather", "sport"];
    if (nonHealthTerms.some(term => query.toLowerCase().includes(term))) {
      // Return formatted response for non-health topics
      return res.json({
        title: "Non-Health Topic Detected",
        advice: [
          {
            type: "Information",
            items: [
              "This assistant specializes in women's health topics.",
              "Please ask about menstrual health, pregnancy, or other women's health concerns for more helpful information."
            ]
          }
        ],
        videoRecommendation: null
      });
    }
    
    // Continue with Azure OpenAI call for health-related topics
    const endpoint = `${process.env.OPENAI_API_BASE}/openai/deployments/${process.env.OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=${process.env.OPENAI_API_VERSION}`;
    
    const response = await axios.post(
      endpoint,
      {
        messages: [
          {
            role: "system",
            content: `You are an AI medical assistant specializing in women's health. 
            A user is asking about a symptom related to menstrual health, pregnancy, or women's health.
            
            Provide helpful information in a structured format that includes:
            1. A brief description of the symptom or condition
            2. Advice categorized into sections (like "Yoga Poses", "Food Recommendations", "Other Remedies")
            3. A relevant YouTube video recommendation
            
            Return your response as a valid JSON object with the following structure:
            {
              "title": "Descriptive title of the symptom or condition",
              "advice": [
                {
                  "type": "Category name (e.g., Yoga Poses)",
                  "items": ["specific recommendation 1", "specific recommendation 2", ...]
                },
                ...
              ],
              "videoRecommendation": {
                "title": "Title of YouTube video",
                "watchUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
                "description": "Brief description of the video"
              }
            }
            youtube videoRecommendation should be a latest YouTube video related to the symptom or condition.
            The title should be descriptive and relevant to the symptom.
            Choose a high-quality YouTube video from reputable health channels. The video should be specifically about treating or managing the symptom.
            The embedUrl must use the format https://www.youtube.com/embed/VIDEO_ID.
            
            If the query is not related to women's health, respond with a polite message explaining the scope of this service.
            
            IMPORTANT: Return ONLY valid JSON. Do not include markdown, code blocks, or any other text outside of the JSON structure.`
          },
          {
            role: "user", 
            content: `Help me with this symptom or health concern: "${query}"`
          }
        ],
        temperature: 0.4,
        max_tokens: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.OPENAI_API_KEY
        }
      }
    );
    
    // Parse the response - it should be JSON
    let responseContent = response.data.choices[0].message.content;
    
    try {
      // Clean up the response in case it includes markdown code block markers
      responseContent = responseContent.replace(/```json|```/g, '').trim();
      const parsedResponse = JSON.parse(responseContent);
      
      res.json(parsedResponse);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.log("Raw response:", responseContent);
      
      // Fallback to original text response
      res.json({
        title: "Symptom Information",
        advice: [
          {
            type: "AI Generated Advice",
            items: [responseContent.split('\n').filter(line => line.trim() !== '')]
          }
        ],
        videoRecommendation: null
      });
    }
  } catch (error) {
    console.error('Azure OpenAI Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'An error occurred while processing your request',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// Government Schemes API endpoint
app.post('/api/shewell/schemes', async (req, res) => {
  try {
    const userDetails = req.body;
    console.log('Generating schemes for:', userDetails);

    // Azure OpenAI credentials (use the same ones from govt schemes project)
    const OPENAI_API_BASE = process.env.OPENAI_API_BASE || "https://sarva-ma50r1km-eastus2.cognitiveservices.azure.com/";
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const OPENAI_API_VERSION = process.env.OPENAI_API_VERSION || "2025-01-01-preview";
    const OPENAI_DEPLOYMENT_NAME = process.env.OPENAI_DEPLOYMENT_NAME || "gpt-4.1";
    
    if (!OPENAI_API_KEY) {
      console.warn('No OpenAI API key found, using fallback data');
      // Include fallback logic here if needed
      return res.status(400).json({ error: 'OpenAI API key not configured' });
    }

    // Create system prompt similar to the one in aiService.ts
    const systemPrompt = `
      You are an Indian government scheme recommendation system. Based on user details provided, 
      suggest relevant government schemes in India. 
      
      Provide EXACTLY 3-7 schemes most relevant to the user's profile.
      
      ALWAYS respond with a valid, complete JSON array of scheme objects with the following structure:
      [
        {
          "name": "Scheme Name",
          "description": "Brief description of the scheme (1-2 sentences)",
          "eligibility": "Eligibility criteria (concise)",
          "benefits": "Benefits provided by the scheme (concise)",
          "applicationProcess": "How to apply in simple steps (keep it brief)",
          "link": "Official website URL for the scheme",
          "jurisdiction": "Whether the scheme is Central (all over India) or State-specific (mention which state)",
          "category": "Category of the scheme (e.g., Education, Health, Employment, etc.)"
        }
      ]
      
      For the jurisdiction field, specify if the scheme is centrally administered (all over India) or specific to certain states.
      If state-specific, mention the exact state(s) where it's available.
      
      Keep descriptions concise. Ensure the JSON is properly formatted and complete.
      Do not include any text before or after the JSON array.
    `;

    // Create user prompt with details
    const userPrompt = `Based on these user details, recommend the most suitable government schemes:\n${JSON.stringify(userDetails, null, 2)}`;

    // Make the Azure OpenAI API call
    const endpoint = `${OPENAI_API_BASE}openai/deployments/${OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=${OPENAI_API_VERSION}`;
    
    const response = await axios.post(
      endpoint,
      {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 2000,
        temperature: 0.3,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': OPENAI_API_KEY,
        },
      }
    );


    const suggestions = response.data.choices[0].message.content;
    
    try {
      // Clean up the response to handle potential JSON formatting issues
      let cleanedJson = suggestions.trim();
      
      // Try to fix common JSON formatting issues
      if (!cleanedJson.startsWith('[')) {
        // Find the first occurrence of '['
        const startIndex = cleanedJson.indexOf('[');
        if (startIndex !== -1) {
          cleanedJson = cleanedJson.substring(startIndex);
        }
      }
      
      // Ensure it ends with ']'
      if (!cleanedJson.endsWith(']')) {
        const endIndex = cleanedJson.lastIndexOf(']');
        if (endIndex !== -1) {
          cleanedJson = cleanedJson.substring(0, endIndex + 1);
        }
      }
      
      // Parse the cleaned JSON
      const schemes = JSON.parse(cleanedJson);
      res.json(schemes);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', suggestions);
      res.status(500).json({ error: 'AI response was not in valid JSON format' });
    }
  } catch (error) {
    console.error('Error generating schemes:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to generate schemes', 
      details: error.response?.data?.error?.message || error.message
    });
  }
});
