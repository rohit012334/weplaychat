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
    let decodedToken;
    try {
      decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    } catch (error) {
      console.warn("❌ [AUTH] Firebase token verification failed:", error.message);
      
      // DEVELOPMENT BYPASS: If we are on localhost and it's a DNS error, we can optionally bypass for testing
      // But for now, let's just log it clearly. 
      if (error.code === 'auth/network-request-failed' || error.message.includes('ENOTFOUND')) {
         console.warn("⚠️ [AUTH] Network/DNS error detected. In production this would FAIL.");
         // If you want to bypass for local dev, uncomment the next line:
         // decodedToken = { uid: adminUid, email: 'dev@bypass.com' }; 
      }
      
      if (!decodedToken) {
        return res.status(401).json({ status: false, message: `Invalid token: ${error.message}` });
      }
    }

    if (!decodedToken || (!decodedToken.email && !decodedToken.uid)) {
      console.warn("⚠️ [AUTH] Invalid token. Decoded payload:", decodedToken);
      return res.status(401).json({ status: false, message: "Invalid token. Authorization failed." });
    }
    
    // 2. Find admin in DB using UID from TOKEN or Header
    const finalUid = decodedToken.uid || adminUid;
    const mainAdmin = await Admin.findOne({ uid: finalUid }).select("_id email password role uid");

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
