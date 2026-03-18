//express
const express = require("express");
const route = express.Router();

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../checkAccess");

//controller
const LiveBroadcasterController = require("../../controllers/client/liveBroadcaster.controller");

//live host
route.post("/HostStreaming", checkAccessWithSecretKey(), LiveBroadcasterController.HostStreaming);

route.post("/endLive", checkAccessWithSecretKey(), LiveBroadcasterController.endLive);


module.exports = route;
