const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");
const EntryController = require("../../controllers/admin/entry.controller");

const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });
const normalizeStoragePath = require("../../util/normalizeStoragePath");

// Create entry
route.post(
    "/createEntry",
    checkAccessWithSecretKey(),
    upload.single("file"),
    normalizeStoragePath,
    EntryController.createEntry
);

// Update entry
route.patch(
    "/updateEntry",
    checkAccessWithSecretKey(),
    upload.single("file"),
    normalizeStoragePath,
    EntryController.updateEntry
);

// List entries
route.get("/listEntries", checkAccessWithSecretKey(), EntryController.listEntries);

// Delete entry
route.delete("/deleteEntry", checkAccessWithSecretKey(), EntryController.deleteEntry);

// Toggle entry status
route.patch("/updateEntryStatus", checkAccessWithSecretKey(), EntryController.updateEntryStatus);

module.exports = route;
