const Level = require("../../models/Level.model");
const { deleteFile } = require("../../util/deletefile");
const fs = require("fs");
const { loadLevelsCache } = require("../../util/levelManager");

// Get all levels
exports.index = async (req, res) => {
  try {
    const levels = await Level.find().sort({ level: 1 });
    return res.status(200).json({ status: true, message: "Success", data: levels });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// Update level (threshold and images)
exports.update = async (req, res) => {
  try {
    const levelId = req.query.levelId;
    if (!levelId) {
      return res.status(200).json({ status: false, message: "Level ID is required" });
    }

    const level = await Level.findById(levelId);
    if (!level) {
      return res.status(200).json({ status: false, message: "Level not found" });
    }

    if (req.body.threshold) {
      level.threshold = req.body.threshold;
    }

    if (req.files) {
      if (req.files.userImage) {
        if (level.userImage) {
          deleteFile(level.userImage);
        }
        level.userImage = req.files.userImage[0].path;
      }
      if (req.files.hostImage) {
        if (level.hostImage) {
          deleteFile(level.hostImage);
        }
        level.hostImage = req.files.hostImage[0].path;
      }
    }

    await level.save();
    loadLevelsCache(); // Reload in-memory cache

    return res.status(200).json({ status: true, message: "Level updated successfully", data: level });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// Auto-initialize levels from thresholds if empty
exports.initialize = async (req, res) => {
  try {
    const count = await Level.countDocuments();
    if (count > 0) {
      return res.status(200).json({ status: true, message: "Levels already initialized" });
    }

    const levelThresholds = [
      10000, 20000, 50000, 100000, 200000, 300000, 400000, 500000, 600000, 700000,
      800000, 900000, 1000000, 1200000, 1400000, 1600000, 1800000, 2000000, 2500000, 3000000,
      3500000, 4000000, 4500000, 5000000, 5500000, 6000000, 6500000, 7000000, 7500000, 8000000,
      8500000, 9000000, 9500000, 10000000, 10500000, 11000000, 11500000, 12000000, 12500000, 13000000,
      13500000, 14000000, 14500000, 15000000, 15500000, 16000000, 16500000, 17000000, 17500000, 18000000,
      19000000, 20000000, 21000000, 22000000, 23000000, 24000000, 25000000, 26000000, 27000000, 28000000,
      30000000, 32000000, 34000000, 36000000, 38000000, 40000000, 45000000, 50000000, 55000000, 60000000,
      65000000, 70000000, 75000000, 80000000, 85000000, 90000000, 95000000, 100000000, 110000000, 120000000,
      130000000, 140000000, 150000000, 160000000, 170000000, 180000000, 190000000, 200000000, 250000000, 300000000,
      350000000, 400000000, 450000000, 500000000, 550000000, 600000000, 700000000, 800000000, 900000000, 1000000000,
    ];

    const levelData = levelThresholds.map((threshold, index) => ({
      level: index + 1,
      threshold: threshold,
      userImage: "",
      hostImage: "",
    }));

    await Level.insertMany(levelData);
    loadLevelsCache(); // Reload in-memory cache

    return res.status(200).json({ status: true, message: "Levels initialized successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
