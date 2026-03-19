//express
const express = require("express");
const app = express();

//cors
const cors = require("cors");
app.use(cors());
app.use(express.json());

//logging middleware
const logger = require("morgan");
app.use(logger("dev"));

//path
const path = require("path");

//fs
const fs = require("fs");

//dotenv
require("dotenv").config({ path: path.join(__dirname, ".env") });

//socket io
const http = require("http");
const server = http.createServer(app);
global.io = require("socket.io")(server);

//connection.js
const db = require("./util/connection");

//Declare global variable
global.settingJSON = {};

//Declare the function as a global variable to update the setting.js file
global.updateSettingFile = (settingData) => {
  const settingJSON = JSON.stringify(settingData, null, 2);
  fs.writeFileSync("setting.js", `module.exports = ${settingJSON};`, "utf8");

  global.settingJSON = settingData; // Update global variable
  console.log("Settings file updated.");
};

//Step 1: Import initializeSettings
const initializeSettings = require("./util/initializeSettings");

const port = process.env.PORT || 8000;

// Storage directory: same path for serving and for multer uploads (avoids path mismatch on Railway/different cwd)
const storageDir = path.join(__dirname, "storage");
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
  console.log("✅ Created storage directory:", storageDir);
}

async function startServer() {
  console.log("🔄 Initializing server...");

  // Basic routes (keep these up even if DB/services are down)
  app.get("/", (req, res) => {
    res.status(200).json({ ok: true, name: process.env.APP_NAME || "WePlayChat" });
  });

  app.get("/health", (req, res) => {
    res.status(200).json({ ok: true });
  });

  // Serve uploaded files (images, documents, mp4) — register before listen so /storage works from first request
  app.use("/storage", express.static(storageDir));

  // Start Server immediately
  server.listen(port, () => {
    console.log("Hello World! listening on " + port);
  });

  console.log("🔄 Initializing settings...");
  try {
    await initializeSettings();
    console.log("✅ Settings Loaded");
  } catch (err) {
    console.error("❌ Settings Initialization Failed:", err);
  }

  //Step 2: Require all other modules after settings are initialized
  const routes = require("./routes/route");
  app.use("/api", routes);

  require("./socket");

  db.on("error", () => {
    console.log("Connection Error: ");
  });

  db.once("open", async () => {
    console.log("Mongo: successfully connected to db");
  });
}

//Run server startup
startServer();
