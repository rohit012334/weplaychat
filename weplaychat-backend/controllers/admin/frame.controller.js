const Frame = require("../../models/Frame.model");
const fs = require("fs");
const { deleteFiles } = require("../../util/deletefile");

// CREATE frame
exports.createFrame = async (req, res) => {
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

        const frame = new Frame({
            file: req.file.path,
            type,
        });

        await frame.save();

        return res.status(200).json({
            status: true,
            message: "Frame created successfully.",
            data: frame,
        });
    } catch (error) {
        if (req.file) fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
        console.error("createFrame error:", error);
        return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
    }
};

// UPDATE frame
exports.updateFrame = async (req, res) => {
    try {
        const { frameId } = req.query;

        if (!frameId) {
            if (req.file) fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
            return res.status(200).json({ status: false, message: "frameId is required." });
        }

        const frame = await Frame.findById(frameId);
        if (!frame) {
            if (req.file) fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
            return res.status(200).json({ status: false, message: "Frame not found." });
        }

        if (req.body.type) frame.type = req.body.type;

        if (req.file) {
            // Remove old file
            if (frame.file) {
                const oldPath = frame.file.split("storage");
                if (oldPath.length > 1 && fs.existsSync("storage" + oldPath[1])) {
                    fs.unlinkSync("storage" + oldPath[1]);
                }
            }
            frame.file = req.file.path;
        }

        await frame.save();

        return res.status(200).json({
            status: true,
            message: "Frame updated successfully.",
            data: frame,
        });
    } catch (error) {
        if (req.file) fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
        console.error("updateFrame error:", error);
        return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
    }
};

// LIST frames (paginated)
exports.listFrames = async (req, res) => {
    try {
        const start = parseInt(req.query.start) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (start - 1) * limit;

        const [frames, total] = await Promise.all([
            Frame.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Frame.countDocuments(),
        ]);

        return res.status(200).json({
            status: true,
            message: "Frames fetched successfully.",
            data: frames,
            total,
        });
    } catch (error) {
        console.error("listFrames error:", error);
        return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
    }
};

// DELETE frame
exports.deleteFrame = async (req, res) => {
    try {
        const { frameId } = req.query;

        if (!frameId) {
            return res.status(200).json({ status: false, message: "frameId is required." });
        }

        const frame = await Frame.findById(frameId);
        if (!frame) {
            return res.status(200).json({ status: false, message: "Frame not found." });
        }

        // Delete file from disk
        if (frame.file) {
            const parts = frame.file.split("storage");
            if (parts.length > 1 && fs.existsSync("storage" + parts[1])) {
                fs.unlinkSync("storage" + parts[1]);
            }
        }

        await Frame.findByIdAndDelete(frameId);

        return res.status(200).json({ status: true, message: "Frame deleted successfully." });
    } catch (error) {
        console.error("deleteFrame error:", error);
        return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
    }
};

// TOGGLE isActive
exports.updateFrameStatus = async (req, res) => {
    try {
        const { frameId } = req.query;

        if (!frameId) {
            return res.status(200).json({ status: false, message: "frameId is required." });
        }

        const frame = await Frame.findById(frameId);
        if (!frame) {
            return res.status(200).json({ status: false, message: "Frame not found." });
        }

        frame.isActive = !frame.isActive;
        await frame.save();

        return res.status(200).json({
            status: true,
            message: frame.isActive ? "Frame activated." : "Frame deactivated.",
            data: frame,
        });
    } catch (error) {
        console.error("updateFrameStatus error:", error);
        return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
    }
};
