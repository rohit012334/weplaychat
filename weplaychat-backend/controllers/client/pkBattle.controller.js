const PKBattle = require("../../models/pkBattle.model");
const BattleQueue = require("../../models/BattleQueue.model");
const BattleInvitation = require("../../models/BattleInvitation.model");
const GiftDuringBattle = require("../../models/GiftDuringBattle.model");
const Gift = require("../../models/gift.model");
const BattleStats = require("../../models/BattleStats.model");
const Host = require("../../models/host.model");
const User = require("../../models/user.model");
const History = require("../../models/history.model");
const Agency = require("../../models/agency.model");
const { addUserExp, addHostExp } = require("../../util/levelManager");
const generateHistoryUniqueId = require("../../util/generateHistoryUniqueId");
const { HISTORY_TYPE } = require("../../types/constant");
const mongoose = require("mongoose");

async function createAndStartBattle({ host1Id, host2Id, duration = 5 }) {
  const [host1, host2] = await Promise.all([
    Host.findById(host1Id).populate("userId", "isVip").lean(),
    Host.findById(host2Id).populate("userId", "isVip").lean(),
  ]);

  // const baseHealth = 100;
  // const vipBonus = 50;
  // const host1Health = host1?.userId?.isVip ? baseHealth + vipBonus : baseHealth;
  // const host2Health = host2?.userId?.isVip ? baseHealth + vipBonus : baseHealth;

  const battle = new PKBattle({
    battleType: "random",
    host1Id,
    host2Id,
    duration,
    status: "active",
    startTime: new Date(),
    endTime: new Date(Date.now() + duration * 60 * 1000),
    // host1Health,
    // host2Health,
    host1Coins: 0,
    host2Coins: 0,
  });

  await battle.save();

  setTimeout(
    async () => {
      try {
        const currentBattle = await PKBattle.findById(battle._id);
        if (!currentBattle || currentBattle.status !== "active") return;

        if (currentBattle.host1Coins > currentBattle.host2Coins) {
          currentBattle.winner = currentBattle.host1Id;
        } else if (currentBattle.host2Coins > currentBattle.host1Coins) {
          currentBattle.winner = currentBattle.host2Id;
        } else {
          currentBattle.winner =
            Math.random() < 0.5 ? currentBattle.host1Id : currentBattle.host2Id;
        }

        currentBattle.status = "completed";
        currentBattle.endTime = new Date();
        await currentBattle.save();

        if (global.io) {
          global.io.to(`battle:${battle._id}`).emit("battleEnded", {
            winner: currentBattle.winner,
            host1Coins: currentBattle.host1Coins,
            host2Coins: currentBattle.host2Coins,
            endTime: currentBattle.endTime,
          });
        }
      } catch (error) {
        console.error("Auto-end battle error:", error);
      }
    },
    duration * 60 * 1000,
  );

  if (global.io) {
    global.io.to(`battle:${battle._id}`).emit("battleStarted", {
      battleId: battle._id,
      startTime: battle.startTime,
      endTime: battle.endTime,
    });
  }

  return battle;
}

// ========== INVITATION ENDPOINTS ==========

