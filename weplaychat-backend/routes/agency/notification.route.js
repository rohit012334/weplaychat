//express
const express = require("express");
const route = express.Router();

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../checkAccess");

//controller
const NotificationController = require("../../controllers/agency/notification.controller");

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });
const normalizeStoragePath = require("../../util/normalizeStoragePath");

//sending a notification from agency to a specific host
route.post("/notifyHost", checkAccessWithSecretKey(), upload.single("image"), normalizeStoragePath, NotificationController.notifyHost);

//sending a notification from admin to hosts
route.post("/sendBulkHostNotifications", checkAccessWithSecretKey(), upload.single("image"), normalizeStoragePath, NotificationController.sendBulkHostNotifications);

module.exports = route;
