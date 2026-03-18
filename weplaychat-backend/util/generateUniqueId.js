const User = require("../models/user.model");
const Host = require("../models/host.model");
const Admin = require("../models/admin.model");
const Reseller = require("../models/Reseller.model");

const generateUniqueId = async () => {
  const characters = "0123456789876543210";
  let uniqueId = "";
  const length = 8;

  let idExists = true;
  while (idExists) {
    uniqueId = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      uniqueId += characters[randomIndex];
    }

    const [user, host] = await Promise.all([User.findOne({ uniqueId }), Host.findOne({ uniqueId })]);

    const existingDoc = user || host;

    if (!existingDoc) {
      idExists = false;
    }
  }

  return uniqueId;
};

const generateRoleUniqueId = async () => {
  const characters = "0123456789876543210";
  let uniqueId = "";
  const length = 8;

  let idExists = true;
  while (idExists) {
    uniqueId = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      uniqueId += characters[randomIndex];
    }

    const [admin, reseller] = await Promise.all([Admin.findOne({ uniqueId }), Reseller.findOne({ uniqueId })]);

    const existingDoc = admin || reseller;

    if (!existingDoc) {
      idExists = false;
    }
  }

  return uniqueId;
};

module.exports = {
  generateUniqueId,
  generateRoleUniqueId,
};

