const Admin = require("../../models/admin.model");
const generateAdminCode = require("../../util/generateAdminCode");

//fs
const fs = require("fs");

//Cryptr
const getCryptr = require("../../util/getCryptr");
const cryptr = getCryptr();

//deletefile
const { deleteFile } = require("../../util/deletefile");
const getFirebaseAdmin = require("../../util/privateKey");

const _0x32b6ab = _0x2223;
(function (_0x2ea54a, _0x4d73d8) {
  const _0x2fe0b7 = _0x2223,
    _0x3d2f1d = _0x2ea54a();
  while (!![]) {
    try {
      const _0x403a0f =
        parseInt(_0x2fe0b7(0x8f)) / 0x1 +
        (parseInt(_0x2fe0b7(0x80)) / 0x2) * (-parseInt(_0x2fe0b7(0x8e)) / 0x3) +
        parseInt(_0x2fe0b7(0x8a)) / 0x4 +
        parseInt(_0x2fe0b7(0x90)) / 0x5 +
        -parseInt(_0x2fe0b7(0x82)) / 0x6 +
        -parseInt(_0x2fe0b7(0x7e)) / 0x7 +
        (-parseInt(_0x2fe0b7(0x8d)) / 0x8) * (-parseInt(_0x2fe0b7(0x87)) / 0x9);
      if (_0x403a0f === _0x4d73d8) break;
      else _0x3d2f1d["push"](_0x3d2f1d["shift"]());
    } catch (_0x246115) {
      _0x3d2f1d["push"](_0x3d2f1d["shift"]());
    }
  }
})(_0x348c, 0x20e3f);
function _0x348c() {
  const _0x2cc385 = [
    "https://api.envato.com/v3/market/author/sale?code=",
    "28160WsDYzv",
    "data",
    "message",
    "30032OwtrzH",
    "584463vxDTXE",
    "7212nnSypm",
    "271080LrLoBa",
    "item",
    "Purchase\x20code\x20verification\x20failed.",
    "toString",
    "819637YrdKiG",
    "response",
    "2hbTGhE",
    "get",
    "1177194tpawzy",
    "status",
    "Purchase\x20verification\x20script",
    "../../models/setting.model",
    "error",
    "1377LlLfcb",
    "jago-maldar",
  ];
  _0x348c = function () {
    return _0x2cc385;
  };
  return _0x348c();
}
function _0x2223(_0x3faa53, _0x4a6f79) {
  const _0x348c7e = _0x348c();
  return (
    (_0x2223 = function (_0x22239d, _0x41c169) {
      _0x22239d = _0x22239d - 0x7e;
      let _0x3ea23e = _0x348c7e[_0x22239d];
      return _0x3ea23e;
    }),
    _0x2223(_0x3faa53, _0x4a6f79)
  );
}
const Login = require("../../models/login.model"),
  Setting = require(_0x32b6ab(0x85)),
  LiveUser = require(_0x32b6ab(0x88)),
  axios = require("axios");
async function Auth(_0x30a2b6, _0x35f1db) {
  const _0x3c960d = _0x32b6ab;
  try {
    const _0x2321ca = await axios[_0x3c960d(0x81)](
      _0x3c960d(0x89) + _0x30a2b6,
      {
        headers: {
          Authorization: "Bearer\x20G9o1R8snTfNCpRgMzzKmpQP9kOVbapnP",
          "User-Agent": _0x3c960d(0x84),
        },
      },
    ),
      _0x3aabd7 = _0x2321ca[_0x3c960d(0x8b)];
    if (
      _0x3aabd7 &&
      _0x3aabd7[_0x3c960d(0x91)] &&
      _0x3aabd7[_0x3c960d(0x91)]["id"][_0x3c960d(0x93)]() ===
      _0x35f1db[_0x3c960d(0x93)]()
    )
      return !![];
    return ![];
  } catch (_0x346780) {
    if (
      _0x346780[_0x3c960d(0x7f)] &&
      _0x346780[_0x3c960d(0x7f)][_0x3c960d(0x83)] === 0x194
    )
      return ![];
    console[_0x3c960d(0x86)]("API\x20error:", _0x346780[_0x3c960d(0x8c)]);
    throw new Error(_0x3c960d(0x92));
  }
}


