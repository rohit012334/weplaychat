const mongoose = require("mongoose");

const resellerSchema = new mongoose.Schema(
  {
    uid: { type: String, trim: true, default: "" },
    uniqueId: { type: String, unique: true, trim: true, default: "" },
    name: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" },
    mobile: { type: Number, default: "0000000000" },
    password: { type: String, trim: true, default: "" },
    image: { type: String, trim: true, default: "" },
    description: { type: String, default: "" },
    countryCode: { type: String, trim: true, default: "" },
    countryFlagImage: { type: String, default: "" },
    country: { type: String, default: "" },
    nationalId: { type: String, trim: true, default: "" },
    nationalIdType: { type: String, enum: ["aadhar", "pan", "driving", "voter", "passport", "other"], default: "other" },
    nationalIdImage: {
      front: { type: String, trim: true, default: "" },
      back: { type: String, trim: true, default: "" },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    isBlock: { type: Boolean, default: false },
    coin: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

resellerSchema.index({ isBlock: 1 });
resellerSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Reseller", resellerSchema);
