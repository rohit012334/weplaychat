const express = require("express");
const route = express.Router();
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });
const normalizeStoragePath = require("../../util/normalizeStoragePath");
const checkAccessWithSecretKey = require("../../checkAccess");
const EntryTagController = require("../../controllers/admin/entryTag.controller");

route.post("/create", checkAccessWithSecretKey(), upload.single("file"), normalizeStoragePath, EntryTagController.createEntryTag);
route.patch("/update", checkAccessWithSecretKey(), upload.single("file"), normalizeStoragePath, EntryTagController.updateEntryTag);
route.get("/list", checkAccessWithSecretKey(), EntryTagController.listEntryTags);
route.delete("/delete", checkAccessWithSecretKey(), EntryTagController.deleteEntryTag);
route.patch("/updateStatus", checkAccessWithSecretKey(), EntryTagController.updateEntryTagStatus);

module.exports = route;
