const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");

console.log("Mongo: connecting to db...");
mongoose
  .connect(process.env.MongoDb_Connection_String, {})
  .catch((err) => {
    // Don't crash the entire web process on initial DNS/Atlas hiccups.
    // The app can still serve basic health routes and can reconnect later.
    console.error("Mongo: initial connection failed:", err?.message || err);
  });

const db = mongoose.connection;
db.on("error", (err) => {
  console.error("Mongo: connection error:", err?.message || err);
});

module.exports = db;
