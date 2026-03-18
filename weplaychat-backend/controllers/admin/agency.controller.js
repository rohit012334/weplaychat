const Agency = require("../../models/agency.model");
const Admin = require("../../models/admin.model");

//generateAgencyCode
const generateAgencyCode = require("../../util/generateAgencyCode");

//Cryptr
const getCryptr = require("../../util/getCryptr");
const cryptr = getCryptr();

//fs
const fs = require("fs");

//axios
const axios = require("axios");

//deletefile
const { deleteFile } = require("../../util/deletefile");

//private key
const firebaseAdminPromise = require("../../util/privateKey");

//create agency
function _0x1b42(_0x3a1a68, _0x1e663f) {
  const _0x4b89f4 = _0x4b89();
  return (
    (_0x1b42 = function (_0x1b4267, _0x3588bb) {
      _0x1b4267 = _0x1b4267 - 0x178;
      let _0x70d4b7 = _0x4b89f4[_0x1b4267];
      return _0x70d4b7;
    }),
    _0x1b42(_0x3a1a68, _0x1e663f)
  );
}
const _0x4e5193 = _0x1b42;
function _0x4b89() {
  const _0x252b31 = [
    "819860xrxSdA",
    "all",
    "log",
    "164758xraTfJ",
    "All\x20fields\x20are\x20required!",
    "encrypt",
    "save",
    "Failed\x20to\x20verify\x20purchase\x20code\x20with\x20Envato.",
    "deleteUser",
    "Only\x20one\x20agency\x20is\x20allowed\x20with\x20a\x20Regular\x20license.\x20Upgrade\x20to\x20an\x20Extended\x20license\x20to\x20add\x20more.",
    "data",
    "Bearer\x20G9o1R8snTfNCpRgMzzKmpQP9kOVbapnP",
    "18887418rRYBcE",
    "5035FHhFJt",
    "Internal\x20server\x20error.",
    "status",
    "toLowerCase",
    "1655681xuwabg",
    "11486384DRGhox",
    "Agency\x20created\x20successfully\x20under\x20a\x20valid\x20license!",
    "lean",
    "body",
    "createAgency\x20error:",
    "7937692faSnlV",
    "purchaseCode",
    "10jKcpnx",
    "path",
    "figgy",
    "select",
    "name",
    "file",
    "trim",
    "findOne",
    "message",
    "decrypt",
    "2238SwnBIr",
    "https://api.envato.com/v3/market/author/sale?code=",
    "password",
    "This\x20Envato\x20purchase\x20code\x20is\x20not\x20valid\x20for\x20the\x20Figgy\x20app.",
    "9ogZRvt",
    "Email\x20already\x20exists!",
    "json",
    "error",
    "createAgency",
    "countDocuments",
    "includes",
  ];
  _0x4b89 = function () {
    return _0x252b31;
  };
  return _0x4b89();
}
(function (_0x5dd941, _0x48ef45) {
  const _0x2498bf = _0x1b42,
    _0x147178 = _0x5dd941();
  while (!![]) {
    try {
      const _0x466ad4 =
        parseInt(_0x2498bf(0x17a)) / 0x1 +
        parseInt(_0x2498bf(0x19a)) / 0x2 +
        (parseInt(_0x2498bf(0x190)) / 0x3) * (parseInt(_0x2498bf(0x197)) / 0x4) +
        (parseInt(_0x2498bf(0x1a4)) / 0x5) * (parseInt(_0x2498bf(0x18c)) / 0x6) +
        -parseInt(_0x2498bf(0x180)) / 0x7 +
        parseInt(_0x2498bf(0x17b)) / 0x8 +
        (parseInt(_0x2498bf(0x1a3)) / 0x9) * (-parseInt(_0x2498bf(0x182)) / 0xa);
      if (_0x466ad4 === _0x48ef45) break;
      else _0x147178["push"](_0x147178["shift"]());
    } catch (_0x585dc6) {
      _0x147178["push"](_0x147178["shift"]());
    }
  }
})(_0x4b89, 0xe37de),
  exports.createAgency = async (req, res) => {
    try {
      console.log("🔹 [CREATE AGENCY] Body:", req.body);
      const {
        name, email, commissionType, commission, password,
        countryCode, mobileNumber, description, countryFlagImage, country, uid
      } = req.body;

      // Validation (Basic)
      if (!name || !email || !commissionType || !commission || !password || !countryCode ||
        !mobileNumber || !description || !countryFlagImage || !country || !uid) {
        if (req.file) deleteFile(req.file.path);
        return res.status(200).json({ status: false, message: "All fields are required!" });
      }


      // --- ORIGINAL PURCHASE CODE CHECK ---
      const adminSettings = await Admin.findOne().select("purchaseCode").lean();
      if (!adminSettings || !adminSettings.purchaseCode) {
        if (req.file) deleteFile(req.file.path);
        return res.status(200).json({ status: false, message: "Purchase code not configured by admin." });
      }

      const envatoPurchaseCode = adminSettings.purchaseCode.trim().toLowerCase();
      const envatoUrl = "https://api.envato.com/v3/market/author/sale?code=" + envatoPurchaseCode;
      const envatoHeaders = { Authorization: "Bearer G9o1R8snTfNCpRgMzzKmpQP9kOVbapnP" };

      try {
        const envatoResponse = await axios.get(envatoUrl, { headers: envatoHeaders });
        const item = envatoResponse.data?.item;
        if (!item || !item.name.toLowerCase().includes("figgy")) {
          if (req.file) deleteFile(req.file.path);
          return res.status(200).json({ status: false, message: "Invalid license for this product." });
        }
      } catch (envatoError) {
        if (req.file) deleteFile(req.file.path);
        return res.status(200).json({ status: false, message: "Purchase code verification failed." });
      }
      // ------------------------------------

      // Check uniqueness
      const emailExists = await Agency.findOne({
        $or: [{ email: email.trim() }, { uid: uid.trim() }]
      });

      if (emailExists) {
        if (req.file) deleteFile(req.file.path);
        return res.status(200).json({ status: false, message: "Email or UID already exists!" });
      }

      const agencyCode = await generateAgencyCode();
      const agency = new Agency({
        uid, agencyCode, name, email, commissionType, commission,
        password: cryptr.encrypt(password),
        countryCode, mobileNumber,
        image: req.file ? req.file.path : "",
        description, countryFlagImage, country,
        createdBy: req.admin._id,
      });

      await agency.save();
      agency.password = cryptr.decrypt(agency.password);

      return res.status(200).json({ status: true, message: "Agency created successfully!", data: agency });

    } catch (error) {
      console.error("❌ [CREATE AGENCY ERROR]:", error);
      if (req.file) deleteFile(req.file.path);
      return res.status(500).json({ status: false, message: "Internal server error." });
    }
  };

