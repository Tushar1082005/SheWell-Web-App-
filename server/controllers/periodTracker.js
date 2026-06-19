const User = require("../models/User");
const Period = require("../models/Period");
const sendEmail = require('./sendEmail');

exports.addPeriod = async (req, res) => {
  try {
    const { userId, startDate, cycleLength, periodLength, symptoms, notes } = req.body;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create new period entry
    const newPeriod = new Period({
      userId,
      startDate,
      cycleLength,
      periodLength,
      symptoms,
      notes
    });

    await newPeriod.save();

    // Update user schema to add the period reference
    user.periods.push(newPeriod._id);
    await user.save();

    // Schedule period reminder emails
    const predictedStartDate = new Date(startDate);
    predictedStartDate.setDate(predictedStartDate.getDate() + cycleLength);
    schedulePeriodEmails(user.email, predictedStartDate);

    res.status(201).json({
      message: "Period data saved successfully",
      newPeriod,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

function schedulePeriodEmails(userEmail, predictedStartDate) {
    const twoDaysBefore = new Date(predictedStartDate);
    twoDaysBefore.setDate(twoDaysBefore.getDate() - 2);

    const fiveDaysFromStart = new Date(predictedStartDate);
    fiveDaysFromStart.setDate(fiveDaysFromStart.getDate() + 5);

    const now = new Date();

    if (now >= twoDaysBefore && now <= predictedStartDate) {
        sendEmail(userEmail, 'Friendly Reminder: Your Period is Approaching! 🌸',
           `Your period is expected within 2 days—stay prepared with these quick tips:

✔ Carry pads/tampons & wear dark-colored clothes to avoid stains.
✔ Stay hydrated & eat iron-rich foods to maintain energy.
✔ Do light yoga/stretching to ease cramps.
✔ Use warm compresses or mild pain relievers if needed.
✔ Listen to your body & rest when necessary.

For any concerns, consult experts via SheWell. Stay healthy! 💖

- The SheWell Team`);
    }

    if (now >= predictedStartDate && now <= fiveDaysFromStart) {
        sendEmail(userEmail, 'Friendly Reminder: Your Periods have started! 🌸', `Your periods have started—stay prepared with these quick tips:

✔ Carry pads/tampons & wear dark-colored clothes to avoid stains.
✔ Stay hydrated & eat iron-rich foods to maintain energy.
✔ Do light yoga/stretching to ease cramps.
✔ Use warm compresses or mild pain relievers if needed.
✔ Listen to your body & rest when necessary.

For any concerns, consult experts via SheWell. Stay healthy! 💖

- The SheWell Team`);
    }
}


exports.getPeriodData = async (req, res) => {
  try {
    const userId = req.params.userId;
    const periods = await Period.find({ userId })
      .sort({ startDate: -1 })
      .limit(3);
    res.status(200).json(periods);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
