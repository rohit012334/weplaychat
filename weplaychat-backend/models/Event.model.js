const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    image: { type: String, default: "" },
    link: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

eventSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Event", eventSchema);

