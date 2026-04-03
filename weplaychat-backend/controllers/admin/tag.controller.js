const Tag = require("../../models/Tag.model");
const fs = require("fs");
const path = require("path");
const { resolveStorageAbsolutePath } = require("../../util/storagePath");

const VALID_TAG_TYPES = ["svga", "png", "jpg"];

const inferTagTypeFromFile = (file) => {
    const ext = (file?.originalname ? path.extname(file.originalname) : "").toLowerCase().replace(".", "");
    if (ext === "svga") return "svga";
    if (ext === "png") return "png";
    if (ext === "jpg" || ext === "jpeg") return "jpg";
    return "";
};

const normalizeTagType = (value) => {
    const type = String(value ?? "").toLowerCase().trim();
    if (type === "jpeg") return "jpg";
    if (type === "jpg") return "jpg";
    if (type === "png") return "png";
    if (type === "svga" || type === "3") return "svga";
    return type;
};

// CREATE tag
exports.createTag = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(200).json({ status: false, message: "Tag name is required." });
        }

        const trimmedName = name.trim();
        let tagPayload = { name: trimmedName };

        // Optional upload
        if (req.file) {
            const providedType = normalizeTagType(req.body.type);
            const inferredType = inferTagTypeFromFile(req.file);
            const finalType = providedType || inferredType;

            if (!VALID_TAG_TYPES.includes(finalType)) {
                // Delete invalid uploaded file from disk
                const abs = resolveStorageAbsolutePath(req.file.path);
                if (abs && fs.existsSync(abs)) fs.unlinkSync(abs);
                return res.status(200).json({ status: false, message: "Invalid file type. Only SVGA, PNG, JPG are allowed." });
            }

            tagPayload = { ...tagPayload, file: req.file.path, type: finalType };
        }

        // Only after validating uploaded file, check duplicates.
        const existing = await Tag.findOne({ name: trimmedName });
        if (existing) {
            // If multer saved a file but tag already exists, delete it to prevent orphan files.
            if (req.file) {
                const abs = resolveStorageAbsolutePath(req.file.path);
                if (abs && fs.existsSync(abs)) fs.unlinkSync(abs);
            }
            return res.status(200).json({ status: false, message: "Tag with this name already exists." });
        }

        const tag = new Tag(tagPayload);
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
            // If multer saved a file but tag doesn't exist, delete it to prevent orphan files.
            if (req.file) {
                const abs = resolveStorageAbsolutePath(req.file.path);
                if (abs && fs.existsSync(abs)) fs.unlinkSync(abs);
            }
            return res.status(200).json({ status: false, message: "Tag not found." });
        }

        if (req.body.name) tag.name = req.body.name.trim();

        // Replace file only if new upload provided
        if (req.file) {
            const providedType = normalizeTagType(req.body.type);
            const inferredType = inferTagTypeFromFile(req.file);
            const finalType = providedType || inferredType;

            if (!VALID_TAG_TYPES.includes(finalType)) {
                const abs = resolveStorageAbsolutePath(req.file.path);
                if (abs && fs.existsSync(abs)) fs.unlinkSync(abs);
                return res.status(200).json({ status: false, message: "Invalid file type. Only SVGA, PNG, JPG are allowed." });
            }

            // Remove old file from disk
            if (tag.file) {
                const oldAbs = resolveStorageAbsolutePath(tag.file);
                if (oldAbs && fs.existsSync(oldAbs)) fs.unlinkSync(oldAbs);
            }

            tag.file = req.file.path;
            tag.type = finalType;
        }

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

        // Delete stored file (if any)
        if (tag.file) {
            const abs = resolveStorageAbsolutePath(tag.file);
            if (abs && fs.existsSync(abs)) fs.unlinkSync(abs);
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
