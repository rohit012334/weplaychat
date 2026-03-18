const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

tagSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Tag", tagSchema);
