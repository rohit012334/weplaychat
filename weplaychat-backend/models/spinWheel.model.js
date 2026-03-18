const mongoose = require("mongoose");

const spinWheelSlotSchema = new mongoose.Schema(
  {
    // Slot UI label (shown in panel/app)
    label: { type: String, default: "" },

    // Supported reward types (extend later without breaking old data)
    // - "coin": adds coins to user
    // - "none": no reward
    rewardType: { type: String, enum: ["coin", "none"], default: "none" },
    rewardValue: { type: Number, default: 0 },

    // Relative weight for random selection (0 disables)
    weight: { type: Number, default: 1, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const spinWheelSchema = new mongoose.Schema(
  {
    // Singleton doc key
    key: { type: String, unique: true, default: "default" },

    // Must be exactly 8 slots in UI; backend validates on update.
    slots: { type: [spinWheelSlotSchema], default: [] },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

spinWheelSchema.index({ key: 1 });

module.exports = mongoose.model("SpinWheel", spinWheelSchema);

