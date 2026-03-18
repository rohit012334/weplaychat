const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");
const TagController = require("../../controllers/admin/tag.controller");

// Create tag
route.post("/createTag", checkAccessWithSecretKey(), TagController.createTag);

// Update tag
route.patch("/updateTag", checkAccessWithSecretKey(), TagController.updateTag);

// List tags
route.get("/listTags", checkAccessWithSecretKey(), TagController.listTags);

// Delete tag
route.delete("/deleteTag", checkAccessWithSecretKey(), TagController.deleteTag);

// Toggle tag status
route.patch("/updateTagStatus", checkAccessWithSecretKey(), TagController.updateTagStatus);

module.exports = route;
