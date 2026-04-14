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
  upload.any(),
  normalizeStoragePath,
  LevelController.update
);

// Search user/host by uniqueId
route.get("/search", checkAccessWithSecretKey(), LevelController.searchUser);

// Manual update of levels
route.post("/manualUpdate", checkAccessWithSecretKey(), LevelController.manualUpdate);

module.exports = route;
