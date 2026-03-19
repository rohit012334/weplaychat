const mongoose = require("mongoose");

const vipPlanSchema = new mongoose.Schema(
  {
    level: { type: Number, enum: [1, 2, 3], default: 1 }, // 1: VIP, 2: VVIP, 3: SVIP
    name: { type: String, default: "" }, // VIP Plan, VVIP Plan, SVIP Plan
    validity: { type: Number, default: 0 },
    validityType: { type: String, trim: true, lowercase: true, default: "" },
    coin: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    productId: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

vipPlanSchema.index({ coin: 1, price: 1 });
vipPlanSchema.index({ isActive: 1 });

module.exports = mongoose.model("VipPlan", vipPlanSchema);
