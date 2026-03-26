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
      console.log("🔹 [FirebaseInit] privateKey loaded:", Boolean(privateKey), "Project ID:", serviceAccount.project_id, "admin apps:", admin.apps?.length ?? 0);

      // Firebase Admin throws "The default Firebase app does not exist" if no default app is registered.
      // Even if admin.apps is non-empty (named apps exist), we must ensure the default app exists.
      try {
        admin.app(); // throws if default app doesn't exist
      } catch {
        console.log("🔄 Initializing default Firebase Admin app...");
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
        console.log("✅ Default Firebase app initialized successfully");
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

module.exports = initFirebase;