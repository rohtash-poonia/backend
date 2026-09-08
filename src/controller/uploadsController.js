const uploadsLogic = (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }
  const data = {
    filename: req.file.filename,
    path: req.file.path,
    size: req.file.size,
  };
  res.status(200).json({
    success: true,
    message: "File uploaded successfully",
    data: data,
  });
};

//also use for whole data
//(req, res) => {
// const data = req.filepath
//res.send({ message: "file uploaded sucessfully",data});

module.exports = uploadsLogic;
