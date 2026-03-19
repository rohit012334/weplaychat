const EntryTag = require("../../models/EntryTag.model");
const fs = require("fs");

// CREATE
exports.createEntryTag = async (req, res) => {
  try {
    const { type } = req.body;
    if (!type || !req.file) {
      if (req.file) fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
      return res.status(200).json({ status: false, message: "Type and file are required." });
    }
    const validTypes = ["mp4", "svga"];
    if (!validTypes.includes(type)) {
      if (req.file) fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
      return res.status(200).json({ status: false, message: "Invalid type. Must be mp4 or svga." });
    }
    const entryTag = new EntryTag({ file: req.file.path, type });
    await entryTag.save();
    return res.status(200).json({ status: true, message: "EntryTag created successfully.", data: entryTag });
  } catch (error) {
    if (req.file) fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
    console.error("createEntryTag error:", error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// UPDATE
exports.updateEntryTag = async (req, res) => {
  try {
    const { entryTagId } = req.query;
    if (!entryTagId) {
      if (req.file) fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
      return res.status(200).json({ status: false, message: "entryTagId is required." });
    }
    const entryTag = await EntryTag.findById(entryTagId);
    if (!entryTag) {
      if (req.file) fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
      return res.status(200).json({ status: false, message: "EntryTag not found." });
    }
    if (req.body.type) entryTag.type = req.body.type;
    if (req.file) {
      if (entryTag.file) {
        const parts = entryTag.file.split("storage");
        if (parts.length > 1 && fs.existsSync("storage" + parts[1])) fs.unlinkSync("storage" + parts[1]);
      }
      entryTag.file = req.file.path;
    }
    await entryTag.save();
    return res.status(200).json({ status: true, message: "EntryTag updated successfully.", data: entryTag });
  } catch (error) {
    if (req.file) fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// LIST
exports.listEntryTags = async (req, res) => {
  try {
    const start = parseInt(req.query.start) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (start - 1) * limit;
    const [entryTags, total] = await Promise.all([
      EntryTag.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      EntryTag.countDocuments(),
    ]);
    return res.status(200).json({ status: true, data: entryTags, total });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// DELETE
exports.deleteEntryTag = async (req, res) => {
  try {
    const { entryTagId } = req.query;
    const entryTag = await EntryTag.findById(entryTagId);
    if (!entryTag) return res.status(200).json({ status: false, message: "EntryTag not found." });
    if (entryTag.file) {
      const parts = entryTag.file.split("storage");
      if (parts.length > 1 && fs.existsSync("storage" + parts[1])) fs.unlinkSync("storage" + parts[1]);
    }
    await EntryTag.findByIdAndDelete(entryTagId);
    return res.status(200).json({ status: true, message: "EntryTag deleted successfully." });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// TOGGLE status
exports.updateEntryTagStatus = async (req, res) => {
  try {
    const entryTag = await EntryTag.findById(req.query.entryTagId);
    if (!entryTag) return res.status(200).json({ status: false, message: "EntryTag not found." });
    entryTag.isActive = !entryTag.isActive;
    await entryTag.save();
    return res.status(200).json({ status: true, message: "Status updated.", data: entryTag });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
