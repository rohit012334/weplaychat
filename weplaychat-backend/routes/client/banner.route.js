//express
const express = require("express");
const route = express.Router();

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../checkAccess");

//validate user's access token
const validateUserToken = require("../../middleware/validateUserToken.middleware");
const verifyAdminAuthToken = require("../../middleware/verifyAdminAuthToken.middleware");

//controller
const BannerController = require("../../controllers/client/banner.controller");

//create banner (image upload optional)
route.post(
  "/createBanner",
  verifyAdminAuthToken,
  checkAccessWithSecretKey(),
  upload.single("image"),
  BannerController.createBanner
);

//modify banner
route.patch(
  "/modifyBanner",
  verifyAdminAuthToken,
  checkAccessWithSecretKey(),
  upload.single("image"),
  BannerController.updateBanner
);

//update active status
route.patch(
  "/updateBannerStatus",
  verifyAdminAuthToken,
  checkAccessWithSecretKey(),
  BannerController.updateBannerStatus
);

//get list (admin only)
route.get(
  "/listBanner",
  verifyAdminAuthToken,
  checkAccessWithSecretKey(),
  BannerController.getAllBanners
);

//get active banners (no token required for listing in app)
route.get(
  "/fetchBannerList",
  validateUserToken,
  checkAccessWithSecretKey(),
  BannerController.fetchBannerList
);

//get single details
route.get(
  "/getBanner",
  validateUserToken,
  checkAccessWithSecretKey(),
  BannerController.getBannerDetails
);

//delete banner
route.delete(
  "/deleteBanner",
  verifyAdminAuthToken,
  checkAccessWithSecretKey(),
  BannerController.deleteBanner
);

module.exports = route;
