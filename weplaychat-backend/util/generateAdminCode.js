const crypto = require("crypto");
const Admin = require("../models/admin.model");

const generateAdminCode = async (prefix) => {
  let uniqueCode;
  let isUnique = false;

  while (!isUnique) {
    // Generate a 6-digit random number (100000-999999)
    const randomNum = crypto.randomBytes(3).readUIntBE(0, 3) % 900000 + 100000;
    uniqueCode = `${prefix}${randomNum}`;
    
    // Check if this ID already exists for ANY admin/manager
    const existingAdmin = await Admin.findOne({ uniqueId: uniqueCode });
    if (!existingAdmin) {
      isUnique = true;
    }
  }
  return uniqueCode;
};

module.exports = generateAdminCode;
