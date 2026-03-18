const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");

// ensure Node uses a DNS resolver that can return SRV records
// Some network/DNS providers (especially on Windows) block or don't
// support SRV lookups; Atlas uses `_mongodb._tcp` SRV records for
// mongodb+srv URIs.  If the default resolver fails you get
// `querySrv ECONNREFUSED` like the user saw.
//
// By setting known public servers (Google, Cloudflare) we avoid the
// bad resolver and the connection succeeds.
const dns = require("dns");
// order doesn't really matter; mongoose will do the SRV query soon
// after.  you can add your own preferred DNS servers here.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

console.log("Mongo: connecting to db...");
mongoose.connect(process.env.MongoDb_Connection_String, {});

const db = mongoose.connection;
module.exports = db;
