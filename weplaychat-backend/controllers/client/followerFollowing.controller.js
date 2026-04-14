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
 */
const resolveTarget = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const objectId = new mongoose.Types.ObjectId(id);

  const user = await User.findById(objectId).select("_id name image isBlock fcmToken").lean();
  if (user) return { target: user, model: "User" };

  const host = await Host.findById(objectId).select("_id name image isBlock fcmToken userId").lean();
  if (host) return { target: host, model: "Host" };

  return null;
};

// ─────────────────────────────────────────────
// USER → FOLLOW / UNFOLLOW
// Requires: Token
// Query: id
// ─────────────────────────────────────────────
exports.handleFollowUnfollow = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) return res.status(401).json({ status: false, message: "Unauthorized." });

    const { id } = req.query;
    if (!id) return res.status(200).json({ status: false, message: "id is required." });

    const resolved = await resolveTarget(id);
    if (!resolved) return res.status(200).json({ status: false, message: "Target not found." });

    const { target, model } = resolved;
    const followerObjectId = new mongoose.Types.ObjectId(req.user.userId);
    const followingObjectId = target._id;

    if (followerObjectId.equals(followingObjectId)) return res.status(200).json({ status: false, message: "You can't follow yourself." });

    const existingFollow = await FollowerFollowing.findOne({ followerId: followerObjectId, followingId: followingObjectId });

    if (existingFollow) {
      await FollowerFollowing.deleteOne({ _id: existingFollow._id });
      return res.status(200).json({ status: true, message: "Unfollowed successfully.", isFollow: false, isFriend: false });
    } else {
      await new FollowerFollowing({ followerId: followerObjectId, followerModel: "User", followingId: followingObjectId, followingModel: model }).save();

      // Check for mutual follow (Friendship)
      const isMutual = await FollowerFollowing.findOne({ followerId: followingObjectId, followingId: followerObjectId });

      res.status(200).json({ status: true, message: "Followed successfully.", isFollow: true, isFriend: !!isMutual });

      if (target.fcmToken) {
        try {
          const payload = {
            token: target.fcmToken,
            data: { 
              title: isMutual ? "🤝 New Friend!" : "🌟 New Follower!", 
              body: isMutual ? `You and ${target.name} are now friends!` : "Someone just followed you!", 
              type: isMutual ? "FRIEND" : "FOLLOW" 
            },
          };
          const adminPromise = await admin();
          adminPromise.messaging().send(payload).catch(console.error);
        } catch (fcmError) {
          console.error("FCM Send Error:", fcmError);
        }
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────────
// HOST → FOLLOW / UNFOLLOW (No Token, Host ID based)
// Query: hostId (Follower), followingId (Target)
// ─────────────────────────────────────────────
exports.handleHostFollowUnfollow = async (req, res) => {
  try {
    const { hostId, followingId } = req.query;

    if (!hostId || !followingId) return res.status(200).json({ status: false, message: "hostId and followingId required." });

    const fromHost = await Host.findById(hostId).select("_id name").lean();
    if (!fromHost) return res.status(200).json({ status: false, message: "Follower host not found." });

    const resolvedTarget = await resolveTarget(followingId);
    if (!resolvedTarget) return res.status(200).json({ status: false, message: "Target not found." });

    const { target, model } = resolvedTarget;

    const existingFollow = await FollowerFollowing.findOne({ followerId: fromHost._id, followingId: target._id });

    if (existingFollow) {
      await FollowerFollowing.deleteOne({ _id: existingFollow._id });
      return res.status(200).json({ status: true, message: "Unfollowed successfully.", isFollow: false, isFriend: false });
    } else {
      await new FollowerFollowing({ followerId: fromHost._id, followerModel: "Host", followingId: target._id, followingModel: model }).save();

      // Check for mutual follow
      const isMutual = await FollowerFollowing.findOne({ followerId: target._id, followingId: fromHost._id });

      res.status(200).json({ status: true, message: "Followed successfully.", isFollow: true, isFriend: !!isMutual });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────────
// GET FOLLOWER LIST (Smart Resolver)
// ─────────────────────────────────────────────
exports.getFollowerList = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(200).json({ status: false, message: "id required." });

    const resolved = await resolveTarget(id);
    if (!resolved) return res.status(200).json({ status: false, message: "Target not found." });

    const followerList = await FollowerFollowing.find({ followingId: resolved.target._id })
      .populate("followerId", "_id name image")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ status: true, message: "Retrieved followers.", totalFollowers: followerList.length, followerList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────────
// GET FOLLOWING LIST (Smart Resolver)
// ─────────────────────────────────────────────
exports.getFollowingList = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(200).json({ status: false, message: "id required." });

    const resolved = await resolveTarget(id);
    if (!resolved) return res.status(200).json({ status: false, message: "Target not found." });

    const followingList = await FollowerFollowing.find({ followerId: resolved.target._id })
      .populate("followingId", "_id name image")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ status: true, message: "Retrieved following.", totalFollowing: followingList.length, followingList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────────
// GET FRIENDS LIST (Mutual Follows)
// ─────────────────────────────────────────────
exports.getFriendsList = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(200).json({ status: false, message: "id required." });

    const resolved = await resolveTarget(id);
    if (!resolved) return res.status(200).json({ status: false, message: "Target not found." });

    const userId = resolved.target._id;

    // 1. Find everyone this user follows
    const myFollowings = await FollowerFollowing.find({ followerId: userId }).select("followingId").lean();
    const followingIds = myFollowings.map(f => f.followingId);

    // 2. Find mutual follows: People from followingIds who also follow userId
    const friendsList = await FollowerFollowing.find({ 
      followerId: { $in: followingIds },
      followingId: userId 
    })
    .populate("followerId", "_id name image gender isOnline") // This is the friend
    .sort({ createdAt: -1 })
    .lean();

    const friends = friendsList.map(f => f.followerId);

    res.status(200).json({ status: true, message: "Retrieved friends list.", totalFriends: friends.length, friends });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────────
// CHECK FOLLOW STATUS (Smart Resolver)
// ─────────────────────────────────────────────
exports.getFollowStatus = async (req, res) => {
  try {
    const { id, hostId } = req.query;
    if (!id) return res.status(200).json({ status: false, message: "Target id required." });

    let myId;
    if (hostId) {
      myId = new mongoose.Types.ObjectId(hostId);
    } else {
      if (!req.user || !req.user.userId) return res.status(401).json({ status: false, message: "Unauthorized." });
      myId = new mongoose.Types.ObjectId(req.user.userId);
    }

    const target = await resolveTarget(id);
    if (!target) return res.status(200).json({ status: false, message: "Target not found." });

    const existingFollow = await FollowerFollowing.findOne({ followerId: myId, followingId: target.target._id });
    
    // Check if friends (mutual)
    let isFriend = false;
    if (existingFollow) {
      const mutual = await FollowerFollowing.findOne({ followerId: target.target._id, followingId: myId });
      isFriend = !!mutual;
    }

    res.status(200).json({ status: true, message: "Status retrieved.", isFollow: !!existingFollow, isFriend });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};
