const mongoose = require("mongoose");

const entryTagSchema = new mongoose.Schema(
  {
    file: { type: String, default: "" },
    type: { type: String, enum: ["mp4", "svga"], default: "mp4" },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

entryTagSchema.index({ createdAt: -1 });

module.exports = mongoose.model("EntryTag", entryTagSchema);
