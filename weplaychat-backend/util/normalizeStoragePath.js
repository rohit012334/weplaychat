const path = require("path");

/**
 * Normalize req.file and req.files paths to web-usable paths (/storage/filename).
 * Multer saves to an absolute dir (e.g. /app/weplaychat-backend/storage/), so
 * req.file.path is absolute. We store only /storage/filename in DB so frontend
 * can do baseURL + path and GET /storage/filename works.
 */
function normalizeStoragePath(req, res, next) {
  if (req.file && req.file.path) {
    req.file.path = "storage/" + path.basename(req.file.path);
  }
  
  if (req.files) {
    if (Array.isArray(req.files)) {
      // Handle array of files (e.g. from upload.any())
      req.files.forEach((f) => {
        if (f && f.path) f.path = "storage/" + path.basename(f.path);
      });
    } else if (typeof req.files === "object") {
      // Handle object of files (e.g. from upload.fields())
      Object.keys(req.files).forEach((key) => {
        const list = Array.isArray(req.files[key]) ? req.files[key] : [req.files[key]];
        list.forEach((f) => {
          if (f && f.path) f.path = "storage/" + path.basename(f.path);
        });
      });
    }
  }
  next();
}

module.exports = normalizeStoragePath;
