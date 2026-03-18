const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    image: { type: String, default: "" },
    link: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

bannerSchema.index({ createdAt: -1 });
bannerSchema.index({ isActive: 1 });

module.exports = mongoose.model("Banner", bannerSchema);
