require("dotenv").config();

const express = require("express");
const connectdb = require("./db");
const { globalErrorHandler } = require("./src/utils/errorHandler");

// ============ ROUTE IMPORTS ============
const userRoute = require("./src/Routes/userRoute");
const nodemailerRoute = require("./src/Routes/nodemailerRoute");
const emailOtpRoute = require("./src/Routes/emailOtpRoute");
const uploadsRoute = require("./src/Routes/uploadsRoute");
const cloudinaryRoute = require("./src/Routes/cloudinaryRoute");
const authRoute = require("./src/Routes/authRoute");
const adminRoute = require("./src/Routes/adminRoute");
const forgetpasswordRoute = require("./src/Routes/forgetpasswordRoute");
const refreshTokenRouter = require("./src/Routes/refreshTokenRoute");

const app = express();
const PORT = process.env.PORT || 3000;

// ============ DATABASE CONNECTION ============
connectdb();

// ============ MIDDLEWARE ============
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ============ REQUEST LOGGING (Optional) ============
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// ============ ROUTES ============
app.use("/api", userRoute);
app.use("/api", nodemailerRoute);
app.use("/api", emailOtpRoute);
app.use("/api", uploadsRoute);
app.use("/api", cloudinaryRoute);
app.use("/api", authRoute);
app.use("/api", adminRoute);
app.use("/api", forgetpasswordRoute);
app.use("/api", refreshTokenRouter);

// ============ HEALTH CHECK ENDPOINT ============
app.get("/", (req, res) => {
  res.json({ success: true, message: "API is running" });
});

// ============ 404 HANDLER ============
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

// ============ GLOBAL ERROR HANDLER ============
app.use(globalErrorHandler);

// ============ SERVER START ============
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
