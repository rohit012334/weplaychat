const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema(
    {
        file: { type: String, default: "" },
        type: { type: String, enum: ["gif", "mp4", "svga"], default: "gif" },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

entrySchema.index({ createdAt: -1 });

module.exports = mongoose.model("Entry", entrySchema);
