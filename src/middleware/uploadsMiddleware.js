const path = require("path");
const multer = require("multer");

const uploadDir = path.join(__dirname, "..", "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const uploads = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("file");

module.exports = uploads;

//also use this line after import midddleware file in route file
// .single("file");

//also we can use
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "src/uploads");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });


