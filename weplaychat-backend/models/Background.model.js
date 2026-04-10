const mongoose = require("mongoose");

const backgroundSchema = new mongoose.Schema(
  {
    file: { type: String, default: "" },
    type: { type: String, enum: ["mp4", "jpg", "png"], default: "jpg" },
    price: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

backgroundSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Background", backgroundSchema);
