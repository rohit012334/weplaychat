//express
const express = require("express");
const route = express.Router();

//validate reseller's access token
const validateResellerToken = require("../../middleware/validateResellerToken.middleware");

//require reseller's route.js
const reseller = require("./reseller.route");

//exports reseller's route.js
route.use("/", validateResellerToken, reseller);

module.exports = route;