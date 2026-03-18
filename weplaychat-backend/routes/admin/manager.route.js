//express
const express = require("express");
const route = express.Router();

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../checkAccess");

//controller
const ManagerController = require("../../controllers/admin/manager.controller");

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });

//create agency
route.post("/createManager", checkAccessWithSecretKey(), upload.fields([
  { name: "image", maxCount: 1 },
  { name: "nationalIdFront", maxCount: 1 },
  { name: "nationalIdBack", maxCount: 1 },
]), ManagerController.createManager);

//validate manager login
route.post("/validateManagerLogin", ManagerController.validateManagerLogin);

route.get("/getList", checkAccessWithSecretKey(), ManagerController.getList);

route.get("/getById/:id", checkAccessWithSecretKey(), ManagerController.getById);

route.delete("/deleteManager/:id", checkAccessWithSecretKey(), ManagerController.deleteManager);

route.put("/updatePasswordById/:id", checkAccessWithSecretKey(), ManagerController.updatePasswordById);


module.exports = route;
