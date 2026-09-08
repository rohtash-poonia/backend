const express = require("express");
const { sendEmail } = require("../controller/nodemailerController");

const router = express.Router();
router.post("/send-email", sendEmail);
module.exports = router;
