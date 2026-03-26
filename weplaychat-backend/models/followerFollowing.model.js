const mongoose = require("mongoose");

const followerFollowingSchema = new mongoose.Schema(
  {
    followerId:    { type: mongoose.Schema.Types.ObjectId, refPath: "followerModel", default: null },  // jo follow karta hai (User ya Host)
    followerModel: { type: String, enum: ["User", "Host"], default: "User" },                          // follower ka type
    followingId:   { type: mongoose.Schema.Types.ObjectId, refPath: "followingModel", default: null }, // jise follow kiya (User ya Host)
    followingModel:{ type: String, enum: ["User", "Host"], required: true },                           // following ka type
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for performance
followerFollowingSchema.index({ followerId: 1 });
followerFollowingSchema.index({ followingId: 1 });
followerFollowingSchema.index({ followerModel: 1 });
followerFollowingSchema.index({ followingModel: 1 });
followerFollowingSchema.index({ createdAt: -1 });

// Prevent duplicate follows
followerFollowingSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

module.exports = mongoose.model("FollowerFollowing", followerFollowingSchema);
