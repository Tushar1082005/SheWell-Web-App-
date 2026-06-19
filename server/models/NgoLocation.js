// models/NgoLocation.js
const mongoose = require('mongoose');

const NgoLocationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String },
  landmark: { type: String },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NgoLocation', NgoLocationSchema);