// Send invitation to another host
exports.sendInvitation = async (req, res, next) => {
  try {
    const hostId = req.user.userId;
    const { toHostId, duration } = req.body;

    if (!toHostId) {
      return res
        .status(200)
        .json({ status: false, message: "toHostId is required." });
    }

    if (hostId === toHostId) {
      return res
        .status(200)
        .json({ status: false, message: "Cannot invite yourself." });
    }

    // Check if target host exists and is live
    const targetHost = await Host.findById(toHostId);
    if (!targetHost) {
      return res
        .status(200)
        .json({ status: false, message: "Target host not found." });
    }

    if (!targetHost.isLive) {
      return res
        .status(200)
        .json({
          status: false,
          message: "Target host must be live to receive invitations.",
        });
    }

    // Check if sender is live
    const senderHost = await Host.findOne({ userId: hostId });

    console.log("Sender Host:", senderHost);
    if (!senderHost.isLive) {
      return res
        .status(200)
        .json({
          status: false,
          message: "You must be live to send invitations.",
        });
    }

    // Check for existing pending invitations
    const existingInvite = await BattleInvitation.findOne({
      fromHostId: hostId,
      toHostId: toHostId,
      status: "pending",
    });

    if (existingInvite) {
      return res
        .status(200)
        .json({
          status: false,
          message: "Invitation already sent to this host.",
        });
    }

    // Create invitation
    const invitation = new BattleInvitation({
      fromHostId: hostId,
      toHostId: toHostId,
      duration: duration || 5, // Default to 5 minutes if not provided
    });

    await invitation.save();

    return res.status(200).json({
      status: true,
      message: "Invitation sent successfully.",
      data: invitation,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error" });
  }
};

// Get pending invitations for current host
exports.getPendingInvitations = async (req, res, next) => {
  try {
    const hostId = req.user.userId;

    const invitations = await BattleInvitation.find({
      toHostId: hostId,
      status: "pending",
    })
      .populate("fromHostId", "name image uniqueId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: true,
      message: "Pending invitations retrieved.",
      data: invitations,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error" });
  }
};

// Accept invitation and start battle
exports.acceptInvitation = async (req, res, next) => {
  try {
    const hostId = req.user.userId;
    const { inviteId } = req.params;

    const invitation = await BattleInvitation.findById(inviteId);

    if (!invitation) {
      return res
        .status(200)
        .json({ status: false, message: "Invitation not found." });
    }

    if (invitation.status !== "pending") {
      return res
        .status(200)
        .json({ status: false, message: "Invitation is no longer pending." });
    }

    if (invitation.toHostId.toString() !== hostId) {
      return res
        .status(200)
        .json({ status: false, message: "This invitation is not for you." });
    }

    // Fetch hosts and their users to check VIP
    const [host1, host2] = await Promise.all([
      Host.findById(invitation.fromHostId).populate("userId", "isVip").lean(),
      Host.findById(invitation.toHostId).populate("userId", "isVip").lean(),
    ]);

    if (!host1 || !host2) {
      return res
        .status(200)
        .json({ status: false, message: "Host not found." });
    }

    // // Set health based on VIP status
    // const baseHealth = 100;
    // const vipBonus = 50; // VIP gets +50 health
    // const host1Health = host1.userId?.isVip ? baseHealth + vipBonus : baseHealth;
    // const host2Health = host2.userId?.isVip ? baseHealth + vipBonus : baseHealth;

    // Create and start battle immediately
    const battle = new PKBattle({
      battleType: "invite",
      host1Id: invitation.fromHostId,
      host2Id: invitation.toHostId,
      duration: invitation.duration,
      status: "active",
      startTime: new Date(),
    });
    battle.endTime = new Date(
      battle.startTime.getTime() + battle.duration * 60 * 1000,
    );

    await battle.save();

    // Update invitation
    invitation.status = "accepted";
    invitation.battleId = battle._id;
    invitation.respondedAt = new Date();
    await invitation.save();

    // Auto-end battle after duration
    setTimeout(
      async () => {
        try {
          const currentBattle = await PKBattle.findById(battle._id);
          if (currentBattle && currentBattle.status === "active") {
            // Reuse endBattle logic
            const req = { params: { battleId: battle._id } };
            const res = { status: () => ({ json: () => {} }) };
            await exports.endBattle(req, res);
          }
        } catch (error) {
          console.error("Auto-end battle error:", error);
        }
      },
      battle.duration * 60 * 1000,
    );

    // Emit battle started
    if (global.io) {
      global.io.to(`battle:${battle._id}`).emit("battleStarted", {
        battleId: battle._id,
        startTime: battle.startTime,
        endTime: battle.endTime,
      });
    }

    return res.status(200).json({
      status: true,
      message: "Invitation accepted. Battle started.",
      data: { battle, invitation },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error" });
  }
};

// Reject invitation
exports.rejectInvitation = async (req, res, next) => {
  try {
    const hostId = req.user.userId;
    const { inviteId } = req.params;

    const invitation = await BattleInvitation.findById(inviteId);

    if (!invitation) {
      return res
        .status(200)
        .json({ status: false, message: "Invitation not found." });
    }

    if (invitation.toHostId.toString() !== hostId) {
      return res
        .status(200)
        .json({ status: false, message: "This invitation is not for you." });
    }

    invitation.status = "rejected";
    invitation.respondedAt = new Date();
    await invitation.save();

    return res.status(200).json({
      status: true,
      message: "Invitation rejected.",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error" });
  }
};

// Cancel invitation (only sender can cancel)
exports.cancelInvitation = async (req, res, next) => {
  try {
    const hostId = req.user.userId;
    const { inviteId } = req.params;

    const invitation = await BattleInvitation.findById(inviteId);

    if (!invitation) {
      return res
        .status(200)
        .json({ status: false, message: "Invitation not found." });
    }

    if (invitation.fromHostId.toString() !== hostId) {
      return res
        .status(200)
        .json({
          status: false,
          message: "You can only cancel invitations you sent.",
        });
    }

    if (invitation.status !== "pending") {
      return res
        .status(200)
        .json({ status: false, message: "Cannot cancel this invitation." });
    }

    invitation.status = "cancelled";
    await invitation.save();

    return res.status(200).json({
      status: true,
      message: "Invitation cancelled.",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error" });
  }
};

// ========== RANDOM MATCH ENDPOINTS ==========

exports.joinRandomMatch = async (req, res) => {
  try {
    const hostId = req.user.userId;
    const duration = req.body.duration || 5;

    // 1. Check if host exists and is live
    const host = await Host.findById(hostId);
    if (!host || !host.isLive) {
      return res.json({ status: false, message: "Host must be live to join PK Battle." });
    }

    // 2. Check if already in queue or active battle
    const existingQueue = await BattleQueue.findOne({ hostId, status: { $in: ["waiting", "matched"] } });
    if (existingQueue) {
      return res.json({ status: false, message: "You are already in the matching queue.", data: existingQueue });
    }

    const activeBattle = await PKBattle.findOne({
      $or: [{ host1Id: hostId }, { host2Id: hostId }],
      status: { $in: ["pending", "active"] },
    });
    if (activeBattle) {
      return res.json({ status: false, message: "You are already in a battle." });
    }

    // 3. Find waiting opponent
    const opponentQueue = await BattleQueue.findOne({
      hostId: { $ne: hostId },
      status: "waiting",
      duration: duration
    }).sort({ createdAt: 1 });

    if (opponentQueue) {
      // Match found!
      const opponentId = opponentQueue.hostId;
      
      // Create match entry for current host
      const myQueue = new BattleQueue({
        hostId,
        status: "matched",
        matchedHostId: opponentId,
        duration
      });
      await myQueue.save();

      // Update opponent queue
      opponentQueue.status = "matched";
      opponentQueue.matchedHostId = hostId;
      await opponentQueue.save();

      // Emit socket event to both hosts
      if (global.io) {
        global.io.to(hostId.toString()).emit("battleMatched", { queueId: myQueue._id, opponentId: opponentId });
        global.io.to(opponentId.toString()).emit("battleMatched", { queueId: opponentQueue._id, opponentId: hostId });
      }

      return res.json({
        status: true,
        message: "Match found!",
        data: { queueId: myQueue._id, opponent: opponentId }
      });
    } else {
      // No opponent, join queue
      const newQueue = new BattleQueue({
        hostId,
        status: "waiting",
        duration
      });
      await newQueue.save();

      return res.json({
        status: true,
        message: "Joined queue, waiting for opponent.",
        data: newQueue
      });
    }
  } catch (error) {
    console.error("Join Random Match Error:", error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

// Accept random match
exports.acceptRandomMatch = async (req, res, next) => {
  try {
    const hostId = req.user.userId;
    const { queueId } = req.params;

    const queue = await BattleQueue.findById(queueId);

    if (!queue) {
      return res
        .status(200)
        .json({ status: false, message: "Queue entry not found." });
    }

    if (queue.status !== "matched") {
      return res
        .status(200)
        .json({
          status: false,
          message: "No match found for this queue entry.",
        });
    }

    if (queue.hostId.toString() !== hostId) {
      return res
        .status(200)
        .json({ status: false, message: "This queue entry is not yours." });
    }

    // Fetch hosts and their users to check VIP
    const [host1, host2] = await Promise.all([
      Host.findById(queue.hostId).populate("userId", "isVip").lean(),
      Host.findById(queue.matchedHostId).populate("userId", "isVip").lean(),
    ]);

    if (!host1 || !host2) {
      return res
        .status(200)
        .json({ status: false, message: "Host not found." });
    }

    // Set health based on VIP status
    const baseHealth = 100;
    const vipBonus = 50;
    const host1Health = host1.userId?.isVip
      ? baseHealth + vipBonus
      : baseHealth;
    const host2Health = host2.userId?.isVip
      ? baseHealth + vipBonus
      : baseHealth;

    // Create battle with matched opponent
    const battle = new PKBattle({
      battleType: "random",
      host1Id: queue.hostId,
      host2Id: queue.matchedHostId,
      status: "active",
      startTime: new Date(),
      duration: queue.duration || 5
    });
    battle.endTime = new Date(battle.startTime.getTime() + battle.duration * 60 * 1000);

    await battle.save();

    // Update queue entries
    queue.status = "cancelled";
    await queue.save();

    const matchedQueue = await BattleQueue.findOne({
      hostId: queue.matchedHostId,
      status: "matched",
    });

    if (matchedQueue) {
      matchedQueue.status = "cancelled";
      await matchedQueue.save();
    }

    // Auto-end battle after duration
    setTimeout(async () => {
      try {
        const currentBattle = await PKBattle.findById(battle._id);
        if (currentBattle && currentBattle.status === "active") {
           // Reuse endBattle logic (internal call or similar)
           const req = { params: { battleId: battle._id } };
           const res = { status: () => ({ json: () => {} }) };
           await exports.endBattle(req, res);
        }
      } catch (err) { console.error("Auto-end timer error:", err); }
    }, battle.duration * 60 * 1000);

    // Emit battle started
    if (global.io) {
      global.io.to(`battle:${battle._id}`).emit("battleStarted", {
        battleId: battle._id,
        startTime: battle.startTime,
        endTime: battle.endTime,
        host1Id: battle.host1Id,
        host2Id: battle.host2Id
      });
    }

    return res.status(200).json({
      status: true,
      message: "Match accepted. Battle started.",
      data: battle,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error" });
  }
};

// Reject random match
exports.rejectRandomMatch = async (req, res, next) => {
  try {
    const hostId = req.user.userId;
    const { queueId } = req.params;

    const queue = await BattleQueue.findById(queueId);

    if (!queue) {
      return res
        .status(200)
        .json({ status: false, message: "Queue entry not found." });
    }

    if (queue.hostId.toString() !== hostId) {
      return res
        .status(200)
        .json({ status: false, message: "This queue entry is not yours." });
    }

    // Reset both queue entries
    queue.status = "waiting";
    queue.matchedHostId = null;
    await queue.save();

    if (queue.matchedHostId) {
      const matchedQueue = await BattleQueue.findOne({
        hostId: queue.matchedHostId,
        status: "matched",
      });

      if (matchedQueue) {
        matchedQueue.status = "waiting";
        matchedQueue.matchedHostId = null;
        await matchedQueue.save();
      }
    }

    return res.status(200).json({
      status: true,
      message: "Match rejected. Waiting for new match.",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error" });
  }
};

// Leave queue
exports.leaveQueue = async (req, res, next) => {
  try {
    const hostId = req.user.userId;

    const queue = await BattleQueue.findOne({
      hostId: hostId,
      status: { $in: ["waiting", "matched"] },
    });

    if (!queue) {
      return res
        .status(200)
        .json({ status: false, message: "You are not in the queue." });
    }

    queue.status = "cancelled";
    await queue.save();

    return res.status(200).json({
      status: true,
      message: "Left the queue.",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error" });
  }
};

// ========== BATTLE ENDPOINTS ==========

// Get battle details
exports.getBattleDetails = async (req, res, next) => {
  try {
    const { battleId } = req.params;

    const battle = await PKBattle.findById(battleId)
      .populate("host1Id", "name image uniqueId coin")
      .populate("host2Id", "name image uniqueId coin")
      // .populate("currentTurn", "name")
      .populate("winner", "name");

    if (!battle) {
      return res
        .status(200)
        .json({ status: false, message: "Battle not found." });
    }

    return res.status(200).json({
      status: true,
      message: "Battle details retrieved.",
      data: battle,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error" });
  }
};

// Start battle (set to active)
exports.startBattle = async (req, res, next) => {
  try {
    const hostId = req.user.userId;
    const { battleId } = req.params;

    const battle = await PKBattle.findById(battleId);

    if (!battle) {
      return res
        .status(200)
        .json({ status: false, message: "Battle not found." });
    }

    if (battle.status !== "pending") {
      return res
        .status(200)
        .json({ status: false, message: "Battle is not pending." });
    }

    // Verify host is in the battle
    if (
      battle.host1Id.toString() !== hostId &&
      battle.host2Id.toString() !== hostId
    ) {
      return res
        .status(200)
        .json({ status: false, message: "You are not in this battle." });
    }

    battle.status = "active";
    battle.startTime = new Date();
    battle.endTime = new Date(
      battle.startTime.getTime() + battle.duration * 60 * 1000,
    );
    await battle.save();

    // Auto-end battle after duration
    setTimeout(
      async () => {
        try {
          const currentBattle = await PKBattle.findById(battleId);
          if (currentBattle && currentBattle.status === "active") {
            // Call endBattle logic
            if (currentBattle.host1Coins > currentBattle.host2Coins) {
              currentBattle.winner = currentBattle.host1Id;
            } else if (currentBattle.host2Coins > currentBattle.host1Coins) {
              currentBattle.winner = currentBattle.host2Id;
            } else {
              currentBattle.winner =
                Math.random() < 0.5
                  ? currentBattle.host1Id
                  : currentBattle.host2Id;
            }
            currentBattle.status = "completed";
            currentBattle.endTime = new Date();
            await currentBattle.save();

            const io = global.io; // Assuming io is global
            if (io) {
              io.to(`battle:${battleId}`).emit("battleEnded", {
                winner: currentBattle.winner,
                host1Coins: currentBattle.host1Coins,
                host2Coins: currentBattle.host2Coins,
                endTime: currentBattle.endTime,
              });
            }
          }
        } catch (error) {
          console.error("Auto-end battle error:", error);
        }
      },
      battle.duration * 60 * 1000,
    );

    return res.status(200).json({
      status: true,
      message: "Battle started.",
      data: battle,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error" });
  }
};

// End battle (called when duration reached or manually)
exports.endBattle = async (req, res, next) => {
  try {
    const { battleId } = req.params;

    const battle = await PKBattle.findById(battleId);

    if (!battle) {
      return res.status(200).json({ status: false, message: "Battle not found." });
    }

    if (battle.status !== "active") {
      return res.status(200).json({ status: false, message: "Battle is not active." });
    }

    // Determine winner based on coins
    if (battle.host1Coins > battle.host2Coins) {
      battle.winner = battle.host1Id;
    } else if (battle.host2Coins > battle.host1Coins) {
      battle.winner = battle.host2Id;
    } else {
      // Tie: random winner
      battle.winner = Math.random() < 0.5 ? battle.host1Id : battle.host2Id;
    }

    battle.status = "completed";
    battle.endTime = new Date();
    await battle.save();

    // Update statistics for both hosts
    await updateBattleStats(battle);

    // Emit battle ended via socket
    const io = global.io;
    if (io) {
      io.to(`battle:${battleId}`).emit("battleEnded", {
        winner: battle.winner,
        host1Coins: battle.host1Coins,
        host2Coins: battle.host2Coins,
        endTime: battle.endTime,
      });
    }

    return res.status(200).json({
      status: true,
      message: "Battle ended.",
      data: battle,
    });
  } catch (error) {
    console.error("End Battle Error:", error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

async function updateBattleStats(battle) {
  try {
    const { host1Id, host2Id, winner, host1Coins, host2Coins } = battle;

    // Helper for updating individual host stats
    const updateHost = async (hostId, isWinner, coins) => {
      let stats = await BattleStats.findOne({ hostId });
      if (!stats) stats = new BattleStats({ hostId });

      stats.totalBattles += 1;
      if (isWinner) {
        stats.wins += 1;
        stats.winStreak += 1;
      } else {
        stats.losses += 1;
        stats.winStreak = 0;
      }
      stats.totalCoinsEarned += coins;
      stats.winRate = (stats.wins / stats.totalBattles) * 100;
      stats.lastBattleDate = new Date();
      await stats.save();
    };

    await Promise.all([
      updateHost(host1Id, winner.toString() === host1Id.toString(), host1Coins),
      updateHost(host2Id, winner.toString() === host2Id.toString(), host2Coins),
    ]);
  } catch (error) {
    console.error("Update Battle Stats Error:", error);
  }
}

// Host performs action (attack, defend, etc.)
// exports.performAction = async (req, res, next) => {
//   try {
//     const hostId = req.user.userId;
//     const { battleId } = req.params;
//     const { actionType } = req.body; // attack, defend, special

//     const battle = await PKBattle.findById(battleId);

//     if (!battle) {
//       return res.status(200).json({ status: false, message: "Battle not found." });
//     }

//     if (battle.status !== "active") {
//       return res.status(200).json({ status: false, message: "Battle is not active." });
//     }

//     // Verify it's this host's turn
//     if (battle.currentTurn.toString() !== hostId) {
//       return res.status(200).json({ status: false, message: "It's not your turn." });
//     }

//     // Fetch host to check VIP for damage bonus
//     const host = await Host.findById(hostId).populate("userId", "isVip").lean();
//     const isVip = host?.userId?.isVip || false;
//     const damageMultiplier = isVip ? 1.2 : 1.0; // VIP deals 20% more damage

//     // Calculate damage based on action type
//     let damage = 0;
//     switch (actionType) {
//       case "attack":
//         damage = 15 * damageMultiplier;
//         break;
//       case "strongAttack":
//         damage = 25 * damageMultiplier;
//         break;
//       case "special":
//         damage = 35 * damageMultiplier;
//         break;
//       case "defend":
//         damage = 0; // Defend reduces incoming damage
//         break;
//       default:
//         return res.status(200).json({ status: false, message: "Invalid action type." });
//     }

//     // Apply damage to opponent
//     if (battle.host1Id.toString() === hostId) {
//       battle.host2Health = Math.max(battle.host2Health - Math.floor(damage), 0);
//     } else {
//       battle.host1Health = Math.max(battle.host1Health - Math.floor(damage), 0);
//     }

//     // Switch turn
//     battle.currentTurn = battle.host1Id.toString() === hostId ? battle.host2Id : battle.host1Id;

//     // Check for winner
//     if (battle.host1Health <= 0) {
//       battle.winner = battle.host2Id;
//       battle.status = "completed";
//       battle.endTime = new Date();
//     } else if (battle.host2Health <= 0) {
//       battle.winner = battle.host1Id;
//       battle.status = "completed";
//       battle.endTime = new Date();
//     }

//     await battle.save();

//     return res.status(200).json({
//       status: true,
//       message: "Action performed.",
//       data: battle
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ status: false, message: "Internal Server Error" });
//   }
// };

// Send gift during battle
exports.sendGiftDuringBattle = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { battleId } = req.params;
    const { giftId, recipientHostId, count = 1 } = req.body;

    if (!giftId || !recipientHostId) {
      return res.status(200).json({ status: false, message: "giftId and recipientHostId are required." });
    }

    const [battle, user, gift, recipientHost] = await Promise.all([
      PKBattle.findById(battleId),
      User.findById(userId).select("coin spentCoins name image"),
      Gift.findById(giftId).lean(),
      Host.findById(recipientHostId).select("agencyId coin")
    ]);

    if (!battle || battle.status !== "active") {
      return res.status(200).json({ status: false, message: "Battle not found or not active." });
    }

    if (!user) return res.status(200).json({ status: false, message: "User not found." });
    if (!gift) return res.status(200).json({ status: false, message: "Gift not found." });
    if (!recipientHost) return res.status(200).json({ status: false, message: "Recipient host not found." });

    // Verify recipient is in this battle
    if (recipientHostId !== battle.host1Id.toString() && recipientHostId !== battle.host2Id.toString()) {
      return res.status(200).json({ status: false, message: "Recipient is not in this battle." });
    }

    const totalGiftValue = (gift.coin || 0) * count;

    if (user.coin < totalGiftValue) {
      return res.status(200).json({ status: false, message: "Insufficient coins." });
    }

    // Commission logic
    const adminCommissionRate = (global.settingJSON && global.settingJSON.adminCommissionRate) ? global.settingJSON.adminCommissionRate : 10;
    const adminShare = (totalGiftValue * adminCommissionRate) / 100;
    const hostEarnings = totalGiftValue - adminShare;

    let agencyShare = 0;
    let agencyUpdate = null;
    if (recipientHost.agencyId) {
       const agency = await Agency.findById(recipientHost.agencyId).lean().select("_id commissionType commission");
       if (agency) {
          agencyShare = agency.commissionType === 1 ? (hostEarnings * agency.commission) / 100 : 0;
          agencyUpdate = Agency.updateOne({ _id: agency._id }, {
             $inc: {
               hostCoins: hostEarnings,
               totalEarnings: Math.floor(agencyShare),
               totalEarningsWithCommissionAndHostCoin: hostEarnings + Math.floor(agencyShare),
               netAvailableEarnings: hostEarnings + Math.floor(agencyShare)
             }
          });
       }
    }

    const uniqueId = await generateHistoryUniqueId();

    // Deduct from user, Add to host, Create history, Update battle
    await Promise.all([
      User.updateOne({ _id: userId }, { $inc: { coin: -totalGiftValue } }),
      Host.updateOne({ _id: recipientHostId }, { $inc: { coin: 0 } }), // Addition handled by addHostExp below
      History.create({
        uniqueId,
        type: HISTORY_TYPE.PK_BATTLE_GIFT,
        userId: userId,
        hostId: recipientHostId,
        agencyId: recipientHost.agencyId,
        giftId: giftId,
        giftCount: count,
        giftCoin: gift.coin,
        userCoin: totalGiftValue,
        hostCoin: hostEarnings,
        adminCoin: adminShare,
        date: new Date().toISOString()
      }),
      GiftDuringBattle.create({
        battleId,
        senderId: userId,
        recipientHostId,
        giftId,
        giftValue: gift.coin,
        count,
        totalValue: totalGiftValue
      }),
      agencyUpdate
    ]);

    // Update battle coins
    if (recipientHostId === battle.host1Id.toString()) {
      battle.host1Coins += totalGiftValue;
    } else {
      battle.host2Coins += totalGiftValue;
    }
    battle.totalGiftsValue += totalGiftValue;
    await battle.save();

    // Socket notify
    if (global.io) {
      global.io.to(`battle:${battleId}`).emit("giftReceived", {
        senderName: user.name,
        senderImage: user.image,
        giftName: gift.name,
        giftImage: gift.image,
        count,
        totalValue: totalGiftValue,
        recipientHostId,
        host1Coins: battle.host1Coins,
        host2Coins: battle.host2Coins
      });
    }

    // Add EXP
    await addUserExp(userId, totalGiftValue);
    await addHostExp(recipientHostId, totalGiftValue);

    return res.status(200).json({
      status: true,
      message: "Gift sent successfully.",
      data: { host1Coins: battle.host1Coins, host2Coins: battle.host2Coins }
    });
  } catch (error) {
    console.error("Send Gift During Battle Error:", error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

// ========== STATS ENDPOINTS ==========

// Get host battle stats
exports.getHostStats = async (req, res, next) => {
  try {
    const { hostId } = req.params;

    let stats = await BattleStats.findOne({ hostId: hostId });

    if (!stats) {
      // Create stats if not exists
      stats = new BattleStats({ hostId: hostId });
      await stats.save();
    }

    return res.status(200).json({
      status: true,
      message: "Host stats retrieved.",
      data: stats,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error" });
  }
};
