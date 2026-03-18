const admin = require("firebase-admin");
const validateAndFixPrivateKey = require("./validateFirebaseKey");

let firebaseInstance = null;
let initializationPromise = null;

const initFirebase = async () => {
  if (firebaseInstance) return firebaseInstance;
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    try {
      const privateKey = global.settingJSON?.privateKey;
      if (!privateKey) throw new Error("Firebase private key not found.");

      const validation = validateAndFixPrivateKey(privateKey);
      if (!validation.valid) throw new Error(validation.error);

      const serviceAccount = validation.privateKey;

      if (!admin.apps.length) {
        console.log("🔄 Initializing Firebase Admin SDK...");
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
        console.log("✅ Firebase initialized successfully");
      }

      firebaseInstance = admin;
      return firebaseInstance;
    } catch (error) {
      console.error("❌ Firebase init failed:", error.message);
      initializationPromise = null;
      throw error;
    }
  })();

  return initializationPromise;
};

module.exports = initFirebase();