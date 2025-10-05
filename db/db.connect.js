const mongoose = require("mongoose");
require("dotenv").config();

const mongoUri = process.env.MONGODB;

const initializeDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    console.log("Already connected to Database");
    return;
  }

  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds
    });
    console.log("Connected to Database Successfully");
  } catch (err) {
    console.error("DB connection error:", err);

    // Retry connection after 5 seconds
    console.log("Retrying database connection in 5 seconds...");
    setTimeout(initializeDatabase, 5000);
  }
};

module.exports = { initializeDatabase };
