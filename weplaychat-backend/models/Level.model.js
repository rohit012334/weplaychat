const mongoose = require("mongoose");

const levelSchema = new mongoose.Schema(
  {
    level: { type: Number, unique: true },
    threshold: { type: Number, default: 0 },
    userImage: { type: String, default: "" },
    hostImage: { type: String, default: "" },
    rewards: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId },
        itemType: { type: String, enum: ["frame", "entry", "entryTag", "background", "tag", "gift", "custom"] },
        customFile: { type: String, default: "" },
        customName: { type: String, default: "" }
      }
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

levelSchema.index({ level: 1 });

module.exports = mongoose.model("Level", levelSchema);
