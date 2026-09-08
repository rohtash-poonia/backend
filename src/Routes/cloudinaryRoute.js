const express = require("express");
const cloudStorage = require("../middleware/cloudinaryMiddleware");
const cloudlogic = require("../controller/claudinaryController");

const router = express.Router();
router.post("/claudUploads", cloudStorage.single("file"), cloudlogic);
module.exports = router;
