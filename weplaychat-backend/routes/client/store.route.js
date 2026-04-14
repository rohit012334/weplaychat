const express = require("express");
const route = express.Router();

const StoreController = require("../../controllers/client/store.controller");
const validateUserToken = require("../../middleware/validateUserToken.middleware");

// Get all store items
route.get("/getStoreItems", StoreController.getStoreItems);

// Store purchase APIs
route.post("/purchaseStoreItem", validateUserToken, StoreController.purchaseStoreItem);

// My Bag and Equip APIs
route.get("/getMyBag", validateUserToken, StoreController.getMyBag);
route.post("/equipStoreItem", validateUserToken, StoreController.equipStoreItem);

module.exports = route;
