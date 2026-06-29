const mongoose = require("mongoose");
const { setServers } = require("node:dns/promises");
setServers(["1.1.1.1", "8.8.8.8"]);

const connectdb = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://poonia22704_db_user:admin@firstproject.urna8iv.mongodb.net/backendmain?appName=FirstProject",
    );
    console.log(" Database connected");
  } catch (error) {
    console.log("error database not connected", error);
  }
};

module.exports = connectdb;
