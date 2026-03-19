//express
const express = require("express");
const route = express.Router();

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });
const normalizeStoragePath = require("../../util/normalizeStoragePath");

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../checkAccess");

//controller
const VipPlanPrivilegeController = require("../../controllers/admin/vipPlanPrivilege.controller");

//update VIP Plan Privilege
route.patch("/modifyVipPrivilege", checkAccessWithSecretKey(), upload.single("vipFrameBadge"), normalizeStoragePath, VipPlanPrivilegeController.modifyVipPrivilege);

//get VIP Plan Privilege
route.get("/retrieveVipPrivilege", checkAccessWithSecretKey(), VipPlanPrivilegeController.retrieveVipPrivilege);

module.exports = route;
