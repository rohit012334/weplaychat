const mongoose = require("mongoose");

const pkBattleSchema = new mongoose.Schema(
  {
    battleId: {
      type: String,
      unique: true,
      required: true,
      default: () => `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    },

    battleType: {
      type: String,
      enum: ["random", "invite"],
      required: true,
    },

    host1Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Host",
      required: true,
    },

    host2Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Host",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled"],
      default: "pending",
    },

    duration: {
      type: Number, // in minutes
      default: 5,
    },

    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Host",
      default: null,
    },

    startTime: {
      type: Date,
      default: null,
    },

    endTime: {
      type: Date,
      default: null,
    },

    totalViews: {
      type: Number,
      default: 0,
    },

    totalGiftsValue: {
      type: Number,
      default: 0,
    },

    host1Coins: {
      type: Number,
      default: 0,
    },

    host2Coins: {
      type: Number,
      default: 0,
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

module.exports = mongoose.model("PKBattle", pkBattleSchema);