const Frame = require("../../models/Frame.model");
const Entry = require("../../models/Entry.model");
const EntryTag = require("../../models/EntryTag.model");
const Background = require("../../models/Background.model");
const Tag = require("../../models/Tag.model");

// Fetch all store items (Frames, Entries, Backgrounds, etc.)
exports.getStoreItems = async (req, res) => {
    try {
        const [frames, entries, entryTags, backgrounds, tags] = await Promise.all([
            Frame.find({ isActive: true }).sort({ createdAt: -1 }).lean(),
            Entry.find({ isActive: true }).sort({ createdAt: -1 }).lean(),
            EntryTag.find({ isActive: true }).sort({ createdAt: -1 }).lean(),
            Background.find({ isActive: true }).sort({ createdAt: -1 }).lean(),
            Tag.find({ isActive: true }).sort({ createdAt: -1 }).lean(),
        ]);

        return res.status(200).json({
            status: true,
            message: "Store items fetched successfully.",
            data: {
                frames,
                entries,
                entryTags,
                backgrounds,
                tags
            },
        });
    } catch (error) {
        console.error("getStoreItems error:", error);
        return res.status(500).json({
            status: false,
            message: error.message || "Internal Server Error",
        });
    }
};
