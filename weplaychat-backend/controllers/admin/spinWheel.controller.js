const SpinWheel = require("../../models/spinWheel.model");

async function getOrCreateSpinWheel() {
  let doc = await SpinWheel.findOne({ key: "default" }).lean();
  if (doc) return doc;

  // Default: 8 empty slots
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

exports.getSpinWheel = async (req, res) => {
  try {
    const wheel = await getOrCreateSpinWheel();
    return res.status(200).json({ status: true, message: "Success", data: wheel });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

exports.updateSpinWheel = async (req, res) => {
  try {
    const { slots } = req.body;
    if (!Array.isArray(slots) || slots.length !== 8) {
      return res.status(200).json({ status: false, message: "slots must be an array of exactly 8 items." });
    }

    // Normalize/validate minimal fields
    const normalizedSlots = slots.map((s) => ({
      label: (s?.label ?? "").toString(),
      rewardType: ["coin", "none"].includes(s?.rewardType) ? s.rewardType : "none",
      rewardValue: Number.isFinite(Number(s?.rewardValue)) ? Number(s.rewardValue) : 0,
      weight: Number.isFinite(Number(s?.weight)) ? Math.max(0, Number(s.weight)) : 1,
      isActive: s?.isActive === undefined ? true : Boolean(s.isActive),
    }));

    const updated = await SpinWheel.findOneAndUpdate(
      { key: "default" },
      { $set: { slots: normalizedSlots } },
      { new: true, upsert: true }
    ).lean();

    return res.status(200).json({ status: true, message: "Spin wheel updated.", data: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

