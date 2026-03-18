const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    uid: { type: String, trim: true, default: "" },
    name: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" },
    password: { type: String, trim: true, default: "" },
    image: { type: String, trim: true, default: "" },
    description: { type: String, default: "" },
    purchaseCode: { type: String, trim: true, default: "" },
    mobile: { type: Number, default: "0000000000" },
    countryCode: { type: String, trim: true, default: "" },
    countryFlagImage: { type: String, default: "" },
    country: { type: String, default: "" },
    nationalId: { type: String, trim: true, default: "" },
    nationalIdType: { type: String, enum: ["aadhar", "pan", "driving", "voter", "passport", "other"], default: "other" },
    nationalIdImage: {
      front: { type: String, trim: true, default: "" },
      back: { type: String, trim: true, default: "" },
    },
    isBlock: { type: Boolean, default: false },

    role: {
      type: String,
      enum: ["admin", "superadmin", "manager"],
      default: "admin",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model("Admin", adminSchema);
