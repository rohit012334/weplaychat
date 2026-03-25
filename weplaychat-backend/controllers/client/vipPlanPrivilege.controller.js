const VipPlanPrivilege = require("../../models/vipPlanPrivilege.model");

//get VIP Plan Privilege
exports.retrieveVipPrivilege = async (req, res) => {
  try {
    const { level } = req.query;
    let query = { level: { $in: [1, 2, 3] } }; // Only fetch valid VIP levels
    if (level) {
      query.level = parseInt(level);
    }

    const privileges = await VipPlanPrivilege.find(query).sort({ level: 1 }).lean();

    return res.status(200).json({
      status: true,
      message: "Retrieved VIP privileges successfully.",
      data: privileges.length === 1 && level ? privileges[0] : privileges,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
