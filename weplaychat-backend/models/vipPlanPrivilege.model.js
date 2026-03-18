const mongoose = require("mongoose");

const VipPlanPrivilegeSchema = new mongoose.Schema(
  {
    vipFrameBadge: { type: String, default: "" },
    audioCallDiscount: { type: Number, min: 0, default: 0 },
    videoCallDiscount: { type: Number, min: 0, default: 0 },
    randomMatchCallDiscount: { type: Number, min: 0, default: 0 },
    topUpCoinBonus: { type: Number, min: 0, default: 0 },
    freeMessages: { type: Number, min: 0, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("VipPlanPrivilege", VipPlanPrivilegeSchema);
