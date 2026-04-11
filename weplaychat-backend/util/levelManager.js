const User = require("../models/user.model");
const Host = require("../models/host.model");
const Level = require("../models/Level.model");

// In-memory cache for levels to avoid DB calls on every request
let levelsCache = [];

const loadLevelsCache = async () => {
  try {
    const levels = await Level.find().sort({ level: 1 }).lean();
    if (levels.length > 0) {
      levelsCache = levels;
    }
  } catch (error) {
    console.error("Error loading levels cache:", error);
  }
};

// Initial load
loadLevelsCache();

// Reload cache every 10 minutes or when needed
setInterval(loadLevelsCache, 10 * 60 * 1000);

/**
 * Level thresholds based on the provided images
 * Array index + 1 = Level
 * Value = Coins required for that level
 */
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

/**
 * Calculate level based on coins using the threshold cache/array
 * @param {number} coins - Total coins spent (for user) or earned (for host)
 */
const calculateLevel = (coins) => {
  let level = 0;
  const thresholds = levelsCache.length > 0 ? levelsCache.map(l => l.threshold) : levelThresholds;
  
  for (let i = 0; i < thresholds.length; i++) {
    if (coins >= thresholds[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
};

/**
 * Get level details including images
 * @param {number} levelNumber 
 */
const getLevelDetails = (levelNumber) => {
  if (levelNumber <= 0) return null;
  
  const levelData = levelsCache.find(l => l.level === levelNumber);
  if (levelData) {
    return {
      level: levelData.level,
      threshold: levelData.threshold,
      userImage: levelData.userImage,
      hostImage: levelData.hostImage
    };
  }
  
  return {
    level: levelNumber,
    threshold: levelThresholds[levelNumber - 1] || 0,
    userImage: "",
    hostImage: ""
  };
};

/**
 * Add experience/coins spent to a user and update level
 * @param {string} userId - ID of the user
 * @param {number} spentAmount - Amount of coins spent
 */
exports.addUserExp = async (userId, spentAmount) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Coins spent increases user level
    user.spentCoins = (user.spentCoins || 0) + spentAmount;
    
    const newLevel = calculateLevel(user.spentCoins);
    if (newLevel !== user.level) {
      user.level = newLevel;
    }

    await user.save();
    return user;
  } catch (error) {
    console.error("Error in addUserExp:", error);
  }
};

/**
 * Add experience/coins earned to a host and update level
 * @param {string} hostId - ID of the host
 * @param {number} earnedAmount - Amount of coins earned
 */
exports.addHostExp = async (hostId, earnedAmount) => {
  try {
    const host = await Host.findById(hostId);
    if (!host) return;

    // Coins earned/received increases host balance and level
    host.coin = (host.coin || 0) + earnedAmount;
    host.totalEarnings = (host.totalEarnings || 0) + earnedAmount;
    
    const newLevel = calculateLevel(host.totalEarnings);
    if (newLevel !== host.level) {
      host.level = newLevel;
    }

    await host.save();
    return host;
  } catch (error) {
    console.error("Error in addHostExp:", error);
  }
};

exports.calculateLevel = calculateLevel;
exports.getLevelDetails = getLevelDetails;
exports.loadLevelsCache = loadLevelsCache;
