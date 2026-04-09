const mongoose = require("mongoose");

const battleInvitationSchema = new mongoose.Schema(
  {
    inviteId: {
      type: String,
      unique: true,
      required: true,
      default: () => `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    },

    fromHostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Host",
      required: true,
    },

    toHostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Host",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      default: "pending",
    },

    battleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PKBattle",
      default: null,
    },

    duration: {
      type: Number,
      default: 5, // Default duration in minutes
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 300 * 1000), // 5 minutes from now
    },

    respondedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Auto-remove expired invitations
battleInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("BattleInvitation", battleInvitationSchema);