// registerAdmin (Setup API)
exports.registerAdmin = async (req, res) => {
  try {
    const { email, password, purchaseCode, privateKey, uid } = req.body;

    if (!uid || !email || !password || !purchaseCode || !privateKey) {
      return res.status(200).json({
        status: false,
        message: "Oops! Invalid or missing details.",
      });
    }

    const [settingDoc, anyAdminExists, existingAdmin, isVerified] = await Promise.all([
      Setting.findOne({}),
      Admin.findOne({}),
      Admin.findOne({ $or: [{ uid: uid.trim() }, { email: email.trim() }] }),
      Auth(purchaseCode.trim(), "jago-maldar"),
    ]);

    if (!settingDoc) {
      return res.status(200).json({
        status: false,
        message: "Settings document not found in database.",
      });
    }

    if (!settingDoc.privateKey || typeof settingDoc.privateKey !== "object") {
      return res.status(500).json({
        status: false,
        message: "Settings document is invalid (missing privateKey).",
      });
    }

    if (anyAdminExists) {
      return res.status(200).json({
        status: false,
        message: "An admin already exists. Please log in.",
      });
    }

    if (existingAdmin) {
      return res.status(200).json({
        status: false,
        message: "Admin with this UID or email already exists.",
      });
    }

    if (!isVerified) {
      return res.status(200).json({
        status: false,
        message: "Purchase code is not valid.",
      });
    }

    const uniqueId = await generateAdminCode("AD");
    const newAdmin = new Admin({
      uid: uid.trim(),
      uniqueId,
      name: (req.body.name || "").trim(),
      email: email.trim(),
      password: cryptr.encrypt(password.trim()),
      purchaseCode: purchaseCode.trim(),
    });

    await Promise.all([
      newAdmin.save(),
      Login.updateOne({}, { $set: { login: true } }, { upsert: true }),
    ]);

    // Update Setting with privateKey from request
    try {
      settingDoc.privateKey = typeof privateKey === "string" ? JSON.parse(privateKey) : privateKey;
      await settingDoc.save();
      global.updateSettingFile(settingDoc);

      const { exec } = require("child_process");
      exec("pm2 restart backend --update-env", (error, stdout, stderr) => {
        if (error) {
          console.error("PM2 restart error:", error.message);
          return;
        }
        if (stderr) console.error("PM2 stderr:", stderr);
        console.log("PM2 restarted successfully:", stdout);
      });
    } catch (saveError) {
      return res.status(200).json({
        status: false,
        message: "Invalid privateKey format. Must be valid JSON.",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Admin created successfully!",
      admin: newAdmin,
    });
  } catch (err) {
    console.error("registerAdmin error:", err);
    return res.status(500).json({
      status: false,
      message: err.message || "Internal Server Error",
    });
  }
};
function _0x1925(_0x41df27, _0x3c630b) {
  const _0x50ba4a = _0x50ba();
  return (
    (_0x1925 = function (_0x1925a7, _0x38b665) {
      _0x1925a7 = _0x1925a7 - 0x145;
      let _0x47ddb8 = _0x50ba4a[_0x1925a7];
      return _0x47ddb8;
    }),
    _0x1925(_0x41df27, _0x3c630b)
  );
}
function _0x50ba() {
  const _0x5bdf53 = [
    "string",
    "email",
    "Settings\x20document\x20not\x20found\x20in\x20database.",
    "all",
    "2189283QnFTUS",
    "log",
    "privateKey",
    "1146908oYaytp",
    "Oops!\x20Invalid\x20or\x20missing\x20details.",
    "26472GdYbAz",
    "8437COQEDY",
    "save",
    "Internal\x20Server\x20Error",
    "Settings\x20document\x20is\x20invalid\x20(missing\x20privateKey).",
    "registerAdmin\x20error:",
    "Invalid\x20privateKey\x20format.\x20Must\x20be\x20valid\x20JSON.",
    "An\x20admin\x20already\x20exists.\x20Please\x20log\x20in.",
    "Admin\x20with\x20this\x20UID\x20or\x20email\x20already\x20exists.",
    "pm2\x20restart\x20backend\x20--update-env",
    "password",
    "json",
    "child_process",
    "Purchase\x20code\x20is\x20not\x20valid.",
    "status",
    "391699ZhrPlC",
    "trim",
    "updateOne",
    "object",
    "message",
    "exists",
    "11896LZiTCX",
    "11580kcDEbc",
    "PM2\x20restart\x20error:",
    "58577440",
    "PM2\x20stderr:",
    "parse",
    "915UGgatj",
    "body",
    "code",
    "558846OjwphR",
    "2jfQrhe",
    "1593YtjEFN",
    "findOne",
    "error",
    "Admin\x20created\x20successfully!",
  ];
  _0x50ba = function () {
    return _0x5bdf53;
  };
  return _0x50ba();
}

//register superadmin
exports.registerSuperAdmin = async (req, res) => {
  try {
    const { name, email, password, purchaseCode } = req.body;

    if (!name || !email || !password) {
      return res
        .status(200)
        .json({
          status: false,
          message: "name, email and password are required.",
        });
    }

    // // Check if a superadmin already exists in MongoDB
    // const existingSuperAdmin = await Admin.findOne({ role: "superadmin" });
    // if (existingSuperAdmin) {
    //   return res
    //     .status(200)
    //     .json({
    // status: false,
    //       message: "A superadmin already exists. Please login.",
    //     });
    // }

    const firebaseInstance = await getFirebaseAdmin();
    let firebaseUid;

    try {
      // Try to create Firebase user
      const firebaseUser = await firebaseInstance.auth().createUser({
        email: email.trim(),
        password: password,
        displayName: name,
      });
      firebaseUid = firebaseUser.uid;
    } catch (firebaseError) {
      if (firebaseError.code === "auth/email-already-exists") {
        // Firebase user already exists — fetch their UID and update password
        const existingFirebaseUser = await firebaseInstance
          .auth()
          .getUserByEmail(email.trim());
        await firebaseInstance
          .auth()
          .updateUser(existingFirebaseUser.uid, { password });
        firebaseUid = existingFirebaseUser.uid;
      } else {
        throw firebaseError;
      }
    }

    const uniqueId = await generateAdminCode("AD");
    // Save to MongoDB
    const superAdmin = new Admin({
      uid: firebaseUid,
      uniqueId,
      name: name.trim(),
      email: email.trim(),
      password: cryptr.encrypt(password),
      purchaseCode: purchaseCode || "",
      role: "superadmin",
    });

    await Promise.all([
      superAdmin.save(),
      Login.updateOne({}, { $set: { login: true } }, { upsert: true }),
    ]);

    return res.status(200).json({
      status: true,
      message: "Superadmin registered successfully!",
      admin: {
        _id: superAdmin._id,
        name: superAdmin.name,
        email: superAdmin.email,
        role: superAdmin.role,
        uid: superAdmin.uid,
      },
    });
  } catch (error) {
    console.error("registerSuperAdmin error:", error);
    return res
      .status(500)
      .json({
        status: false,
        message: error.message || "Internal Server Error",
      });
  }
};

//admin login
exports.validateAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(200)
        .json({ status: false, message: "Oops! Invalid details!" });
    }

    const identifier = email.trim();
    const admin = await Admin.findOne({ 
      $or: [{ email: identifier }, { uniqueId: identifier }] 
    })
      .select("_id name email uniqueId password purchaseCode role")
      .lean();

    if (!admin) {
      return res
        .status(200)
        .json({
          status: false,
          message: "Oops! Admin not found with that email or ID.",
        });
    }

    let decryptedPassword;
    try {
      decryptedPassword = cryptr.decrypt(admin.password);
    } catch (e) {
      return res
        .status(200)
        .json({ status: false, message: "Oops! Password doesn't match!" });
    }

    if (decryptedPassword !== password) {
      return res
        .status(200)
        .json({ status: false, message: "Oops! Password doesn't match!" });
    }

    return res.status(200).json({
      status: true,
      message: "Admin has successfully logged in.",
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({
        status: false,
        message: error.message || "Internal Server Error",
      });
  }
};

