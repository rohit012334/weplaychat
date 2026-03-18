const mongoose = require("mongoose");

const User = require("../../models/user.model");
const SpinWheel = require("../../models/spinWheel.model");

async function getOrCreateSpinWheel() {
  let doc = await SpinWheel.findOne({ key: "default" }).lean();
  if (doc) return doc;

  doc = await SpinWheel.create({
    key: "default",
    slots: Array.from({ length: 8 }).map(() => ({
      label: "",
      rewardType: "none",
      rewardValue: 0,
      weight: 1,
      isActive: true,
    })),
  });
  return doc.toObject();
}

function pickWeightedSlotIndex(slots) {
  const active = slots
    .map((s, idx) => ({ s, idx }))
    .filter(({ s }) => s && s.isActive && Number(s.weight) > 0);

  if (!active.length) return -1;

  const total = active.reduce((sum, { s }) => sum + Number(s.weight || 0), 0);
  const r = Math.random() * total;

  let acc = 0;
  for (const item of active) {
    acc += Number(item.s.weight || 0);
    if (r <= acc) return item.idx;
  }
  return active[active.length - 1].idx;
}

exports.getSpinStatus = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ status: false, message: "Unauthorized access. Invalid token." });
    }

    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const [user, wheel] = await Promise.all([
      User.findById(userId).select("_id spins coin").lean(),
      getOrCreateSpinWheel(),
    ]);

    if (!user) return res.status(200).json({ status: false, message: "User not found." });

    return res.status(200).json({
      status: true,
      message: "Success",
      spins: user.spins || 0,
      wheel: { key: wheel.key, slots: wheel.slots },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

exports.playSpin = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ status: false, message: "Unauthorized access. Invalid token." });
    }

    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const wheel = await getOrCreateSpinWheel();

    // Atomically consume 1 spin if available
    const consumed = await User.findOneAndUpdate(
      { _id: userId, spins: { $gt: 0 } },
      { $inc: { spins: -1 } },
      { new: true }
    ).select("_id spins coin").lean();

    if (!consumed) {
      return res.status(200).json({ status: false, message: "No spins available." });
    }

    const slots = Array.isArray(wheel.slots) ? wheel.slots : [];
    const pickedIndex = pickWeightedSlotIndex(slots);
    const picked = pickedIndex >= 0 ? slots[pickedIndex] : null;

    let applied = { rewardType: "none", rewardValue: 0 };

    if (picked && picked.rewardType === "coin") {
      const value = Number(picked.rewardValue || 0);
      if (value > 0) {
        await User.updateOne({ _id: userId }, { $inc: { coin: value, rechargedCoins: 0 } });
        applied = { rewardType: "coin", rewardValue: value };
      }
    }

    return res.status(200).json({
      status: true,
      message: "Spin played.",
      slotIndex: pickedIndex,
      slot: picked,
      appliedReward: applied,
      spinsLeft: consumed.spins || 0,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

