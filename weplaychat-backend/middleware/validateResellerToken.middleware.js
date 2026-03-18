const admin = require("firebase-admin");
const getFirebaseAdmin = require("../util/privateKey");

//import model
const Reseller = require("../models/Reseller.model");

const validateResellerFirebaseToken = async (req, res, next) => {
  console.log("🔹 [AUTH] Validating Reseller Firebase token...");

  const authHeader = req.headers["authorization"];
  const resellerUid = req.headers["x-reseller-uid"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("⚠️ [AUTH] Missing or invalid authorization header.");
    return res.status(401).json({ status: false, message: "Authorization token required" });
  }

  if (!resellerUid) {
    console.warn("⚠️ [AUTH] Missing API key or Reseller UID.");
    return res.status(401).json({ status: false, message: "Reseller UID required for authentication." });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    // Ensure Firebase Admin SDK is initialized (required before verifyIdToken).
    const firebaseAdmin = await getFirebaseAdmin();
    firebaseAdmin.app();

    const [decodedToken, reseller] = await Promise.all([
      firebaseAdmin.auth().verifyIdToken(token),
      Reseller.findOne({ uid: resellerUid }).select("_id email password"),
    ]);

    if (!decodedToken || !decodedToken.email) {
      console.warn("⚠️ [AUTH] Invalid token. Email not found.");
      return res.status(401).json({ status: false, message: "Invalid token. Authorization failed." });
    }

    //console.log("✅ Decoded Token:", decodedToken);

    if (!reseller) {
      console.warn("⚠️ [AUTH] Reseller not found.");
      return res.status(401).json({ status: false, message: "Reseller not found. Authorization failed." });
    }

    req.reseller = reseller;
    console.log(`✅ [AUTH] Reseller authentication successful. Reseller ID: ${reseller._id}`);
    next();
  } catch (error) {
    console.error("❌ [AUTH ERROR] Token verification failed:", error.message);
    return res.status(401).json({ status: false, message: "Invalid or expired token. Authorization failed." });
  }
};

module.exports = validateResellerFirebaseToken;
