/**
 * Coin Transaction Service
 * Handles all coin operations across the system
 * Ensures atomicity and proper balance tracking
 */

const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { COIN_TRANSACTION_TYPE, RECHARGE_STATUS, HISTORY_TYPE } = require("../types/constant");

const Reseller = require("../models/Reseller.model");
const User = require("../models/user.model");
const CoinTransaction = require("../models/CoinTransaction.model");
const Recharge = require("../models/recharge.model");
const History = require("../models/history.model");
const { spinsForPurchaseAmount } = require("./spinsForPurchaseAmount");

/**
 * Add coins to Reseller by SuperAdmin
 * @param {string} resellerId - Reseller ID
 * @param {number} amount - Amount to add
 * @param {string} adminId - SuperAdmin ID performing the action
 * @param {string} reason - Reason for adding coins
 * @returns {object} Transaction result
 */
exports.addCoinsToReseller = async (resellerId, amount, adminId, reason = "") => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate inputs
    if (!resellerId || !amount || !adminId) {
      throw new Error("Missing required parameters: resellerId, amount, adminId");
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // Fetch reseller
    const reseller = await Reseller.findById(resellerId).session(session);
    if (!reseller) {
      throw new Error("Reseller not found");
    }

    const balanceBefore = reseller.coin || 0;
    const balanceAfter = balanceBefore + amount;

    // Update reseller coin balance
    reseller.coin = balanceAfter;
    await reseller.save({ session });

    // Create coin transaction record
    const transaction = new CoinTransaction({
      uniqueId: `CT_${uuidv4()}`,
      performedBy: adminId,
      resellerId,
      type: COIN_TRANSACTION_TYPE.ADD,
      amount,
      balanceBefore,
      balanceAfter,
      reason,
      status: "completed",
      approvedBy: adminId,
      approvalDate: new Date(),
    });

    await transaction.save({ session });

    // Commit transaction
    await session.commitTransaction();

    return {
      success: true,
      data: {
        transaction,
        reseller: {
          _id: reseller._id,
          coin: reseller.coin,
          balanceBefore,
          balanceAfter,
        },
      },
      message: `Successfully added ${amount} coins to reseller`,
    };
  } catch (error) {
    await session.abortTransaction();
    return {
      success: false,
      error: error.message,
      message: `Failed to add coins to reseller: ${error.message}`,
    };
  } finally {
    session.endSession();
  }
};

/**
 * Deduct coins from Reseller by SuperAdmin
 * @param {string} resellerId - Reseller ID
 * @param {number} amount - Amount to deduct
 * @param {string} adminId - SuperAdmin ID performing the action
 * @param {string} reason - Reason for deducting coins
 * @returns {object} Transaction result
 */
exports.deductCoinsFromReseller = async (resellerId, amount, adminId, reason = "") => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate inputs
    if (!resellerId || !amount || !adminId) {
      throw new Error("Missing required parameters: resellerId, amount, adminId");
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // Fetch reseller
    const reseller = await Reseller.findById(resellerId).session(session);
    if (!reseller) {
      throw new Error("Reseller not found");
    }

    const balanceBefore = reseller.coin || 0;

    // Check if reseller has sufficient balance
    if (balanceBefore < amount) {
      throw new Error(`Insufficient balance. Available: ${balanceBefore}, Requested: ${amount}`);
    }

    const balanceAfter = balanceBefore - amount;

    // Update reseller coin balance
    reseller.coin = balanceAfter;
    await reseller.save({ session });

    // Create coin transaction record
    const transaction = new CoinTransaction({
      uniqueId: `CT_${uuidv4()}`,
      performedBy: adminId,
      resellerId,
      type: COIN_TRANSACTION_TYPE.DEDUCT,
      amount,
      balanceBefore,
      balanceAfter,
      reason,
      status: "completed",
      approvedBy: adminId,
      approvalDate: new Date(),
    });

    await transaction.save({ session });

    // Commit transaction
    await session.commitTransaction();

    return {
      success: true,
      data: {
        transaction,
        reseller: {
          _id: reseller._id,
          coin: reseller.coin,
          balanceBefore,
          balanceAfter,
        },
      },
      message: `Successfully deducted ${amount} coins from reseller`,
    };
  } catch (error) {
    await session.abortTransaction();
    return {
      success: false,
      error: error.message,
      message: `Failed to deduct coins from reseller: ${error.message}`,
    };
  } finally {
    session.endSession();
  }
};

