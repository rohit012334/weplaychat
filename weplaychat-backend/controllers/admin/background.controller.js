const Background = require("../../models/Background.model");
const fs = require("fs");

// CREATE background
exports.createBackground = async (req, res) => {
  try {
    console.log("createBackground req.body:", req.body);
    console.log("createBackground req.file:", req.file);
    const { type } = req.body;

    if (!type || !req.file) {
      if (req.file) fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
      return res.status(200).json({ status: false, message: "Type and file are required." });
    }

    const validTypes = ["mp4", "jpg", "png"];
    if (!validTypes.includes(type)) {
      if (req.file) fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
      return res.status(200).json({ status: false, message: "Invalid type. Must be mp4, jpg, or png." });
    }

    const background = new Background({
      file: req.file.path,
      type,
      price: req.body.price || 0,
    });

    await background.save();

    return res.status(200).json({
      status: true,
      message: "Background created successfully.",
      data: background,
    });
  } catch (error) {
    if (req.file) fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
    console.error("createBackground error:", error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// UPDATE background
exports.updateBackground = async (req, res) => {
  try {
    const { backgroundId } = req.query;

    if (!backgroundId) {
      if (req.file) fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
      return res.status(200).json({ status: false, message: "backgroundId is required." });
    }

    const background = await Background.findById(backgroundId);
    if (!background) {
      if (req.file) fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
      return res.status(200).json({ status: false, message: "Background not found." });
    }

    if (req.body.type) background.type = req.body.type;
    if (req.body.price !== undefined) background.price = req.body.price;

    if (req.file) {
      if (background.file) {
        const oldPath = background.file.split("storage");
        if (oldPath.length > 1 && fs.existsSync("storage" + oldPath[1])) {
          fs.unlinkSync("storage" + oldPath[1]);
        }
      }
      background.file = req.file.path;
    }

    await background.save();

    return res.status(200).json({
      status: true,
      message: "Background updated successfully.",
      data: background,
    });
  } catch (error) {
    if (req.file) fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
    console.error("updateBackground error:", error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// LIST backgrounds (paginated)
exports.listBackgrounds = async (req, res) => {
  try {
    const start = parseInt(req.query.start) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (start - 1) * limit;

    const [backgrounds, total] = await Promise.all([
      Background.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Background.countDocuments(),
    ]);

    return res.status(200).json({
      status: true,
      message: "Backgrounds fetched successfully.",
      data: backgrounds,
      total,
    });
  } catch (error) {
    console.error("listBackgrounds error:", error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// DELETE background
exports.deleteBackground = async (req, res) => {
  try {
    const { backgroundId } = req.query;

    const background = await Background.findById(backgroundId);
    if (!background) return res.status(200).json({ status: false, message: "Background not found." });

    if (background.file) {
      const parts = background.file.split("storage");
      if (parts.length > 1 && fs.existsSync("storage" + parts[1])) {
        fs.unlinkSync("storage" + parts[1]);
      }
    }

    await Background.findByIdAndDelete(backgroundId);
    return res.status(200).json({ status: true, message: "Background deleted successfully." });
  } catch (error) {
    console.error("deleteBackground error:", error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// TOGGLE status
exports.updateBackgroundStatus = async (req, res) => {
  try {
    const background = await Background.findById(req.query.backgroundId);
    if (!background) return res.status(200).json({ status: false, message: "Background not found." });

    background.isActive = !background.isActive;
    await background.save();

    return res.status(200).json({
      status: true,
      message: background.isActive ? "Background activated." : "Background deactivated.",
      data: background,
    });
  } catch (error) {
    console.error("updateBackgroundStatus error:", error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
