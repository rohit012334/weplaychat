const mongoose = require("mongoose");

const battleQueueSchema = new mongoose.Schema(
  {
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Host",
      required: true,
    },
    status: {
      type: String,
      enum: ["waiting", "matched", "cancelled"],
      default: "waiting",
    },
    matchedHostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Host",
      default: null,
    },
    duration: {
      type: Number,
      default: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300, // Auto-remove from queue after 5 minutes if no match
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BattleQueue", battleQueueSchema);
