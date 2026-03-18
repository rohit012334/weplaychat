const express = require("express");
const route = express.Router();

//validate user's access token
const validateUserToken = require("../../middleware/validateUserToken.middleware");

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../checkAccess");

const SpinController = require("../../controllers/client/spin.controller");

route.get("/status", validateUserToken, checkAccessWithSecretKey(), SpinController.getSpinStatus);
route.post("/play", validateUserToken, checkAccessWithSecretKey(), SpinController.playSpin);

module.exports = route;

