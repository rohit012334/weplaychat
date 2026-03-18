const admin = require("firebase-admin");
const getFirebaseAdmin = require("../util/privateKey");

//import model
const Agency = require("../models/agency.model");

const validateAgencyFirebaseToken = async (req, res, next) => {
  console.log("🔹 [AUTH] Validating Agency Firebase token...");

  const authHeader = req.headers["authorization"];
  const agencyUid = req.headers["x-agency-uid"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("⚠️ [AUTH] Missing or invalid authorization header.");
    return res.status(401).json({ status: false, message: "Authorization token required" });
  }

  if (!agencyUid) {
    console.warn("⚠️ [AUTH] Missing API key or Agency UID.");
    return res.status(401).json({ status: false, message: "Agency UID required for authentication." });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    // Ensure Firebase Admin SDK is initialized (required before verifyIdToken).
    const firebaseAdmin = await getFirebaseAdmin();
    // Throws if default app still isn't registered; helps catch init issues early.
    firebaseAdmin.app();
    console.log("✅ [AUTH] Firebase Admin default app ready");

    const [decodedToken, agency] = await Promise.all([
      firebaseAdmin.auth().verifyIdToken(token),
      Agency.findOne({ uid: agencyUid }).select("_id email password"),
    ]);

    if (!decodedToken || !decodedToken.email) {
      console.warn("⚠️ [AUTH] Invalid token. Email not found.");
      return res.status(401).json({ status: false, message: "Invalid token. Authorization failed." });
    }

    //console.log("✅ Decoded Token:", decodedToken);

    if (!agency) {
      console.warn("⚠️ [AUTH] Agency not found.");
      return res.status(401).json({ status: false, message: "Agency not found. Authorization failed." });
    }

    req.agency = agency;
    console.log(`✅ [AUTH] Agency authentication successful. Agency ID: ${agency._id}`);
    next();
  } catch (error) {
    console.error("❌ [AUTH ERROR] Token verification failed:", error.message);
    return res.status(401).json({ status: false, message: "Invalid or expired token. Authorization failed." });
  }
};

module.exports = validateAgencyFirebaseToken;
