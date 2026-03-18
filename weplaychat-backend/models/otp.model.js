const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  mobileNumber: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 3600 }, // auto-delete after 1 hour
});

module.exports = mongoose.model("Otp", otpSchema);
