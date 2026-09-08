const cloudlogic = async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    res.status(200).json({
      success: true,
      message: "File uploaded to Cloudinary successfully",
      data: {
        url: req.file.path,
        publicId: req.file.filename || req.file.public_id,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Cloudinary upload failed",
      error: error.message,
    });
  }
};

module.exports = cloudlogic;
