const mongoose = require("mongoose");

const giftDuringBattleSchema = new mongoose.Schema(
  {
    battleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PKBattle",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipientHostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Host",
      required: true,
    },
    giftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gift",
      required: true,
    },
    giftValue: {
      type: Number,
      required: true,
    },
    count: {
      type: Number,
      default: 1,
    },
    totalValue: {
      type: Number,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GiftDuringBattle", giftDuringBattleSchema);
