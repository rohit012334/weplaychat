const VipPlanPrivilege = require("../../models/vipPlanPrivilege.model");
const { deleteFile } = require("../../util/deletefile");
const fs = require("fs");

// Update or Create VIP Plan Privilege for a specific level
exports.modifyVipPrivilege = async (req, res) => {
  try {
    const { level, name } = req.body;
    
    if (!level) {
      if (req.files && Array.isArray(req.files)) {
        req.files.forEach((file) => deleteFile(file));
      }
      return res.status(400).json({ status: false, message: "Level is required (1, 2, or 3)." });
    }

    let privilege = await VipPlanPrivilege.findOne({ level: parseInt(level) });

    if (!privilege) {
      privilege = new VipPlanPrivilege({ level: parseInt(level), name: name || (level == 1 ? "VIP" : level == 2 ? "VVIP" : "SVIP") });
    }

    // Handle multiple file uploads (from upload.any())
    if (req.files && Array.isArray(req.files)) {
      console.log("VIP Upload Files:", req.files.map(f => ({ fieldname: f.fieldname, path: f.path })));
      const badgeFile = req.files.find(f => f.fieldname === "vipFrameBadge");
      const freeEntryFile = req.files.find(f => f.fieldname === "freeEntryImage");
      const entrance1File = req.files.find(f => f.fieldname === "vipEntrance1");
      const entrance2File = req.files.find(f => f.fieldname === "vipEntrance2");

      if (badgeFile) {
        if (privilege.vipFrameBadge) {
          const oldPath = privilege.vipFrameBadge.split("storage");
          if (oldPath.length > 1 && fs.existsSync("storage" + oldPath[1])) {
            fs.unlinkSync("storage" + oldPath[1]);
          }
        }
        privilege.vipFrameBadge = badgeFile.path;
      }

      if (freeEntryFile) {
        if (privilege.freeEntryImage) {
          const oldPath = privilege.freeEntryImage.split("storage");
          if (oldPath.length > 1 && fs.existsSync("storage" + oldPath[1])) {
            fs.unlinkSync("storage" + oldPath[1]);
          }
        }
        privilege.freeEntryImage = freeEntryFile.path;
      }

      if (entrance1File) {
        if (privilege.vipEntrance1) {
          const oldPath = privilege.vipEntrance1.split("storage");
          if (oldPath.length > 1 && fs.existsSync("storage" + oldPath[1])) {
            fs.unlinkSync("storage" + oldPath[1]);
          }
        }
        privilege.vipEntrance1 = entrance1File.path;
      }

      if (entrance2File) {
        if (privilege.vipEntrance2) {
          const oldPath = privilege.vipEntrance2.split("storage");
          if (oldPath.length > 1 && fs.existsSync("storage" + oldPath[1])) {
            fs.unlinkSync("storage" + oldPath[1]);
          }
        }
        privilege.vipEntrance2 = entrance2File.path;
      }
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
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file) => deleteFile(file));
    }
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
