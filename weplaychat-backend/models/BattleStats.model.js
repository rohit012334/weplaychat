const mongoose = require("mongoose");

const battleStatsSchema = new mongoose.Schema(
  {
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Host",
      required: true,
      unique: true,
    },

    totalBattles: {
      type: Number,
      default: 0,
    },

    wins: {
      type: Number,
      default: 0,
    },

    losses: {
      type: Number,
      default: 0,
    },

    winRate: {
      type: Number,
      default: 0,
    },

    totalCoinsEarned: {
      type: Number,
      default: 0,
    },

    totalGiftsReceived: {
      type: Number,
      default: 0,
    },

    winStreak: {
      type: Number,
      default: 0,
    },

    rating: {
      type: Number,
      default: 1000,
    },

    lastBattleDate: {
      type: Date,
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BattleStats", battleStatsSchema);
