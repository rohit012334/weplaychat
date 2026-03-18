const Admin = require("../../models/admin.model");
const Reseller = require("../../models/Reseller.model");
const coinTransactionService = require("../../util/coinTransactionService");

// Cryptr
const getCryptr = require("../../util/getCryptr");
const cryptr = getCryptr();

// delete file
const { deleteFile } = require("../../util/deletefile");
const firebaseAdminPromise = require("../../util/privateKey");
const { generateRoleUniqueId } = require("../../util/generateUniqueId");

// fs and mongoose
const fs = require("fs");
const mongoose = require("mongoose");



/* ==========================================================
   CREATE RESELLER
========================================================== */
exports.createReseller = async (req, res) => {
    try {
        console.log("🔹 [CREATE RESELLER] Body:", req.body);
        console.log("🔹 [CREATE RESELLER] Files:", req.files);
        const {
            name,
            email,
            mobile,
            password,
            description,
            countryCode,
            countryFlagImage,
            country,
            nationalId,
            nationalIdType,
        } = req.body; // images come via req.files

        const nationalIdTypeVal = nationalIdType || "other";

        if (!name || !email || !mobile || !password || !countryCode || !country) {
            console.warn("⚠️ [CREATE RESELLER] Missing fields:", { name, email, mobile, password, countryCode, country });
            if (req.files) Object.values(req.files).flat().forEach(f => deleteFile(f.path));
            return res.status(400).json({
                status: false,
                message: "All required fields (name, email, mobile, password, countryCode, country) must be provided!",
            });
        }

        if (nationalIdTypeVal === "aadhar") {
            if (
                !req.files?.nationalIdFront ||
                !req.files?.nationalIdBack ||
                !req.files.nationalIdFront.length ||
                !req.files.nationalIdBack.length
            ) {
                console.warn("⚠️ [CREATE RESELLER] Aadhar images missing");
                if (req.files) Object.values(req.files).flat().forEach(f => deleteFile(f.path));
                return res.status(400).json({
                    status: false,
                    message: "Both front and back images are required for aadhar ID.",
                });
            }
        }

        const existing = await Reseller.findOne({ email: email.trim().toLowerCase() });
        if (existing) {
            if (req.file) deleteFile(req.file.path);
            return res.status(200).json({
                status: false,
                message: "Reseller with this email already exists.",
            });
        }

        let firebaseInstance;
        try {
            firebaseInstance = await firebaseAdminPromise;
        } catch (firebaseError) {
            console.error("Firebase initialization failed in createReseller:", firebaseError);
            if (req.file) deleteFile(req.file.path);
            return res.status(500).json({
                status: false,
                message: `Firebase initialization failed: ${firebaseError.message}`,
            });
        }

        let firebaseUser;
        try {
            firebaseUser = await firebaseInstance.auth().createUser({
                email: email.trim(),
                password,
                displayName: name,
            });
        } catch (error) {
            if (error.code === "auth/email-already-exists") {
                try {
                    const existingUser = await firebaseInstance.auth().getUserByEmail(email.trim());
                    await firebaseInstance.auth().updateUser(existingUser.uid, { password });
                    firebaseUser = existingUser;
                } catch (updateError) {
                    console.error("Firebase user update error:", updateError);
                    if (req.file) deleteFile(req.file.path);
                    return res.status(500).json({
                        status: false,
                        message: `Failed to update existing Firebase user: ${updateError.message}`,
                    });
                }
            } else {
                console.error("Firebase user creation error:", error);
                if (req.file) deleteFile(req.file.path);
                return res.status(500).json({
                    status: false,
                    message: `Firebase user creation failed: ${error.message}`,
                });
            }
        }

        const uniqueId = `Re-${await generateRoleUniqueId()}`;

        const reseller = new Reseller({
            uid: firebaseUser.uid,
            uniqueId,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: cryptr.encrypt(password),
            image: req.files?.image ? req.files.image[0].path : "",
            mobile,
            description,
            countryCode,
            countryFlagImage,
            country,
            nationalId,
            nationalIdType: nationalIdTypeVal,
            nationalIdImage: {
                front: req.files?.nationalIdFront ? req.files.nationalIdFront[0].path : "",
                back: req.files?.nationalIdBack ? req.files.nationalIdBack[0].path : "",
            },
            createdBy: req.admin._id || undefined,
        });

        await reseller.save();

        reseller.password = undefined;

        return res.status(200).json({
            status: true,
            message: "Reseller created successfully!",
            reseller,
        });
    } catch (error) {
        console.error("createReseller error:", error);
        if (req.files) Object.values(req.files).flat().forEach(f => deleteFile(f.path));

        return res.status(500).json({
            status: false,
            message: error.message || "Internal Server Error",
        });
    }
};



