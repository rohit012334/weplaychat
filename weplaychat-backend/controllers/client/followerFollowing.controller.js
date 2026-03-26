const FollowerFollowing = require("../../models/followerFollowing.model");

//import model
const User = require("../../models/user.model");
const Host = require("../../models/host.model");
const Block = require("../../models/block.model");

//mongoose
const mongoose = require("mongoose");

//private key
const admin = require("../../util/privateKey");

/**
 * 🕵️ SMART ID RESOLVER
 * Pehle User dhundega, agar nahi mila toh Host dhundega
 */
const resolveTarget = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;

  const objectId = new mongoose.Types.ObjectId(id);

  // 1. Check in User collection
  const user = await User.findById(objectId).select("_id name image isBlock fcmToken").lean();
  if (user) return { target: user, model: "User" };

  // 2. Not found in User? Check in Host collection
  const host = await Host.findById(objectId).select("_id name image isBlock fcmToken userId").lean();
  if (host) return { target: host, model: "Host" };

  return null;
};

// ─────────────────────────────────────────────
// SMART FOLLOW / UNFOLLOW (User or Host)
// Requires: validateUserToken
// Query: id (Target User ID ya Host ID)
// ─────────────────────────────────────────────
exports.handleFollowUnfollow = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ status: false, message: "Unauthorized access. Invalid token." });
    }

    const { id } = req.query;

    if (!id) {
      return res.status(200).json({ status: false, message: "ID is required." });
    }

    // Smartly resolve who we are following
    const resolved = await resolveTarget(id);

    if (!resolved) {
      return res.status(200).json({ status: false, message: "Target User or Host not found." });
    }

    const { target, model } = resolved;
    const followerObjectId = new mongoose.Types.ObjectId(req.user.userId);
    const followingObjectId = target._id;

    if (followerObjectId.equals(followingObjectId)) {
      return res.status(200).json({ status: false, message: "You can't follow your own account." });
    }

    // Check Block Status (if host)
    if (model === "Host") {
      const isBlocked = await Block.findOne({ userId: followerObjectId, hostId: followingObjectId }).select("_id").lean();
      if (isBlocked) {
        return res.status(403).json({ status: false, message: "You have blocked this host. Unblock to follow." });
      }
    }

    if (target.isBlock) {
      return res.status(403).json({ status: false, message: `This ${model} is blocked by admin.` });
    }

    const existingFollow = await FollowerFollowing.findOne({ followerId: followerObjectId, followingId: followingObjectId }).select("_id").lean();

    if (existingFollow) {
      await FollowerFollowing.deleteOne({ followerId: followerObjectId, followingId: followingObjectId });
      return res.status(200).json({ status: true, message: "Unfollowed successfully.", isFollow: false });
    } else {
      await new FollowerFollowing({ followerId: followerObjectId, followingId: followingObjectId, followingModel: model }).save();
      res.status(200).json({ status: true, message: "Followed successfully.", isFollow: true });

      if (target.fcmToken) {
        const payload = {
          token: target.fcmToken,
          data: {
            title: "🌟 New Follower Alert! 👤✨",
            body: "🚀 You've got a new fan! Someone just followed you—check them out now!",
            type: "FOLLOW",
          },
        };
        const adminPromise = await admin;
        adminPromise.messaging().send(payload).catch(console.error);
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────────
// GET FOLLOWER LIST (Smart Resolver)
// Query: id (User ID ya Host ID)
// ─────────────────────────────────────────────
exports.getFollowerList = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(200).json({ status: false, message: "ID is required." });
    }

    const resolved = await resolveTarget(id);
    if (!resolved) {
      return res.status(200).json({ status: false, message: "Target not found." });
    }

    const followerList = await FollowerFollowing.find({ followingId: resolved.target._id })
      .populate("followerId", "_id name image")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      status: true,
      message: "Retrieved follower list successfully.",
      totalFollowers: followerList.length,
      followerList,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────────
// GET FOLLOWING LIST (Smart Resolver)
// Query: id (User ID ya Host ID)
// ─────────────────────────────────────────────
exports.getFollowingList = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(200).json({ status: false, message: "ID is required." });
    }

    const resolved = await resolveTarget(id);
    if (!resolved) {
      return res.status(200).json({ status: false, message: "Target not found." });
    }

    const followingList = await FollowerFollowing.find({ followerId: resolved.target._id })
      .populate("followingId", "_id name image")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      status: true,
      message: "Retrieved following list successfully.",
      totalFollowing: followingList.length,
      followingList,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────────
// CHECK FOLLOW STATUS (Smart Resolver)
// Query: id (Target User/Host), (Optional) followerId
// ─────────────────────────────────────────────
exports.getFollowStatus = async (req, res) => {
  try {
    const { id, followerId } = req.query;

    if (!id) return res.status(200).json({ status: false, message: "Target id is required." });

    let myId;
    if (followerId) {
      myId = new mongoose.Types.ObjectId(followerId);
    } else {
      if (!req.user || !req.user.userId) return res.status(401).json({ status: false, message: "Unauthorized." });
      myId = new mongoose.Types.ObjectId(req.user.userId);
    }

    const target = await resolveTarget(id);
    if (!target) return res.status(200).json({ status: false, message: "Target not found." });

    const existingFollow = await FollowerFollowing.findOne({
      followerId: myId,
      followingId: target.target._id,
    }).select("_id").lean();

    res.status(200).json({
      status: true,
      message: "Follow status retrieved.",
      isFollow: !!existingFollow,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};
