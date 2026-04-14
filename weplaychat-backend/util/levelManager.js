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
      hostImage: levelData.hostImage,
      rewards: levelData.rewards || []
    };
  }
  
  return {
    level: levelNumber,
    threshold: levelThresholds[levelNumber - 1] || 0,
    userImage: "",
    hostImage: "",
    rewards: []
  };
};

/**
 * Grant rewards for a specific level to a user
 */
const grantLevelRewards = async (user, levelNumber) => {
  const levelDetails = getLevelDetails(levelNumber);
  if (!levelDetails || !levelDetails.rewards || levelDetails.rewards.length === 0) return;

  for (const reward of levelDetails.rewards) {
    // Check if user already has this item in inventory
    const hasItem = user.inventory.some(item => {
      if (reward.customFile) {
        return item.customFile === reward.customFile;
      }
      return item.itemId && reward.itemId && item.itemId.toString() === reward.itemId.toString() && item.itemType === reward.itemType;
    });

    if (!hasItem) {
      const newItem = {
        itemType: reward.itemType,
        itemId: reward.itemId || null,
        customFile: reward.customFile || "",
        customName: reward.customName || ""
      };
      user.inventory.push(newItem);
    }
  }
};

/**
 * Get full level progress information for a progress bar
 * @param {number} coins - Total coins spent or earned
 */
const getLevelProgress = (coins) => {
  const currentLevel = calculateLevel(coins);
  const nextLevel = currentLevel + 1;
  
  const currentLevelDetails = getLevelDetails(currentLevel);
  const nextLevelDetails = getLevelDetails(nextLevel);
  
  const thresholds = levelsCache.length > 0 ? levelsCache.map(l => l.threshold) : levelThresholds;
  
  // If they somehow exceeded the max predefined level
  if (nextLevel > thresholds.length) {
    return {
      currentLevel,
      currentLevelDetails,
      nextLevel: currentLevel,
      nextLevelDetails: currentLevelDetails,
      currentCoins: coins,
      nextLevelThreshold: coins, // Already maxed
      coinsNeededForNext: 0
    };
  }
  
  const nextLevelThreshold = nextLevelDetails ? nextLevelDetails.threshold : thresholds[nextLevel - 1];
  const coinsNeededForNext = Math.max(0, nextLevelThreshold - coins);
  
  return {
    currentLevel,
    currentLevelDetails,
    nextLevel,
    nextLevelDetails,
    currentCoins: coins,
    nextLevelThreshold,
    coinsNeededForNext
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

    const oldLevel = user.level || 0;
    
    // Coins spent increases user level
    user.spentCoins = (user.spentCoins || 0) + spentAmount;
    
    const newLevel = calculateLevel(user.spentCoins);
    
    if (newLevel > oldLevel) {
      // Grant rewards for each level reached
      for (let l = oldLevel + 1; l <= newLevel; l++) {
        await grantLevelRewards(user, l);
      }
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
    const host = await Host.findById(hostId).populate("userId");
    if (!host) return;

    const oldLevel = host.level || 0;

    // Coins earned/received increases host balance and level
    host.coin = (host.coin || 0) + earnedAmount;
    host.totalEarnings = (host.totalEarnings || 0) + earnedAmount;
    
    const newLevel = calculateLevel(host.totalEarnings);
    
    if (newLevel > oldLevel) {
      host.level = newLevel;
      
      // If the host has a corresponding user record, give them the rewards too?
      // Usually host level and user level are separate, but gifts might go to the user inventory.
      if (host.userId) {
        const user = await User.findById(host.userId);
        if (user) {
          for (let l = oldLevel + 1; l <= newLevel; l++) {
            await grantLevelRewards(user, l);
          }
          await user.save();
        }
      }
    }

    await host.save();
    return host;
  } catch (error) {
    console.error("Error in addHostExp:", error);
  }
};

exports.calculateLevel = calculateLevel;
exports.getLevelDetails = getLevelDetails;
exports.getLevelProgress = getLevelProgress;
exports.loadLevelsCache = loadLevelsCache;
exports.grantLevelRewards = grantLevelRewards;