/**
 * Reseller recharges user with coins
 * @param {string} resellerId - Reseller ID
 * @param {string} userId - User ID
 * @param {number} amount - Amount to recharge
 * @param {object} metadata - Additional metadata (ipAddress, notes, etc.)
 * @returns {object} Recharge result
 */
exports.resellerRechargeUser = async (resellerId, userId, amount, metadata = {}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate inputs
    if (!resellerId || !userId || !amount) {
      throw new Error("Missing required parameters: resellerId, userId, amount");
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // Fetch reseller and user concurrently
    const [reseller, user] = await Promise.all([
      Reseller.findById(resellerId).session(session),
      User.findById(userId).session(session),
    ]);

    if (!reseller) {
      throw new Error("Reseller not found");
    }

    if (!user) {
      throw new Error("User not found");
    }

    // Check reseller has sufficient coins
    const resellerBalanceBefore = reseller.coin || 0;
    if (resellerBalanceBefore < amount) {
      throw new Error(`Insufficient coins. Available: ${resellerBalanceBefore}, Requested: ${amount}`);
    }

    // Get user's previous balance
    const userBalanceBefore = user.coin || 0;

    // Deduct coins from reseller
    reseller.coin = resellerBalanceBefore - amount;
    const resellerBalanceAfter = reseller.coin;

    // Add coins to user
    user.coin = userBalanceBefore + amount;
    user.rechargedCoins = (user.rechargedCoins || 0) + amount;
    
    // Calculate and add spins
    const spinsToAdd = spinsForPurchaseAmount(amount);
    user.spins = (user.spins || 0) + spinsToAdd;

    const userBalanceAfter = user.coin;

    // Save both
    await Promise.all([
      reseller.save({ session }),
      user.save({ session }),
    ]);

    // Create recharge record
    const recharge = new Recharge({
      uniqueId: `RCH_${uuidv4()}`,
      userId,
      resellerId,
      amount,
      status: RECHARGE_STATUS.COMPLETED,
      resellerBalanceBefore,
      resellerBalanceAfter,
      userBalanceBefore,
      userBalanceAfter,
      completedAt: new Date(),
      reason: "User Recharge via Reseller",
      notes: metadata.notes || "",
      ipAddress: metadata.ipAddress || "",
      userAgent: metadata.userAgent || "",
    });

    await recharge.save({ session });
    const historyUniqueId = await generateHistoryUniqueId();
    // Create history record for audit trail
    const history = new History({
      uniqueId: historyUniqueId,
      type: HISTORY_TYPE.RESELLER_RECHARGE_USER,
      userId,
      userCoin: amount,
      reason: `Reseller recharged user with ${amount} coins`,
      payoutStatus: 0, // Completed
    });

    await history.save({ session });

    // Link history to recharge
    recharge.historyId = history._id;
    await recharge.save({ session });

    // Commit transaction
    await session.commitTransaction();

    return {
      success: true,
      data: {
        recharge,
        history,
        reseller: {
          _id: reseller._id,
          coin: reseller.coin,
          balanceBefore: resellerBalanceBefore,
          balanceAfter: resellerBalanceAfter,
        },
        user: {
          _id: user._id,
          coin: user.coin,
          balanceBefore: userBalanceBefore,
          balanceAfter: userBalanceAfter,
        },
      },
      message: `Successfully recharged user with ${amount} coins`,
    };
  } catch (error) {
    await session.abortTransaction();
    return {
      success: false,
      error: error.message,
      message: `Failed to recharge user: ${error.message}`,
    };
  } finally {
    session.endSession();
  }
};

/**
 * Get coin transaction history for reseller
 * @param {string} resellerId - Reseller ID
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 20)
 * @returns {object} Transaction history
 */
exports.getResellerCoinHistory = async (resellerId, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;

    const transactions = await CoinTransaction.find({
      resellerId,
    })
      .populate("performedBy", "name email")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await CoinTransaction.countDocuments({ resellerId });

    return {
      success: true,
      data: {
        transactions,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: transactions.length,
          total_items: total,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get recharge history for reseller
 * @param {string} resellerId - Reseller ID
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 20)
 * @returns {object} Recharge history
 */
exports.getResellerRechargeHistory = async (resellerId, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;

    const recharges = await Recharge.find({
      resellerId,
    })
      .populate("userId", "name uniqueId coin")
      .populate("resellerId", "name coin")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Recharge.countDocuments({ resellerId });

    // Calculate summary stats
    const stats = await Recharge.aggregate([
      { $match: { resellerId: new mongoose.Types.ObjectId(resellerId) } },
      {
        $group: {
          _id: "$status",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      success: true,
      data: {
        recharges,
        stats,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: recharges.length,
          total_items: total,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = exports;
