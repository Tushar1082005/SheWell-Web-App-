const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
  },
  address: { type: String },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
  },
  periods: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Period",
    },
  ],
  isPatient: { type: Boolean, default: false },
  associatedDoctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }],
  medicalHistory: { type: String },
  lastVisit: { type: Date },
  symptoms: { type: [String], default: [] },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  token: {
    type: String,
  },
});

module.exports = mongoose.model("User", userSchema);
