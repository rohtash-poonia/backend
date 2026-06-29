const mongoose = require("mongoose")

const Users = new mongoose.Schema({
  name: String,
  email: String,
  number: String,
});

module.exports = mongoose.model("allUser", Users);