const express = require("express");
const route = express.Router();
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });
const normalizeStoragePath = require("../../util/normalizeStoragePath");
const checkAccessWithSecretKey = require("../../checkAccess");

const LevelController = require("../../controllers/admin/level.controller");

// Get all levels
route.get("/", checkAccessWithSecretKey(), LevelController.index);

// Update level
route.patch(
  "/update",
  checkAccessWithSecretKey(),
  upload.fields([
    { name: "userImage", maxCount: 1 },
    { name: "hostImage", maxCount: 1 },
  ]),
  normalizeStoragePath,
  LevelController.update
);

// Initialize levels
route.post("/init", checkAccessWithSecretKey(), LevelController.initialize);

module.exports = route;
