function readServiceAccountFromEnv() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json && json.trim()) {
    try {
      return JSON.parse(json);
    } catch (e) {
      throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT_JSON (must be valid JSON).");
    }
  }

  const p = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (p && p.trim()) {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    return require(p);
  }

  return {};
}

module.exports = {
  privateKey: readServiceAccountFromEnv(),
  appName: process.env.APP_NAME || "WePlayChat",
  storagePath: process.env.STORAGE_PATH || "storage",
};