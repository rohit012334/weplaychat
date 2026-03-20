const VipPlanPrivilege = require("../../models/vipPlanPrivilege.model");
const { deleteFile } = require("../../util/deletefile");
const fs = require("fs");

// Update or Create VIP Plan Privilege for a specific level
exports.modifyVipPrivilege = async (req, res) => {
  try {
    const { level, name } = req.body;
    
    if (!level) {
      if (req.file) deleteFile(req.file);
      return res.status(400).json({ status: false, message: "Level is required (1, 2, or 3)." });
    }

    let privilege = await VipPlanPrivilege.findOne({ level: parseInt(level) });

    if (!privilege) {
      privilege = new VipPlanPrivilege({ level: parseInt(level), name: name || (level == 1 ? "VIP" : level == 2 ? "VVIP" : "SVIP") });
    }

    if (req.file) {
      if (privilege.vipFrameBadge) {
        const oldBadgePath = privilege.vipFrameBadge.split("storage");
        if (oldBadgePath.length > 1 && fs.existsSync("storage" + oldBadgePath[1])) {
          fs.unlinkSync("storage" + oldBadgePath[1]);
        }
      }
      privilege.vipFrameBadge = req.file.path;
    }

    if (name) privilege.name = name;
    
    // Dynamic fields from request body
    const fields = [
      "videoCallDiscount", "randomMatchCallDiscount", 
      "topUpCoinBonus", "muteAvailability", "specialName", 
      "freeEntry", "roomAuthority", "unlimitedChat", "memberTag", 
      "profileEdit", "kick", "backgroundAdd", "hide", "canMuteOthers"
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        // Handle booleans correctly from form-data (sometimes they come as strings)
        if (req.body[field] === "true") privilege[field] = true;
        else if (req.body[field] === "false") privilege[field] = false;
        else privilege[field] = req.body[field];
      }
    });

    await privilege.save();

    return res.status(200).json({
      status: true,
      message: `${privilege.name} privilege has been updated.`,
      data: privilege,
    });
  } catch (error) {
    if (req.file) deleteFile(req.file);
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// Get VIP Plan Privilege by level
exports.retrieveVipPrivilege = async (req, res) => {
  try {
    const { level } = req.query;
    let query = {};
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