/* ==========================================================
   RESELLER LOGIN
========================================================== */
exports.validateResellerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(200).json({
                status: false,
                message: "Oops! Invalid details!",
            });
        }

        const reseller = await Reseller.findOne({
            email: email.trim().toLowerCase(),
        })
            .select("_id name email password uid")
            .lean();

        if (!reseller) {
            return res.status(200).json({
                status: false,
                message: "Oops! Reseller not found with that email.",
            });
        }

        let decryptedPassword;
        try {
            decryptedPassword = cryptr.decrypt(reseller.password);
        } catch (err) {
            return res.status(200).json({
                status: false,
                message: "Oops! Password doesn't match!",
            });
        }

        if (decryptedPassword !== password) {
            return res.status(200).json({
                status: false,
                message: "Oops! Password doesn't match!",
            });
        }

        reseller.password = undefined;

        return res.status(200).json({
            status: true,
            message: "Reseller has successfully logged in.",
            reseller,
        });
    } catch (error) {
        console.error("validateResellerLogin error:", error);
        return res.status(500).json({
            status: false,
            message: error.message || "Internal Server Error",
        });
    }
};



/* ==========================================================
   RECHARGE-RELATED METHODS (for reseller UI)
========================================================== */

// find a user by id (display name + id)
exports.findUser = async (req, res) => {
    try {
        const { userId } = req.body;
        console.log("findUser called with userId:", userId);
        if (!userId) return res.status(400).json({ status: false, message: "userId required" });
        const User = require("../../models/user.model");
        const user = await User.findOne({ uniqueId: userId }).select("name _id uniqueId coin rechargedCoins").lean();
        console.log("findUser result:", user);
        if (!user) return res.status(200).json({ status: false, message: "User not found" });
        res.status(200).json({ status: true, user });
    } catch (err) {
        console.error("findUser error", err);
        res.status(500).json({ status: false, message: err.message || "Internal Server Error" });
    }
};

// create a recharge record - Reseller recharges user
exports.recharge = async (req, res) => {
    try {
        const { userId, amount, notes } = req.body;
        const resellerId = req.reseller._id;

        // Validation
        if (!userId || !amount) {
            return res.status(400).json({ status: false, message: "Missing required fields: userId, amount" });
        }

        if (amount <= 0) {
            return res.status(400).json({ status: false, message: "Amount must be greater than 0" });
        }

        // Find user by uniqueId
        const User = require("../../models/user.model");
        const user = await User.findOne({ uniqueId: userId });
        if (!user) {
            return res.status(200).json({ status: false, message: "User not found" });
        }

        // Get metadata
        const metadata = {
            notes: notes || "",
            ipAddress: req.ip || req.connection.remoteAddress || "",
            userAgent: req.get('user-agent') || "",
        };

        // Use transaction service to recharge
        const result = await coinTransactionService.resellerRechargeUser(
            resellerId,
            user._id,
            amount,
            metadata
        );

        if (!result.success) {
            return res.status(200).json({ 
                status: false, 
                message: result.message 
            });
        }

        return res.status(200).json({ 
            status: true, 
            message: result.message,
            data: result.data 
        });
    } catch (err) {
        console.error("recharge error", err);
        res.status(500).json({ status: false, message: err.message || "Internal Server Error" });
    }
};

// fetch recharge history for the reseller
exports.getRechargeHistory = async (req, res) => {
    try {
        const resellerId = req.reseller._id;
        const { page = 1, limit = 20 } = req.query;

        const result = await coinTransactionService.getResellerRechargeHistory(
            resellerId,
            parseInt(page),
            parseInt(limit)
        );

        if (!result.success) {
            return res.status(200).json({ status: false, message: result.error });
        }

        res.status(200).json({ status: true, data: result.data });
    } catch (err) {
        console.error("getRechargeHistory error", err);
        res.status(500).json({ status: false, message: err.message || "Internal Server Error" });
    }
};

