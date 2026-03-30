const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const Setting = require("./models/setting.model");

async function checkSetting() {
    try {
        await mongoose.connect(process.env.MongoDb_Connection_String);
        console.log("✅ Connected to MongoDB");
        const setting = await Setting.findOne().sort({ createdAt: -1 });
        if (setting && setting.privateKey && Object.keys(setting.privateKey).length > 0) {
            console.log("✅ Private key found in DB.");
        } else {
            console.log("❌ No private key found in DB.");
        }
        process.exit(0);
    } catch (error) {
        console.error("❌ Failed:", error);
        process.exit(1);
    }
}
checkSetting();
