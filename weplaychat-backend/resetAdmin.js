const mongoose = require("mongoose");
const cryptr = require("cryptr");
const admin = require("firebase-admin");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Import credentials
const setting = require("./setting");
const Admin = require("./models/admin.model");

const secret = process.env.CRYPTR_SECRET || process.env.secretKey;
if (!secret) {
    throw new Error("Missing env var: CRYPTR_SECRET (or secretKey)");
}
const cryptrInstance = new cryptr(secret);

async function resetAdmin() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MongoDb_Connection_String);
        console.log("✅ Connected to MongoDB");

        const email = "weplaychat@gmail.com";
        const password = "12345678";

        // 1. Initialize Firebase
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(setting.privateKey)
            });
        }

        console.log("Updating Firebase User...");
        let firebaseUid;
        try {
            const user = await admin.auth().getUserByEmail(email);
            await admin.auth().updateUser(user.uid, { password: password });
            firebaseUid = user.uid;
            console.log("✅ Firebase Password Updated");
        } catch (err) {
            const user = await admin.auth().createUser({
                email: email,
                password: password,
                displayName: "Super Admin"
            });
            firebaseUid = user.uid;
            console.log("✅ Firebase User Created");
        }

        // 2. Update MongoDB
        console.log("Updating MongoDB Admin...");
        await Admin.deleteOne({ email: email });
        const newAdmin = new Admin({
            uid: firebaseUid,
            name: "Super Admin",
            email: email,
            password: cryptrInstance.encrypt(password),
            role: "superadmin"
        });
        await newAdmin.save();
        console.log("✅ MongoDB Admin Updated");

        process.exit(0);
    } catch (error) {
        console.error("❌ Reset Failed:", error);
        process.exit(1);
    }
}

resetAdmin();
