//express
const express = require("express");
const route = express.Router();

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../checkAccess");

//controller
const FollowerFollowingController = require("../../controllers/client/followerFollowing.controller");

//validate user's access token
const validateUserToken = require("../../middleware/validateUserToken.middleware");

// ─────────────────────────────────────────────
// USER → Follow or Unfollow  (User → User  |  User → Host)
// Requires: Auth token
// Query: followingId, followingType ("user" | "host")
// ─────────────────────────────────────────────
route.post("/handleFollowUnfollow", validateUserToken, checkAccessWithSecretKey(), FollowerFollowingController.handleFollowUnfollow);

// ─────────────────────────────────────────────
// HOST → Follow or Unfollow  (Host → User  |  Host → Host)
// No token — hostId passed directly (consistent with all other host routes)
// Query: hostId, followingId, followingType ("user" | "host")
// ─────────────────────────────────────────────
route.post("/handleHostFollowUnfollow", checkAccessWithSecretKey(), FollowerFollowingController.handleHostFollowUnfollow);

// ─────────────────────────────────────────────
// GET FOLLOWING LIST — Instagram style (public)
// Anyone can see anyone's following list
// Query: userId  OR  hostId
// ─────────────────────────────────────────────
route.get("/getFollowingList", checkAccessWithSecretKey(), FollowerFollowingController.getFollowingList);

// ─────────────────────────────────────────────
// GET FOLLOWER LIST — Instagram style (public)
// Anyone can see anyone's follower list
// Query: userId  OR  hostId
// ─────────────────────────────────────────────
route.get("/getFollowerList", checkAccessWithSecretKey(), FollowerFollowingController.getFollowerList);

// ─────────────────────────────────────────────
// CHECK FOLLOW STATUS
// Query: followingId + (token for user)  OR  followingId + hostId (for host)
// ─────────────────────────────────────────────
route.get("/getFollowStatus", checkAccessWithSecretKey(), FollowerFollowingController.getFollowStatus);

module.exports = route;
