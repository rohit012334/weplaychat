//express
const express = require("express");
const route = express.Router();

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../checkAccess");

// multer (reuse storage util)
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });

//controller
const AdminController = require("../../controllers/admin/admin.controller");

// //update setting
// route.patch("/updateSetting", checkAccessWithSecretKey(), SettingController.updateSetting);

// //update setting switch
// route.patch("/updateSettingToggle", checkAccessWithSecretKey(), SettingController.updateSettingToggle);

//get setting
route.get("/list", checkAccessWithSecretKey(), AdminController.getList);
route.post(
  "/add",
  checkAccessWithSecretKey(),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "nationalIdFront", maxCount: 1 },
    { name: "nationalIdBack", maxCount: 1 },
  ]),
  AdminController.addAdmin
);
route.put("/update/:id", checkAccessWithSecretKey(), AdminController.updatePasswordById);
route.delete("/delete/:id", checkAccessWithSecretKey(), AdminController.deleteAdmin);
route.get("/getById/:id", checkAccessWithSecretKey(), AdminController.getById);

module.exports = route;
