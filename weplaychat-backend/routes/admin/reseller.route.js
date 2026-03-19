//express
const express = require("express");
const route = express.Router();

const validateAdminToken = require("../../middleware/verifyAdminAuthToken.middleware");

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../checkAccess");

//controller
const ResellerController = require("../../controllers/admin/reseller.controller");

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const validateResellerFirebaseToken = require("../../middleware/validateResellerToken.middleware");
const upload = multer({ storage });
const normalizeStoragePath = require("../../util/normalizeStoragePath");

//create agency
route.post("/createReseller", validateAdminToken, checkAccessWithSecretKey(), upload.fields([
  { name: "image", maxCount: 1 },
  { name: "nationalIdFront", maxCount: 1 },
  { name: "nationalIdBack", maxCount: 1 },
]), normalizeStoragePath, ResellerController.createReseller);

route.post("/validateResellerLogin",checkAccessWithSecretKey(), ResellerController.validateResellerLogin);

// --------- reseller recharge endpoints ----------
route.post("/findUser",validateResellerFirebaseToken, checkAccessWithSecretKey(), ResellerController.findUser);
route.post("/recharge",validateResellerFirebaseToken, checkAccessWithSecretKey(), ResellerController.recharge);
route.get("/rechargeHistory",validateResellerFirebaseToken, checkAccessWithSecretKey(), ResellerController.getRechargeHistory);
route.get("/rechargeAnalytics", validateResellerFirebaseToken, checkAccessWithSecretKey(), ResellerController.getRechargeAnalytics);


route.get("/getList",validateAdminToken, checkAccessWithSecretKey(), ResellerController.getResellerList);

route.get("/getById/:id", checkAccessWithSecretKey(), ResellerController.getResellerById);

route.delete("/deleteReseller/:id",validateAdminToken, checkAccessWithSecretKey(), ResellerController.deleteReseller);

route.put("/updateReseller/:id",validateAdminToken, checkAccessWithSecretKey(), ResellerController.updateResellerPasswordById);


module.exports = route;
