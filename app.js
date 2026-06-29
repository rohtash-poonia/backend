const express = require("express");
const app = express();
const { GetUsers, PostUsers } = require("./src/controller/userController");
const userRoute = require("./src/Routes/userRoute");
const nodemailerRoute = require("./src/Routes/nodemailerRoute");
const emailOtpRoute = require("./src/Routes/emailOtpRoute");
const connectdb = require("./db");

const PORT = 3000;
connectdb();
app.use(express.json());
app.use("/api", userRoute);
app.use("/api", nodemailerRoute);
app.use("/api", emailOtpRoute);

app.listen(PORT, () => {
  console.log("server running on port 3000");
});
