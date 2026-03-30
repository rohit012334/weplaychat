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
const ChatController = require("../../controllers/client/chat.controller");

//validate user's access token
const validateUserToken = require("../../middleware/validateUserToken.middleware");

//send message ( image or audio ) ( unified for all roles )
route.post(
  "/pushChatMessage",
  validateUserToken,
  checkAccessWithSecretKey(),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  normalizeStoragePath,
  ChatController.pushChatMessage
);

//get old chat ( unified for all roles )
route.get("/fetchChatHistory", validateUserToken, checkAccessWithSecretKey(), ChatController.fetchChatHistory);

// Aliases for legacy support ( both point to unified functions )
route.post(
  "/submitChatMessage",
  validateUserToken,
  checkAccessWithSecretKey(),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  normalizeStoragePath,
  ChatController.pushChatMessage
);
route.get("/retrieveChatHistory", validateUserToken, checkAccessWithSecretKey(), ChatController.fetchChatHistory);

module.exports = route;
