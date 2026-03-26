const FollowerFollowing = require("../../models/followerFollowing.model");

//import model
const User = require("../../models/user.model");
const Host = require("../../models/host.model");

//mongoose
const mongoose = require("mongoose");

/**
 * 🕵️ SMART ID RESOLVER (Internal)
 */
const resolveTarget = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;

  const objectId = new mongoose.Types.ObjectId(id);

  const user = await User.findById(objectId).select("_id").lean();
  if (user) return { id: user._id, type: "User" };

  const host = await Host.findById(objectId).select("_id").lean();
  if (host) return { id: host._id, type: "Host" };

  return null;
};

// ─────────────────────────────────────────────
// FETCH FOLLOWING (Admin Panel)
// Query: id (User ID ya Host ID), start, limit
// ─────────────────────────────────────────────
exports.fetchFollowing = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) return res.status(200).json({ status: false, message: "id is required." });

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    const resolved = await resolveTarget(id);
    if (!resolved) return res.status(200).json({ status: false, message: "Target not found." });

    const [total, followingList] = await Promise.all([
      FollowerFollowing.countDocuments({ followerId: resolved.id }),
      FollowerFollowing.find({ followerId: resolved.id })
        .populate("followingId", "_id name image uniqueId coin countryFlagImage country")
        .sort({ createdAt: -1 })
        .skip((start - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return res.status(200).json({
      status: true,
      message: "Retrieved following list successfully.",
      total,
      followingList,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────────
// FETCH FOLLOWERS (Admin Panel)
// Query: id (User ID ya Host ID), start, limit
// ─────────────────────────────────────────────
exports.fetchFollowers = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) return res.status(200).json({ status: false, message: "id is required." });

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    const resolved = await resolveTarget(id);
    if (!resolved) return res.status(200).json({ status: false, message: "Target not found." });

    const [total, followerList] = await Promise.all([
      FollowerFollowing.countDocuments({ followingId: resolved.id }),
      FollowerFollowing.find({ followingId: resolved.id })
        .populate("followerId", "_id name image uniqueId coin countryFlagImage country")
        .sort({ createdAt: -1 })
        .skip((start - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    res.status(200).json({
      status: true,
      message: "Retrieved follower list successfully.",
      total,
      followerList,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};
