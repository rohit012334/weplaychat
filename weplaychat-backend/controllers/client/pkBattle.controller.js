const PKBattle = require("../../models/pkBattle.model");
const BattleInvitation = require("../../models/BattleInvitation.model");
const GiftDuringBattle = require("../../models/GiftDuringBattle.model");
const Gift = require("../../models/gift.model");
const BattleStats = require("../../models/BattleStats.model");
const Host = require("../../models/host.model");
const { addUserExp, addHostExp } = require("../../util/levelManager");

async function createAndStartBattle({ host1Id, host2Id, duration = 5 }) {
  const [host1, host2] = await Promise.all([
    Host.findById(host1Id).populate("userId", "isVip").lean(),
    Host.findById(host2Id).populate("userId", "isVip").lean(),
  ]);

  const battle = new PKBattle({
    battleType: "random",
    host1Id,
    host2Id,
    duration,
    status: "active",
    startTime: new Date(),
    endTime: new Date(Date.now() + duration * 60 * 1000),
    host1Coins: 0,
    host2Coins: 0,
  });

  await battle.save();

  await Host.updateMany({ _id: { $in: [host1Id, host2Id] } }, { isInPK: true });

  setTimeout(
    () => {
      endBattle(battle._id);
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

async function endBattle(battleId) {
  const battle = await PKBattle.findById(battleId);

  if (!battle || battle.status !== "active") return;

  let winner = null;

  if (battle.host1Coins > battle.host2Coins) {
    winner = battle.host1Id;
  } else if (battle.host2Coins > battle.host1Coins) {
    winner = battle.host2Id;
  } else {
    winner = null; // draw
  }

  battle.status = "completed";
  battle.winner = winner;
  battle.endTime = new Date();

  await battle.save();

  // free hosts
  await Host.updateMany(
    { _id: { $in: [battle.host1Id, battle.host2Id] } },
    { isInPK: false },
  );

  // socket emit
  global.io?.to(`battle:${battle._id}`).emit("battleEnded", {
    winner,
    host1Coins: battle.host1Coins,
    host2Coins: battle.host2Coins,
  });
}

// ========== INVITATION ENDPOINTS ==========

// Send invitation to another host
exports.sendInvitation = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const hostId = req.user.hostId;

    if (!hostId) {
      return res
        .status(403)
        .json({
          status: false,
          message: "Host account required for PK battles.",
        });
    }

    const { toHostId, duration } = req.body;

    if (!toHostId) {
      return res
        .status(200)
        .json({ status: false, message: "toHostId is required." });
    }

    const senderHost = await Host.findById(hostId);
    if (senderHost._id.toString() === toHostId) {
      return res
        .status(200)
        .json({ status: false, message: "Cannot invite yourself." });
    }

    console.log("Sender Host:", senderHost);
    if (!senderHost.isLive) {
      return res.status(200).json({
        status: false,
        message: "You must be live to send invitations.",
      });
    }

    // Check for existing pending invitations
    const existingInvite = await BattleInvitation.findOne({
      fromHostId: senderHost._id,
      toHostId: toHostId,
      status: "pending",
    });

    if (existingInvite) {
      return res.status(200).json({
        status: false,
        message: "Invitation already sent to this host.",
      });
    }

    // Create invitation
    const invitation = new BattleInvitation({
      fromHostId: senderHost._id,
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
    const userId = req.user.userId;
    const hostId = req.user.hostId;

    if (!hostId) {
      return res
        .status(403)
        .json({
          status: false,
          message: "Host account required for PK battles.",
        });
    }

    const invitations = await BattleInvitation.find({
      toHostId: hostId,
      status: "pending",
    })
      .populate("fromHostId", "name image uniqueId")
      .sort({ createdAt: -1 });
    console.log("Pending invitations for hostId", hostId, invitations);

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
    const hostId = req.user.hostId;

    if (!hostId) {
      return res
        .status(403)
        .json({
          status: false,
          message: "Host account required for PK battles.",
        });
    }

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

    if (invitation.toHostId.toString() !== hostId.toString()) {
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

    // 4. Create battle
    const battle = await createAndStartBattle({
      host1Id: host1._id,
      host2Id: host2._id,
      duration,
    });

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
    const hostId = req.user.hostId;

    if (!hostId) {
      return res
        .status(403)
        .json({
          status: false,
          message: "Host account required for PK battles.",
        });
    }

    const { inviteId } = req.params;

    const invitation = await BattleInvitation.findById(inviteId);

    if (!invitation) {
      return res
        .status(200)
        .json({ status: false, message: "Invitation not found." });
    }

    if (invitation.toHostId.toString() !== hostId.toString()) {
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
    const hostId = req.user.hostId;

    if (!hostId) {
      return res
        .status(403)
        .json({
          status: false,
          message: "Host account required for PK battles.",
        });
    }

    const { inviteId } = req.params;
    const invitation = await BattleInvitation.findById(inviteId);

    if (!invitation) {
      return res
        .status(200)
        .json({ status: false, message: "Invitation not found." });
    }

    if (invitation.fromHostId.toString() !== hostId.toString()) {
      return res.status(200).json({
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
    const hostId = req.user.hostId;

    if (!hostId) {
      return res
        .status(403)
        .json({
          status: false,
          message: "Host account required for PK battles.",
        });
    }

    const duration = req.body.duration || 5;

    // 1. Check host
    const host = await Host.findById(hostId);

    console.log("Host trying to join random match:", host);
    if (!host || !host.isLive) {
      return res.json({
        status: false,
        message: "Host must be live.",
      });
    }

    // 2. Find available opponent (live + not in battle)
    const opponentHost = await Host.aggregate([
      {
        $match: {
          _id: { $ne: hostId },
          isLive: true,
        },
      },
      {
        $lookup: {
          from: "pkbattles",
          let: { hostId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $or: [
                        { $eq: ["$host1Id", "$$hostId"] },
                        { $eq: ["$host2Id", "$$hostId"] },
                      ],
                    },
                    { $in: ["$status", ["pending", "active"]] },
                  ],
                },
              },
            },
          ],
          as: "activeBattle",
        },
      },
      {
        $match: {
          activeBattle: { $eq: [] },
        },
      },
      { $sample: { size: 1 } },
    ]);

    if (!opponentHost.length) {
      return res.json({
        status: false,
        message: "No available opponent found.",
      });
    }

    const opponentId = opponentHost[0]._id;

    // 3. FINAL SAFETY CHECK (important)
    const alreadyInBattle = await PKBattle.findOne({
      $or: [{ host1Id: opponentId }, { host2Id: opponentId }],
      status: { $in: ["pending", "active"] },
    });

    if (alreadyInBattle) {
      return res.json({
        status: false,
        message: "Opponent just got busy, try again.",
      });
    }

    // 4. Create battle
    const battle = await createAndStartBattle({
      host1Id: host._id,
      host2Id: opponentId,
      duration,
    });

    // 5. Emit socket
    if (global.io) {
      global.io.to(hostId.toString()).emit("battleFound", battle);
      global.io.to(opponentId.toString()).emit("battleFound", battle);
    }

    return res.json({
      status: true,
      message: "Matched successfully",
      data: battle,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
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
    const userId = req.user.userId;
    const hostId = req.user.hostId;

    if (!hostId) {
      return res
        .status(403)
        .json({
          status: false,
          message: "Host account required for PK battles.",
        });
    }

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
      battle.host1Id.toString() !== hostId.toString() &&
      battle.host2Id.toString() !== hostId.toString()
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
exports.endBattle = async (req, res) => {
  try {
    const { battleId } = req.params;

    if (!battleId) {
      return res.status(400).json({
        status: false,
        message: "Battle ID is required."
      });
    }

    const battle = await endBattle(battleId);

    if (!battle) {
      return res.status(400).json({
        status: false,
        message: "Battle not found or already ended"
      });
    }

    return res.status(200).json({
      status: true,
      message: "Battle ended successfully",
      winner: battle.winner
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error"
    });
  }
};

// Send gift during battle
exports.sendGiftDuringBattle = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const hostId = req.user.hostId;

    if (!hostId) {
      return res
        .status(403)
        .json({
          status: false,
          message: "Host account required for PK battles.",
        });
    }

    const { battleId } = req.params;
    const { giftId, recipientHostId, count = 1 } = req.body;

    if (!giftId || !recipientHostId) {
      return res.status(200).json({
        status: false,
        message: "giftId and recipientHostId are required.",
      });
    }

    const battle = await PKBattle.findById(battleId);

    if (!battle) {
      return res
        .status(200)
        .json({ status: false, message: "Battle not found." });
    }

    if (battle.status !== "active") {
      return res
        .status(200)
        .json({ status: false, message: "Battle is not active." });
    }

    // Verify recipient is in this battle
    if (
      recipientHostId !== battle.host1Id.toString() &&
      recipientHostId !== battle.host2Id.toString()
    ) {
      return res
        .status(200)
        .json({ status: false, message: "Recipient is not in this battle." });
    }

    // Fetch gift details
    const gift = await Gift.findById(giftId).select("coin").lean();
    if (!gift) {
      return res
        .status(200)
        .json({ status: false, message: "Gift not found." });
    }

    const giftValue = gift.coin || 0;

    // Create gift record
    const giftRecord = new GiftDuringBattle({
      battleId: battleId,
      senderId: userId,
      recipientHostId: recipientHostId,
      giftId: giftId,
      giftValue: giftValue,
      count: count,
      totalValue: giftValue * count,
    });

    await giftRecord.save();

    // Update total gifts value in battle
    battle.totalGiftsValue += giftRecord.totalValue;

    if (recipientHostId === battle.host1Id.toString()) {
      battle.host1Coins += giftRecord.totalValue;
    } else {
      battle.host2Coins += giftRecord.totalValue;
    }

    await battle.save();

    // Add EXP for leveling (1 coin = 1 EXP)
    try {
      // Sender (user) gains EXP
      await addUserExp(userId, giftRecord.totalValue);

      // Receiver (host) gains EXP
      await addHostExp(recipientHostId, giftRecord.totalValue);
    } catch (expError) {
      console.error("Error adding EXP:", expError);
      // Don't fail the gift if EXP fails
    }

    return res.status(200).json({
      status: true,
      message: "Gift sent successfully.",
      data: giftRecord,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error" });
  }
};

// ========== STATS ENDPOINTS ==========

// Get host battle stats
exports.getHostStats = async (req, res, next) => {
  try {
    const { hostId } = req.params;
    const userHostId = req.user.hostId;

    if (!userHostId) {
      return res
        .status(403)
        .json({
          status: false,
          message: "Host account required for PK battles.",
        });
    }

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
