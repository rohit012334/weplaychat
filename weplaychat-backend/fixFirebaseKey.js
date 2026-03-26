const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const Setting = require("./models/setting.model");

async function fixFirebaseKey() {
  const serviceAccountPath = process.argv[2];
  if (!serviceAccountPath) {
    console.error("Please provide path to serviceAccount.json as an argument.");
    console.log("Usage: node fixFirebaseKey.js ./path/to/serviceAccount.json");
    process.exit(1);
  }

  try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MongoDb_Connection_String);
    console.log("✅ Connected");

    let setting = await Setting.findOne().sort({ createdAt: -1 });
    if (!setting) {
      console.log("Creating new setting document...");
      setting = new Setting({ privateKey: serviceAccount });
    } else {
      console.log(`Updating existing setting document (${setting._id})...`);
      setting.privateKey = serviceAccount;
    }

    await setting.save();
    console.log("✅ Success! Firebase Private Key updated in MongoDB.");
    
    // Also update setting.js if it exists and uses updateSettingFile logic
    if (global.updateSettingFile) {
        global.updateSettingFile(setting);
    } else {
        // Manually update setting.js to be safe
        const settingJSON = JSON.stringify(setting, null, 2);
        fs.writeFileSync("setting.js", `module.exports = ${settingJSON};`, "utf8");
        console.log("✅ Updated setting.js");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed:", error.message);
    process.exit(1);
  }
}

fixFirebaseKey();
