const express = require("express");
const route = express.Router();

//Controller
const chatTopicController = require("../../controllers/client/chatTopic.controller");

//validate user's access token
const validateUserToken = require("../../middleware/validateUserToken.middleware");

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../checkAccess");

//get chat thumb list ( unified for all roles )
route.get("/fetchChatList", validateUserToken, checkAccessWithSecretKey(), chatTopicController.fetchChatList);

// Legacy alias
route.get("/retrieveChatList", validateUserToken, checkAccessWithSecretKey(), chatTopicController.fetchChatList);

module.exports = route;
