const mongoose = require('mongoose');

exports.dbConnect = () => {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error("DATABASE_URL environment variable is not set.");
        return;
    }

    mongoose.connect(dbUrl)
        .then(() => {
            console.log("Database connected successfully.");
        })
        .catch((error) => {
            console.error("Database connection failed:", error);
        });
};