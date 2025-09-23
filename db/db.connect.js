const mongoose = require("mongoose");
require("dotenv").config();

const mongoUri = process.env.MONGODB;

const initializeDatabase = async () => {
    if(mongoose.connection.readyState === 1){
        console.log("Already connected to Database");
        return;
    }

    try {
  await mongoose.connect(mongoUri);
  console.log("Connected to Database Successfully");
} catch (err) {
  console.error("DB connection error:", err);
}

};

module.exports = {initializeDatabase};