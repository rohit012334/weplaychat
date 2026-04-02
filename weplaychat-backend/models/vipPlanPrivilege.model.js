const mongoose = require("mongoose");

const VipPlanPrivilegeSchema = new mongoose.Schema(
  {
    level: { type: Number, enum: [1, 2, 3], required: true, unique: true }, // 1: VIP, 2: VVIP, 3: SVIP
    name: { type: String, required: true }, // VIP, VVIP, SVIP
    
    // Feature Flags & Values
    vipFrameBadge: { type: String, default: "" },
    videoCallDiscount: { type: Number, min: 0, default: 0 },
    randomMatchCallDiscount: { type: Number, min: 0, default: 0 },
    topUpCoinBonus: { type: Number, min: 0, default: 0 },
    
    // New Features
    muteAvailability: { type: Boolean, default: false },
    specialName: { type: Boolean, default: false },
    freeEntry: { type: Boolean, default: false },
    freeEntryImage: { type: String, default: "" },
    roomAuthority: { type: Boolean, default: false },
    unlimitedChat: { type: Boolean, default: false },
    memberTag: { type: Boolean, default: false },
    profileEdit: { type: Boolean, default: false },
    
    // VVIP Features
    kick: { type: Boolean, default: false },
    backgroundAdd: { type: Boolean, default: false },
    
    // SVIP Features
    hide: { type: Boolean, default: false },
    canMuteOthers: { type: Boolean, default: false }, // Logic for SVIP muting VIP/VVIP
    
    // Additional Media Fields
    vipEntrance1: { type: String, default: "" },
    vipEntrance2: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("VipPlanPrivilege", VipPlanPrivilegeSchema);