// update status of a recharge (pending -> done)
exports.updateRechargeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!id || !status) {
            return res.status(400).json({ status: false, message: "id and status required" });
        }
        const Recharge = require("../../models/recharge.model");
        const recharge = await Recharge.findById(id).populate('userId');
        if (!recharge) return res.status(404).json({ status: false, message: "Recharge not found" });
        recharge.status = status;
        await recharge.save();
        // increment coin counters
        const user = recharge.userId;
        user.coin = (user.coin || 0) + recharge.amount;
        user.rechargedCoins = (user.rechargedCoins || 0) + recharge.amount;
        await user.save();
        res.status(200).json({ status: true, message: "Status updated", recharge });
    } catch (err) {
        console.error("updateRechargeStatus error", err);
        res.status(500).json({ status: false, message: err.message || "Internal Server Error" });
    }
};

/* ==========================================================
   GET ALL RESELLERS
========================================================== */
exports.getResellerList = async (req, res) => {
    try {
        console.log("req.admin", req.admin);
        let resellers;
        if (req.admin.role === 'superadmin') {
            resellers = await Reseller.find().sort({ createdAt: -1 });
            resellers = resellers.map(reseller => {
                let decryptedPassword = "";
                try {
                    decryptedPassword = reseller.password ? cryptr.decrypt(reseller.password) : "";
                } catch (e) {
                    decryptedPassword = "Error Decrypting";
                }
                return {
                    ...reseller._doc,
                    password: decryptedPassword,
                };
            });
        } else {
            resellers = await Reseller.find({ createdBy: req.admin._id }).sort({ createdAt: -1 }).select({ password: 0 });
        }

        return res.status(200).json({
            status: true,
            message: "Resellers fetched successfully!",
            resellers,
        });
    } catch (err) {
        console.error("getResellerList error:", err);
        return res.status(500).json({
            status: false,
            message: err.message || "Internal Server Error",
        });
    }
};



/* ==========================================================
   GET RESELLER BY ID
========================================================== */
exports.getResellerById = async (req, res) => {
    try {
        const reseller = await Reseller.findById(req.params?.id).select({ password: 0 });

        if (!reseller) {
            return res.status(404).json({
                status: false,
                message: "Reseller not found.",
            });
        }

        return res.status(200).json({
            status: true,
            message: "Reseller fetched successfully!",
            reseller,
        });
    } catch (err) {
        console.error("getResellerById error:", err);
        return res.status(500).json({
            status: false,
            message: err.message || "Internal Server Error",
        });
    }
};



/* ==========================================================
   DELETE RESELLER
========================================================== */
exports.deleteReseller = async (req, res) => {
    try {
        const reseller = await Reseller.findById(req.params?.id);

        if (!reseller) {
            return res.status(400).json({
                status: false,
                message: "Reseller not found.",
            });
        }

        const firebaseInstance = await firebaseAdminPromise;

        if (reseller.uid) {
            await firebaseInstance.auth().deleteUser(reseller.uid);
        }

        if (reseller.image) {
            deleteFile(reseller.image);
        }

        await Reseller.deleteOne({ _id: reseller._id });

        return res.status(200).json({
            status: true,
            message: "Reseller deleted successfully!",
        });
    } catch (err) {
        console.error("deleteReseller error:", err);
        return res.status(500).json({
            status: false,
            message: err.message || "Internal Server Error",
        });
    }
};



/* ==========================================================
   UPDATE RESELLER PASSWORD
========================================================== */
exports.updateResellerPasswordById = async (req, res) => {
    try {
        const reseller = await Reseller.findById(req.params?.id);

        if (!reseller) {
            return res.status(400).json({
                status: false,
                message: "Reseller not found.",
            });
        }

        if (!req.body?.password) {
            return res.status(400).json({
                status: false,
                message: "Password is required.",
            });
        }

        const firebaseInstance = await firebaseAdminPromise;

        if (reseller.uid) {
            await firebaseInstance.auth().updateUser(reseller.uid, {
                password: req.body.password,
            });
        }

        await Reseller.updateOne(
            { _id: reseller._id },
            { password: cryptr.encrypt(req.body.password) }
        );

        return res.status(200).json({
            status: true,
            message: "Reseller password updated successfully!",
        });
    } catch (err) {
        console.error("updateResellerPasswordById error:", err);
        return res.status(500).json({
            status: false,
            message: err.message || "Internal Server Error",
        });
    }
};

