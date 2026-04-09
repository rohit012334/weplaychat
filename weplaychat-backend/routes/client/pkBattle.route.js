//express
const express = require("express");
const route = express.Router();

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../checkAccess");

//controller
const PKBattleController = require("../../controllers/client/pkBattle.controller");

//validate user's access token
const validateUserToken = require("../../middleware/validateUserToken.middleware");

// ====== INVITATION ROUTES ======
route.post(
  "/invitation/send",
  checkAccessWithSecretKey(),
  validateUserToken,
  PKBattleController.sendInvitation
);

route.get(
  "/invitation/pending",
  checkAccessWithSecretKey(),
  validateUserToken,
  PKBattleController.getPendingInvitations
);

route.post(
  "/invitation/:inviteId/accept",
  checkAccessWithSecretKey(),
  validateUserToken,
  PKBattleController.acceptInvitation
);

route.post(
  "/invitation/:inviteId/reject",
  checkAccessWithSecretKey(),
  validateUserToken,
  PKBattleController.rejectInvitation
);

route.delete(
  "/invitation/:inviteId",
  checkAccessWithSecretKey(),
  validateUserToken,
  PKBattleController.cancelInvitation
);

// ====== RANDOM MATCH ROUTES ======
route.post(
  "/random/join-queue",
  checkAccessWithSecretKey(),
  validateUserToken,
  PKBattleController.joinRandomMatch
);

route.post(
  "/random/:queueId/accept",
  checkAccessWithSecretKey(),
  validateUserToken,
  PKBattleController.acceptRandomMatch
);

route.post(
  "/random/:queueId/reject",
  checkAccessWithSecretKey(),
  validateUserToken,
  PKBattleController.rejectRandomMatch
);

route.delete(
  "/random/leave-queue",
  checkAccessWithSecretKey(),
  validateUserToken,
  PKBattleController.leaveQueue
);

// ====== BATTLE ROUTES ======
route.get(
  "/battle/:battleId",
  checkAccessWithSecretKey(),
  validateUserToken,
  PKBattleController.getBattleDetails
);

route.post(
  "/battle/:battleId/start",
  checkAccessWithSecretKey(),
  validateUserToken,
  PKBattleController.startBattle
);

route.post(
  "/battle/:battleId/end",
  checkAccessWithSecretKey(),
  validateUserToken,
  PKBattleController.endBattle
);

// route.post(
//   "/battle/:battleId/action",
//   checkAccessWithSecretKey(),
//   validateUserToken,
//   PKBattleController.performAction
// );

route.post(
  "/battle/:battleId/gift",
  checkAccessWithSecretKey(),
  validateUserToken,
  PKBattleController.sendGiftDuringBattle
);

// ====== STATS ROUTES ======
route.get(
  "/stats/:hostId",
  checkAccessWithSecretKey(),
  PKBattleController.getHostStats
);

module.exports = route;
