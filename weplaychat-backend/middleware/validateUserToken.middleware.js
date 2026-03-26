const admin = require("firebase-admin");
const getFirebaseAdmin = require("../util/privateKey");

//import model
const User = require("../models/user.model");

const validateUserAccessToken = async (req, res, next) => {
  console.log("🔹 [AUTH] Received authentication request.");

  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  const userUid = req.headers["x-user-uid"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("⚠️ [AUTH] Missing or invalid authorization header.");
    return res.status(401).json({ status: false, message: "Authorization token required" });
  }

  if (!userUid) {
    console.warn("⚠️ [AUTH] Missing API key or User UID.");
    return res.status(401).json({ status: false, message: "User UID required for authentication." });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    console.log("🔹 [AUTH] Verifying Firebase token...");
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const header = JSON.parse(Buffer.from(parts[0], "base64").toString());
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
        console.log("🔹 [AUTH] Token Header:", header);
        console.log("🔹 [AUTH] Token Project ID (aud):", payload.aud);
        console.log("🔹 [AUTH] Token Issuer (iss):", payload.iss);
      }
    } catch (e) {
      console.warn("⚠️ [AUTH] Failed to decode token parts for logging:", e.message);
    }

    const firebaseAdmin = await getFirebaseAdmin();
    const currentApp = firebaseAdmin.app();
    
    // Log the Project ID being used for verification to detect mismatch
    console.log("🔹 [AUTH] Using Project ID for verification:", currentApp.options.credential?.projectId || "Default");

    const [decodedToken, mongoUser] = await Promise.all([
      currentApp.auth().verifyIdToken(token),
      User.findOne({ firebaseUid: userUid }).select("_id isBlock").lean(),
    ]);

    if (!decodedToken) {
      console.warn("⚠️ [AUTH] Token verification failed.");
      return res.status(401).json({ status: false, message: "Invalid token. Authorization failed." });
    }

    if (!mongoUser) {
      console.warn(`⚠️ [AUTH] No user found in MongoDB for Firebase UID: ${decodedToken.uid}`);
      return res.status(200).json({ status: false, message: "User not found in the database." });
    }

    if (mongoUser.isBlock) {
      console.warn(`⚠️ [AUTH] User is blocked by admin: ${decodedToken.uid}`);
      return res.status(403).json({ status: false, message: "🚷 User are blocked by the admin." });
    }

    req.user = {
      uid: decodedToken.uid,
      userId: mongoUser._id,
    };

    console.log(`✅ [AUTH] User authentication successful. MongoID: ${mongoUser._id}`);
    next();
  } catch (error) {
    console.error("❌ [AUTH ERROR] Token verification failed:", error.message);

    return res.status(401).json({
      status: false,
      message: error.code === "auth/id-token-expired" ? "Token expired. Please reauthenticate." : "Invalid token. Authorization failed.",
    });
  }
};

module.exports = validateUserAccessToken;