/* ==========================================================
   MODIFY RESELLER PROFILE
========================================================== */
exports.modifyReseller = async (req, res) => {
    try {
        if (!req.reseller || !req.reseller._id) {
            return res.status(401).json({ status: false, message: "Unauthorized access. Invalid token." });
        }

        const { name, email, password, mobile, description, countryFlagImage, country } = req.body;

        const resellerObjectId = req.reseller._id;

        const [existingReseller, reseller] = await Promise.all([
            email ? Reseller.findOne({ email: email.trim() }) : null,
            Reseller.findById(resellerObjectId)
        ]);

        if (email && existingReseller && existingReseller._id.toString() !== resellerObjectId.toString()) {
            return res.status(200).json({ status: false, message: "Email already exists!" });
        }

        if (!reseller) {
            return res.status(200).json({ status: false, message: "Reseller not found." });
        }

        reseller.name = name || reseller.name;
        reseller.email = email?.trim() || reseller.email;
        if (password && password.trim() !== "") {
            reseller.password = cryptr?.encrypt(password);
        } else {
            reseller.password = reseller.password;
        }

        reseller.mobile = mobile || reseller.mobile;
        reseller.description = description || reseller.description;
        reseller.countryFlagImage = countryFlagImage || reseller.countryFlagImage;
        reseller.country = country || reseller.country;

        if (req.file) {
            if (reseller.image) {
                const imagePath = reseller.image.includes("storage") ? "storage" + reseller.image.split("storage")[1] : "";
                if (imagePath && fs.existsSync(imagePath)) {
                    const imageName = imagePath.split("/").pop();
                    if (!["male.png", "female.png"].includes(imageName)) {
                        fs.unlinkSync(imagePath);
                    }
                }
            }
            reseller.image = req.file.path;
        }

        await reseller.save();

        reseller.password = cryptr.decrypt(reseller.password);

        return res.status(200).json({
            status: true,
            message: "Reseller updated successfully!",
            data: reseller,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "Internal server error." });
    }
};

/* ==========================================================
   GET RESELLER PROFILE
========================================================== */
exports.getResellerProfile = async (req, res) => {
    try {
        if (!req.reseller || !req.reseller._id) {
            return res.status(401).json({ status: false, message: "Unauthorized access. Invalid token." });
        }

        const resellerObjectId = req.reseller._id;

        const reseller = await Reseller.findById(resellerObjectId).lean();

        if (!reseller) {
            return res.status(200).json({ status: false, message: "Reseller not found." });
        }

        if (reseller.isBlock) {
            return res.status(200).json({ status: false, message: "Reseller is currently inactive." });
        }

        reseller.password = cryptr.decrypt(reseller.password);

        return res.status(200).json({
            status: true,
            message: "Reseller profile retrieved successfully!",
            data: reseller,
        });
    } catch (error) {
        console.error("Error fetching reseller profile:", error);
        return res.status(500).json({ status: false, message: "Internal server error." });
    }
};

/* ==========================================================
   GET RECHARGE ANALYTICS (for reseller dashboard graph)
========================================================== */
exports.getRechargeAnalytics = async (req, res) => {
    try {
        if (!req.reseller || !req.reseller._id) {
            return res.status(401).json({ status: false, message: "Unauthorized access. Invalid token." });
        }

        const resellerId = req.reseller._id;
        const { startDate, endDate } = req.query;

        const dateFilter = { resellerId: new mongoose.Types.ObjectId(resellerId) };

        if (startDate && endDate && startDate !== "All" && endDate !== "All") {
            dateFilter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
            };
        }

        const Recharge = require("../../models/recharge.model");

        const analytics = await Recharge.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalAmount: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        return res.status(200).json({
            status: true,
            message: "Recharge analytics fetched successfully!",
            analytics,
        });
    } catch (error) {
        console.error("getRechargeAnalytics error:", error);
        return res.status(500).json({ status: false, message: "Internal server error." });
    }
};