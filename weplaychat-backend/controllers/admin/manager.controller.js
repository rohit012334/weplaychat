const Admin = require("../../models/admin.model");

//Cryptr
const getCryptr = require("../../util/getCryptr");
const cryptr = getCryptr();

//deletefile
const { deleteFile } = require("../../util/deletefile");
const getFirebaseAdmin = require("../../util/privateKey");

exports.createManager = async (req, res) => {
  try {
    console.log("🔹 [CREATE MANAGER] Request Body:", req.body);
    const {
      name,
      email,
      mobile,
      password,
      description,
      countryCode,
      countryFlagImage,
      country,
      nationalId,
      nationalIdType,
    } = req.body; // front/back images come from req.files (see multer fields)

    // ===============================
    // ✅ Validation
    // ===============================
    if (!name || !email || !mobile || !password || !countryCode || !country) {
      console.warn("⚠️ [CREATE MANAGER] Validation failed: missing required fields", { name, email, mobile, password, countryCode, country });
      // cleanup uploaded files if present
      if (req.files) {
        Object.values(req.files).flat().forEach(f => deleteFile(f.path));
      }
      return res.status(400).json({
        status: false,
        message: "All required fields (name, email, mobile, password, countryCode, country) must be provided!",
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

    // Check if a manager with this email already exists in Admin collection
    const existingByEmail = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (existingByEmail) {
      if (req.file) deleteFile(req.file.path);
      return res.status(200).json({
        status: false,
        message: "A user with this email already exists.",
      });
    }

    let firebaseInstance;
    try {
      firebaseInstance = await getFirebaseAdmin();
    } catch (firebaseError) {
      console.error("Firebase initialization failed in createManager:", firebaseError);
      if (req.file) deleteFile(req.file.path);
      return res.status(500).json({
        status: false,
        message: `Firebase initialization failed: ${firebaseError.message}`,
      });
    }

    let firebaseUser;
    try {
      firebaseUser = await firebaseInstance.auth().createUser({
        email: email.trim(),
        password: password,
        displayName: name,
      });
    } catch (firebaseError) {
      if (firebaseError.code === "auth/email-already-exists") {
        try {
          const existingFirebaseUser = await firebaseInstance.auth().getUserByEmail(email.trim());
          await firebaseInstance.auth().updateUser(existingFirebaseUser.uid, { password });
          firebaseUser = existingFirebaseUser;
        } catch (updateError) {
          console.error("Firebase user update error:", updateError);
          if (req.file) deleteFile(req.file.path);
          return res.status(500).json({
            status: false,
            message: `Failed to update existing Firebase user: ${updateError.message}`,
          });
        }
      } else {
        console.error("Firebase user creation error:", firebaseError);
        if (req.file) deleteFile(req.file.path);
        return res.status(500).json({
          status: false,
          message: `Firebase user creation failed: ${firebaseError.message}`,
        });
      }
    }

    // Find the superadmin to use as createdBy
    const superAdmin = await Admin.findOne({ role: "superadmin" });

    // build image paths from multer
    const manager = new Admin({
      uid: firebaseUser.uid,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: cryptr.encrypt(password),
      image: req.files?.image ? req.files.image[0].path : "",
      mobile,
      description,
      countryCode,
      countryFlagImage,
      country,
      nationalId,
      nationalIdType,
      nationalIdImage: {
        front: req.files?.nationalIdFront ? req.files.nationalIdFront[0].path : "",
        back: req.files?.nationalIdBack ? req.files.nationalIdBack[0].path : "",
      },
      role: "manager",
      createdBy: superAdmin ? superAdmin._id : undefined,
    });

    await manager.save();

    // Remove password from response
    manager.password = undefined;

    return res.status(200).json({
      status: true,
      message: "Manager created successfully!",
      data: manager,
    });
  } catch (error) {
    console.error("createManager error:", error);
    if (req.files) Object.values(req.files).flat().forEach(f => deleteFile(f.path));
    return res.status(500).json({
      status: false,
      message: error.message || "Internal server error.",
    });
  }
};

exports.validateManagerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details!" });
    }

    const manager = await Admin.findOne({ email: email.trim(), role: "manager" })
      .select("_id name email password role")
      .lean();

    if (!manager) {
      return res.status(200).json({ status: false, message: "Oops! Manager not found with that email." });
    }

    let decryptedPassword;
    try {
      decryptedPassword = cryptr.decrypt(manager.password);
    } catch (e) {
      return res.status(200).json({ status: false, message: "Oops! Password doesn't match!" });
    }

    if (decryptedPassword !== password) {
      return res.status(200).json({ status: false, message: "Oops! Password doesn't match!" });
    }

    return res.status(200).json({
      status: true,
      message: "Manager has successfully logged in.",
      admin: manager
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

exports.getList = async (req, res) => {
  try {
    let managers = await Admin.find({ role: "manager" });
    managers = managers.map((manager) => ({
      ...manager._doc,
      password: cryptr.decrypt(manager.password),
    }));

    return res.status(200).json({
      status: true,
      message: "Managers fetched successfully!",
      managers,
    });
  } catch (err) {
    console.error("getList error:", err);
    return res.status(500).json({
      status: false,
      message: err.message || "Internal Server Error",
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const manager = await Admin.findOne({ _id: req.params?.id, role: "manager" }).select({ password: 0 });

    if (!manager) {
      return res.status(404).json({ status: false, message: "Manager not found." });
    }

    return res.status(200).json({
      status: true,
      message: "Manager fetched successfully!",
      manager,
    });
  } catch (err) {
    console.error("getById error:", err);
    return res.status(500).json({
      status: false,
      message: err.message || "Internal Server Error",
    });
  }
};

exports.deleteManager = async (req, res) => {
  try {
    const manager = await Admin.findOne({ _id: req.params?.id, role: "manager" });
    if (!manager) {
      return res.status(400).json({ status: false, message: "Manager not found." });
    }

    const firebaseInstance = await getFirebaseAdmin();
    if (manager.uid) {
      await firebaseInstance.auth().deleteUser(manager.uid);
    }

    await Admin.deleteOne({ _id: req.params?.id });

    return res.status(200).json({
      status: true,
      message: "Manager deleted successfully!",
    });
  } catch (err) {
    console.error("deleteManager error:", err);
    return res.status(500).json({
      status: false,
      message: err.message || "Internal Server Error",
    });
  }
};

exports.updatePasswordById = async (req, res) => {
  try {
    const manager = await Admin.findOne({ _id: req.params?.id, role: "manager" });
    if (!manager) {
      return res.status(400).json({ status: false, message: "Manager not found." });
    }

    await Admin.updateOne(
      { _id: manager._id },
      { password: cryptr.encrypt(req.body?.password) }
    );

    return res.status(200).json({
      status: true,
      message: "Manager password updated successfully!",
    });
  } catch (err) {
    console.error("updatePasswordById error:", err);
    return res.status(500).json({
      status: false,
      message: err.message || "Internal Server Error",
    });
  }
};
