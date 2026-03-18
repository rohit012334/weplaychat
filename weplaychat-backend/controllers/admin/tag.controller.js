const Tag = require("../../models/Tag.model");

// CREATE tag
exports.createTag = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(200).json({ status: false, message: "Tag name is required." });
        }

        const existing = await Tag.findOne({ name: name.trim() });
        if (existing) {
            return res.status(200).json({ status: false, message: "Tag with this name already exists." });
        }

        const tag = new Tag({ name: name.trim() });
        await tag.save();

        return res.status(200).json({
            status: true,
            message: "Tag created successfully.",
            data: tag,
        });
    } catch (error) {
        console.error("createTag error:", error);
        return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
    }
};

// UPDATE tag
exports.updateTag = async (req, res) => {
    try {
        const { tagId } = req.query;

        if (!tagId) {
            return res.status(200).json({ status: false, message: "tagId is required." });
        }

        const tag = await Tag.findById(tagId);
        if (!tag) {
            return res.status(200).json({ status: false, message: "Tag not found." });
        }

        if (req.body.name) tag.name = req.body.name.trim();

        await tag.save();

        return res.status(200).json({
            status: true,
            message: "Tag updated successfully.",
            data: tag,
        });
    } catch (error) {
        console.error("updateTag error:", error);
        return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
    }
};

// LIST tags (paginated)
exports.listTags = async (req, res) => {
    try {
        const start = parseInt(req.query.start) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (start - 1) * limit;

        const [tags, total] = await Promise.all([
            Tag.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Tag.countDocuments(),
        ]);

        return res.status(200).json({
            status: true,
            message: "Tags fetched successfully.",
            data: tags,
            total,
        });
    } catch (error) {
        console.error("listTags error:", error);
        return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
    }
};

// DELETE tag
exports.deleteTag = async (req, res) => {
    try {
        const { tagId } = req.query;

        if (!tagId) {
            return res.status(200).json({ status: false, message: "tagId is required." });
        }

        const tag = await Tag.findById(tagId);
        if (!tag) {
            return res.status(200).json({ status: false, message: "Tag not found." });
        }

        await Tag.findByIdAndDelete(tagId);

        return res.status(200).json({ status: true, message: "Tag deleted successfully." });
    } catch (error) {
        console.error("deleteTag error:", error);
        return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
    }
};

// TOGGLE isActive
exports.updateTagStatus = async (req, res) => {
    try {
        const { tagId } = req.query;

        if (!tagId) {
            return res.status(200).json({ status: false, message: "tagId is required." });
        }

        const tag = await Tag.findById(tagId);
        if (!tag) {
            return res.status(200).json({ status: false, message: "Tag not found." });
        }

        tag.isActive = !tag.isActive;
        await tag.save();

        return res.status(200).json({
            status: true,
            message: tag.isActive ? "Tag activated." : "Tag deactivated.",
            data: tag,
        });
    } catch (error) {
        console.error("updateTagStatus error:", error);
        return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
    }
};