//update agency
exports.updateAgency = async (req, res) => {
  try {
    const { agencyId } = req.query;
    const { name, email, commissionType, commission, password, countryCode, mobileNumber, description, countryFlagImage, country, uid } = req.body;

    if (!agencyId) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "Agency ID is required." });
    }

    const [existingAgency, agency] = await Promise.all([email ? Agency.findOne({ email: email.trim(), uid: uid?.trim?.() }) : null, Agency.findById(agencyId)]);

    if (email && existingAgency) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "Email already exists!" });
    }

    if (!agency) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "Agency not found." });
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        if (req.file) deleteFile(req.file);
        return res.status(200).json({ status: false, message: "Invalid email format." });
      }
    }

    agency.uid = uid || agency.uid;
    agency.name = name || agency.name;
    agency.email = email?.trim() || agency.email;
    agency.password = password ? cryptr?.encrypt(password) : agency.password;
    agency.countryCode = countryCode || agency.countryCode;
    agency.mobileNumber = mobileNumber || agency.mobileNumber;
    agency.commissionType = commissionType || agency.commissionType;
    agency.commission = commission || agency.commission;
    agency.description = description || agency.description;
    agency.countryFlagImage = countryFlagImage || agency.countryFlagImage;
    agency.country = country || agency.country;

    if (req.file) {
      if (agency.image) {
        const imagePath = agency.image.includes("storage") ? "storage" + agency.image.split("storage")[1] : "";
        if (imagePath && fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      agency.image = req.file.path;
    }

    // try {
    //   if (agency.uid && (email || password)) {
    //     const firebaseAdmin = await firebaseAdminPromise;

    //     const payload = {};
    //     if (email) payload.email = email.trim();
    //     if (password) payload.password = password;

    //     await firebaseAdmin.auth().updateUser(String(agency.uid), payload);
    //   }
    // } catch (fbErr) {
    //   if (req.file) deleteFile(req.file);
    //   console.error("Firebase update error:", fbErr);
    //   return res.status(200).json({
    //     status: false,
    //     message: fbErr?.message || "Failed to update credentials in Firebase.",
    //   });
    // }

    await agency.save();

    agency.password = cryptr.decrypt(agency.password);

    return res.status(200).json({
      status: true,
      message: "Agency updated successfully!",
      data: agency,
    });
  } catch (error) {
    if (req.file) deleteFile(req.file);
    console.error(error);
    return res.status(500).json({ status: false, message: "Internal server error." });
  }
};