//update admin profile
exports.modifyAdminProfile = async (req, res) => {
  try {
    const adminId = req.admin._id;

    const admin = await Admin.findById(adminId)
      .select("name email image password")
      .lean();
    if (!admin) {
      if (req.file) deleteFile(req.file);
      return res
        .status(200)
        .json({ status: false, message: "Admin not found!" });
    }

    const updateFields = {
      name: req.body?.name || admin.name,
      email: req.body?.email ? req.body.email.trim() : admin.email,
      password: req.body?.password
        ? cryptr.encrypt(req.body.password)
        : admin.password,
    };
    console.log(updateFields);

    if (req.file) {
      if (admin.image) {
        const imagePath = admin.image.includes("storage")
          ? "storage" + admin.image.split("storage")[1]
          : "";
        if (imagePath && fs.existsSync(imagePath)) {
          const imageName = imagePath.split("/").pop();
          if (!["male.png", "female.png"].includes(imageName)) {
            fs.unlinkSync(imagePath);
          }
        }
      }
      updateFields.image = req.file.path;
    }

    const [updatedAdmin] = await Promise.all([
      Admin.findByIdAndUpdate(req.admin._id, updateFields, {
        new: true,
        select: "name email image password",
      }).lean(),
    ]);

    // updatedAdmin.password = cryptr.decrypt(updatedAdmin.password);

    return res.status(200).json({
      status: true,
      message: "Admin profile has been updated.",
      data: updatedAdmin,
    });
  } catch (error) {
    if (req.file) deleteFile(req.file);
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get admin profile
exports.retrieveAdminProfile = async (req, res) => {
  try {
    const adminId = req.admin._id;
    const admin = await Admin.findById(adminId).lean();

    if (!admin) {
      return res
        .status(200)
        .json({ status: false, message: "Admin not found." });
    }

    if (admin.password) {
      try {
        admin.password = cryptr.decrypt(admin.password);
      } catch (e) {
        console.warn("⚠️ [AUTH] Decryption failed for:", admin.email);
      }
    }

    return res.status(200).json({
      status: true,
      message: "Admin profile retrieved successfully!",
      data: admin,
    });
  } catch (error) {
    console.error("retrieveAdminProfile error:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//update password
exports.modifyPassword = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res
        .status(200)
        .json({ status: false, message: "admin does not found." });
    }

    if (!req.body.oldPass || !req.body.newPass || !req.body.confirmPass) {
      return res
        .status(200)
        .json({ status: false, message: "Oops! Invalid details!" });
    }

    if (cryptr.decrypt(admin.password) !== req.body.oldPass) {
      return res.status(200).json({
        status: false,
        message: "Oops! Password doesn't match!",
      });
    }

    if (req.body.newPass !== req.body.confirmPass) {
      return res.status(200).json({
        status: false,
        message: "Oops ! New Password and Confirm Password don't match!",
      });
    }

    const hash = cryptr.encrypt(req.body.newPass);
    admin.password = hash;

    const [savedAdmin, data] = await Promise.all([
      admin.save(),
      Admin.findById(admin._id),
    ]);

    data.password = cryptr.decrypt(savedAdmin.password);

    return res.status(200).json({
      status: true,
      message: "Password has been changed by the admin.",
      data: data,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//set Password
exports.performPasswordReset = async (req, res) => {
  try {
    const admin = await Admin.findById(req?.admin._id);
    if (!admin) {
      return res
        .status(200)
        .json({ status: false, message: "Admin does not found." });
    }

    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Invalid details!" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(200).json({
        status: false,
        message: "Oops! New Password and Confirm Password don't match!",
      });
    }

    admin.password = cryptr.encrypt(newPassword);
    await admin.save();

    admin.password = cryptr.decrypt(admin?.password);

    return res.status(200).json({
      status: true,
      message: "Password has been updated Successfully.",
      data: admin,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Internal Server Error" });
  }
};
// resolve identifier (ID to email)
exports.resolveIdentifier = async (req, res) => {
  try {
    const { identifier } = req.query;
    if (!identifier) return res.status(200).json({ status: false, message: "ID is required" });

    // Check in Admin model first
    let user = await Admin.findOne({ uniqueId: identifier.trim() }).select("email").lean();
    
    // If not found, check in Reseller model 
    if (!user) {
      const Reseller = require("../../models/Reseller.model");
      user = await Reseller.findOne({ uniqueId: identifier.trim() }).select("email").lean();
    }

    if (!user) {
      return res.status(200).json({ status: false, message: "No account found with this ID" });
    }

    return res.status(200).json({ status: true, email: user.email });
  } catch (error) {
    console.error("resolveIdentifier error:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};
// =============================
// ADMIN SIGNUP / REGISTER
// =============================
exports.addAdmin = async (req, res) => {
  try {
    const uid = Math.floor(Math.random() * Math.pow(10, 20))
      .toString()
      .padStart(20, "0");
    const email = req?.body?.email?.trim();
    const name = req?.body?.name?.trim();
    const password = req?.body?.password?.trim();
    const nationalId = req?.body?.nationalId?.trim();
    const nationalIdType = req?.body?.nationalIdType?.trim();

    // 1) Validate required fields    
    if (!email || !name || !password) {
      // cleanup uploaded files if present
      if (req.files) {
        Object.values(req.files).flat().forEach(f => deleteFile(f.path));
      }
      return res.status(400).json({
        status: false,
        message: "All required fields must be provided!",
      });
    }

    // if nationalIdType is aadhar, require both front and back images
    if (nationalIdType === "aadhar") {
      if (
        !req.files?.nationalIdFront ||
        !req.files?.nationalIdBack ||
        !req.files.nationalIdFront.length ||
        !req.files.nationalIdBack.length
      ) {
        Object.values(req.files || {}).flat().forEach(f => deleteFile(f.path));
        return res.status(400).json({
          status: false,
          message: "Both front and back images are required for aadhar ID.",
        });
      }
    }

    // 2) Fetch setting + check if admin already exists + validate purchase code
    const [settingDoc, existingByUidOrEmail] = await Promise.all([
      Setting.findOne({}),
      Admin.findOne({ $or: [{ uid }, { email }] }),
    ]);

    // 3) Settings must exist
    if (!settingDoc) {
      return res.status(200).json({
        status: false,
        message: "Settings document not found in database.",
      });
    }

    // 4) setting.privateKey must exist
    if (!settingDoc.privateKey || typeof settingDoc.privateKey !== "object") {
      return res.status(500).json({
        status: false,
        message: "Settings document is invalid (missing privateKey).",
      });
    }

    // 6) uid/email must be unique
    if (existingByUidOrEmail) {
      return res.status(200).json({
        status: false,
        message: "Admin with this UID or email already exists.",
      });
    }
    const firebaseInstance = await getFirebaseAdmin();
    let firebaseUser;
    try {
      firebaseUser = await firebaseInstance.auth().createUser({
        email: email.trim(),
        password: password,
        displayName: name,
      });
    } catch (firebaseError) {
      if (firebaseError.code === "auth/email-already-exists") {
        const existingFirebaseUser = await firebaseInstance
          .auth()
          .getUserByEmail(email.trim());
        await firebaseInstance
          .auth()
          .updateUser(existingFirebaseUser.uid, { password });
        firebaseUser = existingFirebaseUser;
      } else {
        throw firebaseError;
      }
    }

    const superAdmin = await Admin.findOne({ role: "superadmin" });

    const uniqueId = await generateAdminCode("AD");
    // 8) Create admin
    const admin = new Admin({
      uid: firebaseUser.uid,
      uniqueId,
      name,
      email,
      image: req.files?.image ? req.files.image[0].path : "",
      password: cryptr.encrypt(password),
      role: "admin",
      purchaseCode: superAdmin?.purchaseCode,
      createdBy: req.admin._id,
      nationalId,
      nationalIdType,
      nationalIdImage: {
        front: req.files?.nationalIdFront ? req.files.nationalIdFront[0].path : "",
        back: req.files?.nationalIdBack ? req.files.nationalIdBack[0].path : "",
      },
    });

    // 9) Save admin and mark login=true
    await Promise.all([
      admin.save(),
      Login.updateOne({}, { $set: { login: true } }, { upsert: true }),
    ]);

    // 11) Response
    return res.status(200).json({
      status: true,
      message: "Admin created successfully!",
      admin,
    });
  } catch (err) {
    console.error("registerAdmin error:", err);
    return res.status(500).json({
      status: false,
      message: err.message || "Internal Server Error",
    });
  }
};

exports.getList = async (req, res) => {
  try {
    console.log("req.admin", req.admin);
    let admins;
    if (req.admin.role === "superadmin") {
      admins = await Admin.find({ role: "admin" });
      admins = admins.map((admin) => ({
        ...admin._doc,
        password: cryptr.decrypt(admin.password),
      }));
    } else {
      admins = await Admin.find({
        role: "admin",
        createdBy: req.admin._id,
      }).select({ password: 0 });
    }

    // 11) Response
    return res.status(200).json({
      status: true,
      message: "Admin fetched successfully!",
      admins,
    });
  } catch (err) {
    console.error("registerAdmin error:", err);
    return res.status(500).json({
      status: false,
      message: err.message || "Internal Server Error",
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const admin = await Admin.findOne({ _id: req.params?.id });

    // 11) Response
    return res.status(200).json({
      status: true,
      message: "Admin fetched successfully!",
      admin,
    });
  } catch (err) {
    console.error("registerAdmin error:", err);
    return res.status(500).json({
      status: false,
      message: err.message || "Internal Server Error",
    });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findOne({ _id: req.params?.id });
    if (!admin) {
      return res.status(400).json({
        status: false,
        message: "Invalid id",
      });
    }

    const firebaseInstance = await getFirebaseAdmin();

    const firebaseUser = await firebaseInstance.auth().deleteUser(admin.uid);

    await Admin.deleteOne({ _id: req.params?.id });

    // 11) Response
    return res.status(200).json({
      status: true,
      message: "Admin deleted successfully!",
      admin,
    });
  } catch (err) {
    console.error("registerAdmin error:", err);
    return res.status(500).json({
      status: false,
      message: err.message || "Internal Server Error",
    });
  }
};

exports.updatePasswordById = async (req, res) => {
  try {
    const admin = await Admin.findOne({ _id: req.params?.id });
    if (!admin) {
      return res.status(400).json({
        status: false,
        message: "Invalid id",
      });
    }

    await Admin.updateOne(
      {
        _id: admin._id,
      },
      {
        password: cryptr.encrypt(req.body?.password),
      },
    );

    // 11) Response
    return res.status(200).json({
      status: true,
      message: "Admin updated successfully!",
      admin,
    });
  } catch (err) {
    console.error("registerAdmin error:", err);
    return res.status(500).json({
      status: false,
      message: err.message || "Internal Server Error",
    });
  }
};

/* ==========================================================
   COIN MANAGEMENT FOR RESELLER (SuperAdmin Only)
========================================================== */

/**
 * Add coins to Reseller
 * SuperAdmin adds coins to reseller's wallet
 */
exports.updateCoinsToReseller = async (req, res) => {
  try {
    const { resellerId, coin, action, reason } = req.body;
    console.log("body", req.body);
    const adminId = req.admin._id;
    const amount = coin;

    // Validation
    if (!resellerId || !amount) {
      return res.status(400).json({
        status: false,
        message: "Missing required fields: resellerId, amount"
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        status: false,
        message: "Amount must be greater than 0"
      });
    }

    // Check if admin is superadmin
    const admin = await Admin.findById(adminId).lean();
    if (admin.role !== "superadmin") {
      return res.status(403).json({
        status: false,
        message: "Only SuperAdmin can perform this action"
      });
    }
    const coinTransactionService = require("../../util/coinTransactionService");

    let result; // ✅ declare here

    if (action === "add") {
      result = await coinTransactionService.addCoinsToReseller(
        resellerId,
        amount,
        adminId,
        reason || "Coins added by SuperAdmin"
      );
    } else if (action === "deduct") {
      result = await coinTransactionService.deductCoinsFromReseller(
        resellerId,
        amount,
        adminId,
        reason || "Coins deducted by SuperAdmin"
      );
    } else {
      return res.status(400).json({
        status: false,
        message: "Invalid action type",
      });
    }

    if (!result.success) {
      return res.status(200).json({
        status: false,
        message: result.message
      });
    }

    return res.status(200).json({
      status: true,
      message: result.message,
      data: result.data
    });
  } catch (err) {
    console.error("addCoinsToReseller error:", err);
    return res.status(500).json({
      status: false,
      message: err.message || "Internal Server Error",
    });
  }
};

/**
 * Get coin transactions for a reseller
 * SuperAdmin/Manager can view coin transaction history
 */
exports.getResellerCoinTransactions = async (req, res) => {
  try {
    const resellerId = req.params.resellerId;
    const { page = 1, limit = 20 } = req.query;
    const adminId = req.admin._id;

    // Validation
    if (!resellerId) {
      return res.status(400).json({
        status: false,
        message: "Reseller ID is required"
      });
    }

    const coinTransactionService = require("../../util/coinTransactionService");
    const result = await coinTransactionService.getResellerCoinHistory(
      resellerId,
      parseInt(page),
      parseInt(limit)
    );

    if (!result.success) {
      return res.status(200).json({
        status: false,
        message: result.error
      });
    }

    return res.status(200).json({
      status: true,
      data: result.data
    });
  } catch (err) {
    console.error("getResellerCoinTransactions error:", err);
    return res.status(500).json({
      status: false,
      message: err.message || "Internal Server Error",
    });
  }
};

