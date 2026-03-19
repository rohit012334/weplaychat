const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");
const EventController = require("../../controllers/admin/event.controller");

const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });
const normalizeStoragePath = require("../../util/normalizeStoragePath");

route.post(
  "/createEvent",
  checkAccessWithSecretKey(),
  upload.single("image"),
  normalizeStoragePath,
  EventController.createEvent
);

route.patch(
  "/updateEvent",
  checkAccessWithSecretKey(),
  upload.single("image"),
  normalizeStoragePath,
  EventController.updateEvent
);

route.get("/listEvents", checkAccessWithSecretKey(), EventController.listEvents);
route.delete("/deleteEvent", checkAccessWithSecretKey(), EventController.deleteEvent);
route.patch("/updateEventStatus", checkAccessWithSecretKey(), EventController.updateEventStatus);

module.exports = route;

