const axios = require("axios")

require("dotenv").config()

// Controller to proxy requests to API Ninjas
exports.getSymptomHelp = async (req, res) => {
  try {
    const { symptom } = req.params

    // Log the incoming request
    console.log(`Fetching symptom help for: ${symptom}`)

    // Make request to API Ninjas
    const response = await axios.get(`https://api.api-ninjas.com/v1/symptom?symptom=${encodeURIComponent(symptom)}`, {
      headers: {
        "X-Api-Key": process.env.API_NINJAS_KEY || "JHwd5OBS2tp2P64khNbgsA==YPOIAl27tCSgJArK",
      },
    })

    // Log the response from API Ninjas
    console.log(`API Ninjas response: ${JSON.stringify(response.data)}`)

    // Return the data from API Ninjas
    res.status(200).json(response.data)
  } catch (error) {
    // Log the error details
    console.error("Error fetching symptom data:", error.message)
    console.error("Error details:", error.response ? error.response.data : error)

    res.status(500).json({ error: "Failed to fetch symptom data" })
  }
}