const fs = require("fs");
const path = require("path");

const PRIMARY_STORAGE_DIR = path.join(__dirname, "..", "storage");
const LEGACY_STORAGE_DIR = path.join(process.cwd(), "storage");

function getStorageFileName(filePath) {
  if (!filePath || typeof filePath !== "string") return "";
  return path.basename(filePath.replace(/\\/g, "/").trim());
}

function resolveStorageAbsolutePath(filePath) {
  if (!filePath || typeof filePath !== "string") return "";

  // For old DB values which stored absolute path directly.
  if (path.isAbsolute(filePath) && fs.existsSync(filePath)) {
    return filePath;
  }

  const fileName = getStorageFileName(filePath);
  if (!fileName) return "";

  const candidates = [
    path.join(PRIMARY_STORAGE_DIR, fileName),
    path.join(LEGACY_STORAGE_DIR, fileName),
  ];

  const found = candidates.find((candidate) => fs.existsSync(candidate));
  return found || candidates[0];
}

module.exports = {
  PRIMARY_STORAGE_DIR,
  LEGACY_STORAGE_DIR,
  resolveStorageAbsolutePath,
};
