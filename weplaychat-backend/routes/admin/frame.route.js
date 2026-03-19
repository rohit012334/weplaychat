const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");
const FrameController = require("../../controllers/admin/frame.controller");

const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });
const normalizeStoragePath = require("../../util/normalizeStoragePath");

// Create frame
route.post(
    "/createFrame",
    checkAccessWithSecretKey(),
    upload.single("file"),
    normalizeStoragePath,
    FrameController.createFrame
);

// Update frame
route.patch(
    "/updateFrame",
    checkAccessWithSecretKey(),
    upload.single("file"),
    normalizeStoragePath,
    FrameController.updateFrame
);

// List frames
route.get("/listFrames", checkAccessWithSecretKey(), FrameController.listFrames);

// Delete frame
route.delete("/deleteFrame", checkAccessWithSecretKey(), FrameController.deleteFrame);

// Toggle frame status
route.patch("/updateFrameStatus", checkAccessWithSecretKey(), FrameController.updateFrameStatus);

module.exports = route;
