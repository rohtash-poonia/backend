const express = require("express");
const uploads = require("../middleware/uploadsMiddleware");
const uploadsLogic = require("../controller/uploadsController");
const router = express.Router();

router.post("/uploads", uploads, uploadsLogic);
module.exports = router;