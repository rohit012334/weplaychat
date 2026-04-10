const express = require("express");
const route = express.Router();

const StoreController = require("../../controllers/client/store.controller");
const validateUserToken = require("../../middleware/validateUserToken.middleware");

// Get all store items
route.get("/getStoreItems", validateUserToken, StoreController.getStoreItems);

module.exports = route;
