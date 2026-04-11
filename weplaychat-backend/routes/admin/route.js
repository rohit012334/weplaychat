//express
const express = require("express");
const route = express.Router();

//validate admin's access token
const validateAdminToken = require("../../middleware/verifyAdminAuthToken.middleware");

//require admin's route.js
const admin = require("./admin.route");
const setting = require("./setting.route");
const impression = require("./impression.route");
const giftCategory = require("./giftCategory.route");
const gift = require("./gift.route");
const vipPlanPrivilege = require("./vipPlanPrivilege.route");
const host = require("./host.route");
const dashboard = require("./dashboard.route");
const agency = require("./agency.route");
const block = require("./block.route");
const user = require("./user.route");
const followerFollowing = require("./followerFollowing.route");
const coinPlan = require("./coinPlan.route");
const vipPlan = require("./vipPlan.route");
const identityProof = require("./identityProof.route");
const paymentMethod = require("./paymentMethod.route");
const history = require("./history.route");
const dailyRewardCoin = require("./dailyRewardCoin.route");
const liveBroadcastHistory = require("./liveBroadcastHistory.route");
const currency = require("./currency.route");
const withdrawalRequest = require("./withdrawalRequest.route");
const notification = require("./notification.route");
const message = require("./message.route");
const login = require("./login.route");
const subadmin = require("./subadmin.route");
const manager = require("./manager.route");
const reseller = require("./reseller.route");
const frame = require("./frame.route");
const entry = require("./entry.route");
const tag = require("./tag.route");
const event = require("./event.route");
const spinWheel = require("./spinWheel.route");
const background = require("./background.route");
const entryTag = require("./entryTag.route");
const level = require("./level.route");

//exports admin's route.js
route.use("/admin", admin);
route.use("/sub-admin", validateAdminToken, subadmin);
route.use("/setting", validateAdminToken, setting);
route.use("/impression", validateAdminToken, impression);
route.use("/giftCategory", validateAdminToken, giftCategory);
route.use("/gift", validateAdminToken, gift);
route.use("/vipPlanPrivilege", validateAdminToken, vipPlanPrivilege);
route.use("/host", validateAdminToken, host);
route.use("/dashboard", validateAdminToken, dashboard);
route.use("/agency", validateAdminToken, agency);
route.use("/block", validateAdminToken, block);
route.use("/user", validateAdminToken, user);
route.use("/followerFollowing", validateAdminToken, followerFollowing);
route.use("/coinPlan", validateAdminToken, coinPlan);
route.use("/vipPlan", validateAdminToken, vipPlan);
route.use("/identityProof", validateAdminToken, identityProof);
route.use("/paymentMethod", validateAdminToken, paymentMethod);
route.use("/history", validateAdminToken, history);
route.use("/dailyRewardCoin", validateAdminToken, dailyRewardCoin);
route.use("/liveBroadcastHistory", validateAdminToken, liveBroadcastHistory);
route.use("/currency", validateAdminToken, currency);
route.use("/withdrawalRequest", validateAdminToken, withdrawalRequest);
route.use("/notification", validateAdminToken, notification);
route.use("/frame", validateAdminToken, frame);
route.use("/entry", validateAdminToken, entry);
route.use("/tag", validateAdminToken, tag);
route.use("/event", validateAdminToken, event);
route.use("/spinWheel", validateAdminToken, spinWheel);
route.use("/background", validateAdminToken, background);
route.use("/entryTag", validateAdminToken, entryTag);
route.use("/level", validateAdminToken, level);
route.use("/message", message);
route.use("/login", login);
route.use("/manager", manager);
route.use("/reseller", reseller);

module.exports = route;
