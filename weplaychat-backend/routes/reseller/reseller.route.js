//express
const express = require("express");
const route = express.Router();

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../checkAccess");

//controller
const ResellerController = require("../../controllers/admin/reseller.controller");

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });

const validateResellerFirebaseToken = require("../../middleware/validateResellerToken.middleware");

//reseller login (already exists in admin routes)
route.post("/loginReseller", checkAccessWithSecretKey(), ResellerController.validateResellerLogin);

//update reseller profile
route.patch("/modifyReseller", validateResellerFirebaseToken, checkAccessWithSecretKey(), upload.single("image"), ResellerController.modifyReseller);

//get reseller profile
route.get("/getResellerProfile", validateResellerFirebaseToken, checkAccessWithSecretKey(), ResellerController.getResellerProfile);

module.exports = route;