const multer = require("multer");
const path = require("path");
const fs = require("fs");


const uploadPath = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const name = path.parse(file.originalname).name.replace(/\s+/g, "-"); 
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    cb(null, `${name}-${timestamp}${ext}`);
  }
});


const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = allowedTypes.test(file.mimetype);

  if (mime && allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpg, .jpeg, .png, or .webp image files are allowed"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: fileFilter
});

module.exports = upload;