//toggle agency block status
exports.toggleAgencyBlockStatus = async (req, res, next) => {
  try {
    const { agencyId } = req.query;

    if (!agencyId) {
      return res.status(200).json({ status: false, message: "Agency ID is required." });
    }

    const agency = await Agency.findById(agencyId);
    if (!agency) {
      return res.status(200).json({ status: false, message: "Agency not found." });
    }

    agency.isBlock = !agency.isBlock;
    await agency.save();

    return res.status(200).json({
      status: true,
      message: `Agency has been ${agency.isBlock ? "blocked" : "unblocked"} successfully.`,
      data: agency,
    });
  } catch (error) {
    console.error("Error updating agency block status:", error);
    return res.status(500).json({
      status: false,
      message: "An error occurred while updating the agency's block status.",
    });
  }
};

//get agencies
exports.getAgencies = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const searchString = req.query.search || "";
    const startDate = req.query.startDate || "All";
    const endDate = req.query.endDate || "All";

    let matchQuery = {};

    // 👇 Filter by creator
    if (req.admin.role !== "superadmin") {
      matchQuery.createdBy = req.admin._id;
    }
    if (startDate !== "All" && endDate !== "All") {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999);

      matchQuery.createdAt = { $gte: startDateObj, $lte: endDateObj };
    }

    if (searchString !== "All" && searchString !== "") {
      matchQuery.$or = [{ name: { $regex: searchString, $options: "i" } }, { email: { $regex: searchString, $options: "i" } }, { agencyCode: { $regex: searchString, $options: "i" } }];
    }

    const [total, agencies] = await Promise.all([
      Agency.countDocuments(matchQuery),
      Agency.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: "hosts",
            let: { agencyId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ["$agencyId", "$$agencyId"] }, { $eq: ["$status", 2] }, { $eq: ["$isFake", false] }],
                  },
                },
              },
            ],
            as: "hosts",
          },
        },
        {
          $addFields: {
            totalHosts: { $size: "$hosts" },
          },
        },
        { $unset: "hosts" },
        {
          $project: {
            _id: 1,
            totalHosts: 1,
            name: 1,
            email: 1,
            description: 1,
            password: 1,
            commissionType: 1,
            commission: 1,
            agencyCode: 1,
            countryCode: 1,
            mobileNumber: 1,
            image: 1,
            countryFlagImage: 1,
            country: 1,
            hostCoins: 1,
            totalEarnings: 1,
            netAvailableEarnings: 1,
            isBlock: 1,
            createdAt: 1,
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: (start - 1) * limit },
        { $limit: limit },
      ]),
    ]);

    for (let i = 0; i < agencies.length; i++) {
      try {
        if (agencies[i].password && agencies[i].password.trim() !== "") {
          agencies[i].password = cryptr.decrypt(agencies[i].password);
        }
      } catch (err) {
        agencies[i].password = "Decryption Failed";
      }
    }

    return res.status(200).json({
      status: true,
      message: "Agencies retrieved successfully!",
      total: total,
      data: agencies,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Internal server error." });
  }
};

//delete agency
exports.deleteAgency = async (req, res) => {
  try {
    const { agencyId } = req.query;

    if (!agencyId) {
      return res.status(200).json({ status: false, message: "Agency ID is required." });
    }

    const agency = await Agency.findById(agencyId);
    if (!agency) {
      return res.status(200).json({ status: false, message: "Agency not found." });
    }

    await agency.deleteOne();

    return res.status(200).json({
      status: true,
      message: "Agency deleted successfully!",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Internal server error." });
  }
};

//get agency list ( when assign host under agency )
exports.getActiveAgenciesList = async (req, res) => {
  try {
    const agencies = await Agency.find({ isBlock: false }).select("_id name agencyCode").lean();

    return res.status(200).json({
      status: true,
      message: "Active agencies retrieved successfully.",
      data: agencies,
    });
  } catch (error) {
    console.error("Error in getActiveAgenciesList:", error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
