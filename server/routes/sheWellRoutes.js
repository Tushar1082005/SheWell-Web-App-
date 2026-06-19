const express = require("express")
const router = express.Router()

const { login, signup, auth, logout } = require("../controllers/Auth")
const { addPeriod, getPeriodData } = require("../controllers/periodTracker")
const { getSymptomHelp } = require("../controllers/periodHelp")

// Login and Signup:
router.post("/login", login)
router.post("/signup", signup)
router.get("/auth", auth)
router.post("/logout", logout);

// period tracking:
router.post("/add-period", addPeriod)
router.get("/get-period-data/:userId", getPeriodData)

// period help:
router.get("/get-symptom-help/:symptom", getSymptomHelp)

module.exports = router

