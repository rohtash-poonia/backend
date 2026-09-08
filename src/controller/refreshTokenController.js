require("dotenv").config();

const jwt = require("jsonwebtoken");

const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    /* refresh toke ko verify karta hai 
       const decoded = jwt.verify({id:user._id,email:user.email,role:user.role}) */
    const decoded = jwt.verify( token, process.env.JWT_REFRESH_SECRET || "refreshSecretkey",
    );


    /* new token generate karta hai refresh token se 
    decoded variable se id, email, role lana hai
    const token = jwt.sign({id:decoded._id,email:decoded.email,role:decoded.role}"secretket"{expiresIn:"1"}) */
    const newAccessToken = jwt.sign(
      { id: decoded.id,email:decoded.email,role: decoded.role },
      process.env.JWT_SECRET_KEY || "secretkey",
      { expiresIn: "1d" },
    );

    res.status(200).json({
      success: true,
      message: "Access token generated successfully",
      accessToken: newAccessToken,
      user: {
        id: decoded.id,
        email: decoded.email,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
      error: error.message,
    });
  }
};

module.exports = refreshToken;
