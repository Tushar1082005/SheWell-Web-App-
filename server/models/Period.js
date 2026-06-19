const mongoose = require("mongoose");

const PeriodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  startDate: {
    type: Date,
    required: true,
  },
  cycleLength: { type: Number, default: 28 },
  periodLength: { type: Number, default: 5 },
  symptoms: { type: [String], default: [] },
  notes: { type: String, default: "" },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Period", PeriodSchema);
