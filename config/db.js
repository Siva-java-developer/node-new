//   # MongoDB connection 
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined");
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log("MongoDB connected successfully");
    console.log("Database:", mongoose.connection.name);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    console.error("Make sure MONGO_URI is set correctly in environment variables");
    process.exit(1);
  }
};

module.exports = connectDB;
