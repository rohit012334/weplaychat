const User = require("../models/user.model");
const Host = require("../models/host.model");

/**
 * Level thresholds based on the provided images
 * Array index + 1 = Level
 * Value = Coins required for that level
 */
const levelThresholds = [
  10000,      // Level 1
  20000,      // Level 2
  50000,      // Level 3
  100000,     // Level 4
  200000,     // Level 5
  300000,     // Level 6
  400000,     // Level 7
  500000,     // Level 8
  600000,     // Level 9
  700000,     // Level 10
  800000,     // Level 11
  900000,     // Level 12
  1000000,    // Level 13 (1M)
  1200000,    // Level 14
  1400000,    // Level 15
  1600000,    // Level 16
  1800000,    // Level 17
  2000000,    // Level 18
  2500000,    // Level 19
  3000000,    // Level 20
  3500000,    // Level 21
  4000000,    // Level 22
  4500000,    // Level 23
  5000000,    // Level 24
  5500000,    // Level 25
  6000000,    // Level 26
  6500000,    // Level 27
  7000000,    // Level 28
  7500000,    // Level 29
  8000000,    // Level 30
  8500000,    // Level 31
  9000000,    // Level 32
  9500000,    // Level 33
  10000000,   // Level 34 (10M)
  10500000,   // Level 35
  11000000,   // Level 36
  11500000,   // Level 37
  12000000,   // Level 38
  12500000,   // Level 39
  13000000,   // Level 40
  13500000,   // Level 41
  14000000,   // Level 42
  14500000,   // Level 43
  15000000,   // Level 44
  15500000,   // Level 45
  16000000,   // Level 46
  16500000,   // Level 47
  17000000,   // Level 48
  17500000,   // Level 49
  18000000,   // Level 50
  19000000,   // Level 51
  20000000,   // Level 52
  21000000,   // Level 53
  22000000,   // Level 54
  23000000,   // Level 55
  24000000,   // Level 56
  25000000,   // Level 57
  26000000,   // Level 58
  27000000,   // Level 59
  28000000,   // Level 60
  30000000,   // Level 61 (30M)
  32000000,   // Level 62
  34000000,   // Level 63
  36000000,   // Level 64
  38000000,   // Level 65
  40000000,   // Level 66
  45000000,   // Level 67
  50000000,   // Level 68
  55000000,   // Level 69
  60000000,   // Level 70
  65000000,   // Level 71
  70000000,   // Level 72
  75000000,   // Level 73
  80000000,   // Level 74
  85000000,   // Level 75
  90000000,   // Level 76
  95000000,   // Level 77
  100000000,  // Level 78 (100M)
  110000000,  // Level 79
  120000000,  // Level 80
  130000000,  // Level 81
  140000000,  // Level 82
  150000000,  // Level 83
  160000000,  // Level 84
  170000000,  // Level 85
  180000000,  // Level 86
  190000000,  // Level 87
  200000000,  // Level 88
  250000000,  // Level 89
  300000000,  // Level 90
  350000000,  // Level 91
  400000000,  // Level 92
  450000000,  // Level 93
  500000000,  // Level 94
  550000000,  // Level 95
  600000000,  // Level 96
  700000000,  // Level 97
  800000000,  // Level 98
  900000000,  // Level 99
  1000000000, // Level 100 (1 Billion)
];

/**
 * Calculate level based on coins using the threshold array
 * @param {number} coins - Total coins spent (for user) or earned (for host)
 */
const calculateLevel = (coins) => {
  let level = 0;
  for (let i = 0; i < levelThresholds.length; i++) {
    if (coins >= levelThresholds[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
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
