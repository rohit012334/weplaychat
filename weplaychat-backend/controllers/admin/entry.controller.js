const Entry = require("../../models/Entry.model");
const fs = require("fs");

// CREATE entry
exports.createEntry = async (req, res) => {
    try {
        const { type } = req.body;

        if (!type || !req.file) {
            if (req.file) fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
            return res.status(200).json({ status: false, message: "Type and file are required." });
        }

        const validTypes = ["gif", "mp4", "svga"];
        if (!validTypes.includes(type)) {
            if (req.file) fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
            return res.status(200).json({ status: false, message: "Invalid type. Must be gif, mp4, or svga." });
        }

        const entry = new Entry({
            file: req.file.path,
            type,
        });

        await entry.save();

        return res.status(200).json({
            status: true,
            message: "Entry created successfully.",
            data: entry,
        });
    } catch (error) {
        if (req.file) fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
        console.error("createEntry error:", error);
        return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
    }
};

// UPDATE entry
exports.updateEntry = async (req, res) => {
    try {
        const { entryId } = req.query;

        if (!entryId) {
            if (req.file) fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
            return res.status(200).json({ status: false, message: "entryId is required." });
        }

        const entry = await Entry.findById(entryId);
        if (!entry) {
            if (req.file) fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
            return res.status(200).json({ status: false, message: "Entry not found." });
        }

        if (req.body.type) entry.type = req.body.type;

        if (req.file) {
            if (entry.file) {
                const oldPath = entry.file.split("storage");
                if (oldPath.length > 1 && fs.existsSync("storage" + oldPath[1])) {
                    fs.unlinkSync("storage" + oldPath[1]);
                }
            }
            entry.file = req.file.path;
        }

        await entry.save();

        return res.status(200).json({
            status: true,
            message: "Entry updated successfully.",
            data: entry,
        });
    } catch (error) {
        if (req.file) fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
        console.error("updateEntry error:", error);
        return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
    }
};

// LIST entries (paginated)
exports.listEntries = async (req, res) => {
    try {
        const start = parseInt(req.query.start) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (start - 1) * limit;

        const [entries, total] = await Promise.all([
            Entry.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Entry.countDocuments(),
        ]);

        return res.status(200).json({
            status: true,
            message: "Entries fetched successfully.",
            data: entries,
            total,
        });
    } catch (error) {
        console.error("listEntries error:", error);
        return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
    }
};

// DELETE entry
exports.deleteEntry = async (req, res) => {
    try {
        const { entryId } = req.query;

        if (!entryId) {
            return res.status(200).json({ status: false, message: "entryId is required." });
        }

        const entry = await Entry.findById(entryId);
        if (!entry) {
            return res.status(200).json({ status: false, message: "Entry not found." });
        }

        if (entry.file) {
            const parts = entry.file.split("storage");
            if (parts.length > 1 && fs.existsSync("storage" + parts[1])) {
                fs.unlinkSync("storage" + parts[1]);
            }
        }

        await Entry.findByIdAndDelete(entryId);

        return res.status(200).json({ status: true, message: "Entry deleted successfully." });
    } catch (error) {
        console.error("deleteEntry error:", error);
        return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
    }
};

// TOGGLE isActive
exports.updateEntryStatus = async (req, res) => {
    try {
        const { entryId } = req.query;

        if (!entryId) {
            return res.status(200).json({ status: false, message: "entryId is required." });
        }

        const entry = await Entry.findById(entryId);
        if (!entry) {
            return res.status(200).json({ status: false, message: "Entry not found." });
        }

        entry.isActive = !entry.isActive;
        await entry.save();

        return res.status(200).json({
            status: true,
            message: entry.isActive ? "Entry activated." : "Entry deactivated.",
            data: entry,
        });
    } catch (error) {
        console.error("updateEntryStatus error:", error);
        return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
    }
};
