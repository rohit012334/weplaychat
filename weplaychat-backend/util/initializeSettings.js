const Setting = require("../models/setting.model"); // MongoDB settings collection
const settingJson = require("../setting");

async function initializeSettings() {
  try {
    let setting = await Setting.findOne().sort({ createdAt: -1 });
    if (!setting) {
      console.log("⚠️ No settings found in DB. Creating default settings document...");
      setting = new Setting({
        privateKey: settingJson.privateKey || {},
        appName: settingJson.appName || "WePlayChat",
        // Other fields will use defaults from the model
      });
      await setting.save();
      console.log("✅ Default Settings document created in DB.");
    }

    global.settingJSON = setting;
    console.log("✅ Settings Initialized from DB");
  } catch (error) {
    console.error("❌ Failed to initialize settings:", error);
    global.settingJSON = settingJson;
  }
}

module.exports = initializeSettings;