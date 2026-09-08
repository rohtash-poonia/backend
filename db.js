require("dotenv").config();

const mongoose = require("mongoose");
const dns = require("node:dns");
dns.setServers(["1.1.1.1", "1.0.0.1"]);
const connectdb = async () => {
  try {
    const mongoUrl =
      process.env.MONGO_URL || "mongodb://127.0.0.1:27017/bkmain";

    await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    console.log("Database connected");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    console.error("Please check MONGO_URL or start a local MongoDB server.");
  }
};

module.exports = connectdb;
