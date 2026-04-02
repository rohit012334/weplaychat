//express
const express = require("express");
const route = express.Router();

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../checkAccess");

//controller
const FollowerFollowingController = require("../../controllers/client/followerFollowing.controller");

//validate user's access token
const validateUserToken = require("../../middleware/validateUserToken.middleware");

/**
 * 📱 FOLLOW APIs (Instagram-style / Smart Resolver)
 */

// User context follow (id can be UserID or HostID)
route.post("/handleFollowUnfollow", validateUserToken, checkAccessWithSecretKey(), FollowerFollowingController.handleFollowUnfollow);

// Host context follow (no token, consistent with host app)
route.post("/handleHostFollowUnfollow", checkAccessWithSecretKey(), FollowerFollowingController.handleHostFollowUnfollow);

// Public Lists (id can be UserID or HostID)
route.get("/getFollowingList", checkAccessWithSecretKey(), FollowerFollowingController.getFollowingList);
route.get("/getFollowerList", checkAccessWithSecretKey(), FollowerFollowingController.getFollowerList);
route.get("/getFriendsList", checkAccessWithSecretKey(), FollowerFollowingController.getFriendsList);

// Toggle State Check
route.get("/getFollowStatus", checkAccessWithSecretKey(), FollowerFollowingController.getFollowStatus);

module.exports = route;
