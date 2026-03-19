const express = require("express");
const route = express.Router();
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });
const normalizeStoragePath = require("../../util/normalizeStoragePath");
const checkAccessWithSecretKey = require("../../checkAccess");
const BackgroundController = require("../../controllers/admin/background.controller");

route.post("/createBackground", checkAccessWithSecretKey(), upload.single("file"), normalizeStoragePath, BackgroundController.createBackground);
route.patch("/updateBackground", checkAccessWithSecretKey(), upload.single("file"), normalizeStoragePath, BackgroundController.updateBackground);
route.get("/listBackgrounds", checkAccessWithSecretKey(), BackgroundController.listBackgrounds);
route.delete("/deleteBackground", checkAccessWithSecretKey(), BackgroundController.deleteBackground);
route.patch("/updateBackgroundStatus", checkAccessWithSecretKey(), BackgroundController.updateBackgroundStatus);

module.exports = route;
