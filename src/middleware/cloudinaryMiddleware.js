const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "backend-main",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ quality: "auto" }],   
  },
});

const cloudStorage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = cloudStorage;
