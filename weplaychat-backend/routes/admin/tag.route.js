const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");
const TagController = require("../../controllers/admin/tag.controller");

const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });
const normalizeStoragePath = require("../../util/normalizeStoragePath");

// Create tag
route.post(
  "/createTag",
  checkAccessWithSecretKey(),
  upload.single("file"),
  normalizeStoragePath,
  TagController.createTag
);

// Update tag
route.patch(
  "/updateTag",
  checkAccessWithSecretKey(),
  upload.single("file"),
  normalizeStoragePath,
  TagController.updateTag
);

// List tags
route.get("/listTags", checkAccessWithSecretKey(), TagController.listTags);

// Delete tag
route.delete("/deleteTag", checkAccessWithSecretKey(), TagController.deleteTag);

// Toggle tag status
route.patch("/updateTagStatus", checkAccessWithSecretKey(), TagController.updateTagStatus);

module.exports = route;
