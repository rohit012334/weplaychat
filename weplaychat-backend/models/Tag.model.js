const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        // Optional tag asset (SVGA / PNG / JPG). Stored as `/storage/<filename>` via normalizeStoragePath middleware.
        file: { type: String, default: "" },
        // Normalized file type: `svga` | `png` | `jpg` (jpeg will be normalized to `jpg`).
        type: { type: String, default: "" },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

tagSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Tag", tagSchema);
