const multer = require("multer");
const fs = require("fs");
const path = require("path");

const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

module.exports = multer.diskStorage({
  filename: (req, file, callback) => {
    const filename = Date.now() + Math.floor(Math.random() * 100) + path.extname(file.originalname);
    callback(null, filename);
  },

  destination: (req, file, callback) => {
    // Same path as express.static in index.js so uploads are served at /storage/...
    const uploadFolder = path.join(__dirname, "..", "storage");
    ensureDirExists(uploadFolder);
    callback(null, uploadFolder);
  },
});
