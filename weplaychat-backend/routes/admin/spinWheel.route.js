const express = require("express");
const route = express.Router();

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../checkAccess");

const SpinWheelController = require("../../controllers/admin/spinWheel.controller");

route.get("/get", checkAccessWithSecretKey(), SpinWheelController.getSpinWheel);
route.patch("/update", checkAccessWithSecretKey(), SpinWheelController.updateSpinWheel);

module.exports = route;

