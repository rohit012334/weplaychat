const getFirebaseAdmin = require("../util/privateKey");
const Admin = require("../models/admin.model");

const validateAdminFirebaseToken = async (req, res, next) => {
  console.log("🔹 [AUTH] Processing request for:", req.originalUrl);

  const authHeader = req.headers["authorization"];
  const adminUid = req.headers["x-admin-uid"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("⚠️ [AUTH] Missing or invalid authorization header.");
    return res.status(401).json({ status: false, message: "Authorization token required" });
  }

  if (!adminUid) {
    console.warn("⚠️ [AUTH] Missing Admin UID header.");
    return res.status(401).json({ status: false, message: "Admin UID required for authentication." });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    // Ensure Firebase Admin SDK is initialized before verifyIdToken
    const firebaseAdmin = await getFirebaseAdmin();
    firebaseAdmin.app();

    // 1. Verify token
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    if (!decodedToken || !decodedToken.email) {
      console.warn("⚠️ [AUTH] Invalid token. Email not found.");
      return res.status(401).json({ status: false, message: "Invalid token. Authorization failed." });
    }

    // 2. Find admin in DB
    const mainAdmin = await Admin.findOne({ uid: adminUid }).select("_id email password role uid");

    if (!mainAdmin) {
      console.warn(`⚠️ [AUTH] Admin with UID ${adminUid} not found in database.`);
      // Check if maybe the UID in token matches but header is wrong?
      if (decodedToken.uid !== adminUid) {
        console.warn(`⚠️ [AUTH] UID Mismatch: Token UID is ${decodedToken.uid}, Header UID is ${adminUid}`);
      }
      return res.status(401).json({ status: false, message: "Admin not found. Authorization failed." });
    }

    req.admin = mainAdmin;
    console.log(`✅ [AUTH] Authentication successful: ${mainAdmin.email} (${mainAdmin.role})`);
    next();
  } catch (error) {
    console.error("❌ [AUTH ERROR] Token verification failed:", error.message);
    return res.status(401).json({ status: false, message: `Invalid token: ${error.message}` });
  }
};

module.exports = validateAdminFirebaseToken;
