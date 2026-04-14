const Frame = require("../../models/Frame.model");
const Entry = require("../../models/Entry.model");
const EntryTag = require("../../models/EntryTag.model");
const Background = require("../../models/Background.model");
const Tag = require("../../models/Tag.model");

const User = require("../../models/user.model");
const Host = require("../../models/host.model");
const History = require("../../models/history.model");
const VipPlanPrivilege = require("../../models/vipPlanPrivilege.model");
const generateHistoryUniqueId = require("../../util/generateHistoryUniqueId");
const mongoose = require("mongoose");

// Fetch all store items (Frames, Entries, Backgrounds, etc.)
exports.getStoreItems = async (req, res) => {
    try {
        const [frames, entries, entryTags, backgrounds, tags] = await Promise.all([
            Frame.find({ isActive: true }).sort({ createdAt: -1 }).lean(),
            Entry.find({ isActive: true }).sort({ createdAt: -1 }).lean(),
            EntryTag.find({ isActive: true }).sort({ createdAt: -1 }).lean(),
            Background.find({ isActive: true }).sort({ createdAt: -1 }).lean(),
            Tag.find({ isActive: true }).sort({ createdAt: -1 }).lean(),
        ]);

        return res.status(200).json({
            status: true,
            message: "Store items fetched successfully.",
            data: {
                frames,
                entries,
                entryTags,
                backgrounds,
                tags
            },
        });
    } catch (error) {
        console.error("getStoreItems error:", error);
        return res.status(500).json({
            status: false,
            message: error.message || "Internal Server Error",
        });
    }
};

// Purchase an item from the store
exports.purchaseStoreItem = async (req, res) => {
    try {
        if (!req.user || (!req.user.userId && !req.user.hostId)) {
             return res.status(401).json({ status: false, message: "Unauthorized access." });
        }
        
        const { itemId, itemType } = req.body;
        if (!itemId || !itemType) {
            return res.status(200).json({ status: false, message: "itemId and itemType are required." });
        }
        
        let Model;
        if (itemType === "frame") Model = Frame;
        else if (itemType === "background") Model = Background;
        else if (itemType === "entry") Model = Entry;
        else if (itemType === "entryTag") Model = EntryTag;
        else if (itemType === "tag") Model = Tag;
        else return res.status(200).json({ status: false, message: "Invalid itemType." });

        const item = await Model.findById(itemId);
        if (!item) return res.status(200).json({ status: false, message: "Item not found." });
        if (!item.isActive) return res.status(200).json({ status: false, message: "Item is not active." });

        let account;
        let accountType = "User";
        if (req.user.hostId) {
            account = await Host.findById(req.user.hostId);
            accountType = "Host";
        } else {
            account = await User.findById(req.user.userId);
        }

        if (!account) return res.status(200).json({ status: false, message: "Account not found." });

        // Check if item is already in inventory
        const alreadyOwned = account.inventory.some(inv => inv.itemId.toString() === itemId.toString());
        if (alreadyOwned) {
            return res.status(200).json({ status: false, message: "You already own this item." });
        }

        if (account.coin < item.price) {
            return res.status(200).json({ status: false, message: "Insufficient coins." });
        }

        // Deduct coin and add to inventory
        account.coin -= item.price;
        account.inventory.push({ itemId, itemType });
        await account.save();

        // Create transaction history
        const uniqueId = await generateHistoryUniqueId();
        const historyObj = {
            uniqueId,
            type: 19, // STORE_ITEM_PURCHASE
            userCoin: item.price,
            storeItemId: itemId,
            storeItemType: itemType,
            date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
        };

        if (accountType === "Host") {
            historyObj.hostId = account._id;
        } else {
            historyObj.userId = account._id;
        }
        await History.create(historyObj);

        return res.status(200).json({ status: true, message: "Item purchased successfully." });
    } catch (error) {
        console.error("purchaseStoreItem error:", error);
        return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
    }
};

// Equip or unequip an item from the inventory
exports.equipStoreItem = async (req, res) => {
    try {
        if (!req.user || (!req.user.userId && !req.user.hostId)) {
             return res.status(401).json({ status: false, message: "Unauthorized access." });
        }

        const { itemId, itemType } = req.body;
        if (!itemType || !["frame", "background", "entry", "entryTag", "tag"].includes(itemType)) {
             return res.status(200).json({ status: false, message: "Valid itemType is required." });
        }

        let account = req.user.hostId ? await Host.findById(req.user.hostId) : await User.findById(req.user.userId);
        if (!account) return res.status(200).json({ status: false, message: "Account not found." });

        if (!account.equipped) {
            account.equipped = { frame: null, background: null, entry: null, entryTag: null, tag: null };
        }

        // If itemId is empty or null, unequip
        if (!itemId) {
            const field = itemType === "custom" ? "custom" : itemType;
            account.equipped[field] = "";
            account.equipped[field + "Id"] = "";
            await account.save();
            return res.status(200).json({ status: true, message: `${itemType} unequipped successfully.` });
        }

        let fileUrl = "";

        if (itemId.startsWith("vip_")) {
            // Handle VIP item equip
             if (!account.isVip || new Date(account.vipPlanEndDate) < new Date()) {
                 return res.status(200).json({ status: false, message: "VIP plan expired or not active." });
             }
             const vipPrivilege = await VipPlanPrivilege.findOne({ level: account.vipLevel }).lean();
             if (!vipPrivilege) return res.status(200).json({ status: false, message: "VIP Privilege not found." });

             if (itemType === "frame" && vipPrivilege.vipFrameBadge) fileUrl = vipPrivilege.vipFrameBadge;
             else if (itemType === "background" && vipPrivilege.vipBackground) fileUrl = vipPrivilege.vipBackground;
             else if (itemType === "entry" && itemId.includes("_entry1") && vipPrivilege.vipEntrance1) fileUrl = vipPrivilege.vipEntrance1;
             else if (itemType === "entry" && itemId.includes("_entry2") && vipPrivilege.vipEntrance2) fileUrl = vipPrivilege.vipEntrance2;
             else if (itemType === "entry" && itemId.includes("_entryFree") && vipPrivilege.freeEntryImage) fileUrl = vipPrivilege.freeEntryImage;

             if (!fileUrl) return res.status(200).json({ status: false, message: "This VIP level does not have this item." });

        } else {
            // Check for Custom item (by inventory _id) OR Store item (by itemId)
            const invItem = account.inventory.find(inv => 
                inv._id.toString() === itemId.toString() || 
                (inv.itemId && inv.itemId.toString() === itemId.toString())
            );

            if (!invItem) return res.status(200).json({ status: false, message: "You do not own this item." });

            if (invItem.customFile) {
                fileUrl = invItem.customFile;
            } else {
                // Handle Store item equip
                let Model;
                if (itemType === "frame") Model = Frame;
                else if (itemType === "background") Model = Background;
                else if (itemType === "entry") Model = Entry;
                else if (itemType === "entryTag") Model = EntryTag;
                else if (itemType === "tag") Model = Tag;
                else return res.status(200).json({ status: false, message: "Invalid itemType for store item." });

                const storeItem = await Model.findById(itemId).lean();
                if (!storeItem) return res.status(200).json({ status: false, message: "Item not found in store." });
                fileUrl = storeItem.file || storeItem.image || storeItem.svgaImage || storeItem.webpImage;
            }
        }

        const field = itemType === "custom" ? "custom" : itemType;
        account.equipped[field] = fileUrl;
        account.equipped[field + "Id"] = itemId;
        await account.save();
        return res.status(200).json({ status: true, message: `${itemType} equipped successfully.` });

    } catch (error) {
        console.error("equipStoreItem error:", error);
        return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
    }
};

// Fetch user/host inventory (My Bag)
exports.getMyBag = async (req, res) => {
    try {
        if (!req.user || (!req.user.userId && !req.user.hostId)) {
             return res.status(401).json({ status: false, message: "Unauthorized access." });
        }

        let account = req.user.hostId ? await Host.findById(req.user.hostId).lean() : await User.findById(req.user.userId).lean();
        if (!account) return res.status(200).json({ status: false, message: "Account not found." });

        const bag = {
            frame: [],
            background: [],
            entry: [],
            entryTag: [],
            tag: [],
            custom: []
        };

        if (account.inventory && account.inventory.length > 0) {
             const frameIds = account.inventory.filter(i => i.itemType === 'frame' && i.itemId).map(i => i.itemId);
             const backgroundIds = account.inventory.filter(i => i.itemType === 'background' && i.itemId).map(i => i.itemId);
             const entryIds = account.inventory.filter(i => i.itemType === 'entry' && i.itemId).map(i => i.itemId);
             const entryTagIds = account.inventory.filter(i => i.itemType === 'entryTag' && i.itemId).map(i => i.itemId);
             const tagIds = account.inventory.filter(i => i.itemType === 'tag' && i.itemId).map(i => i.itemId);

             const [frames, backgrounds, entries, entryTags, tags] = await Promise.all([
                 Frame.find({ _id: { $in: frameIds } }).lean(),
                 Background.find({ _id: { $in: backgroundIds } }).lean(),
                 Entry.find({ _id: { $in: entryIds } }).lean(),
                 EntryTag.find({ _id: { $in: entryTagIds } }).lean(),
                 Tag.find({ _id: { $in: tagIds } }).lean()
             ]);

             bag.frame = frames;
             bag.background = backgrounds;
             bag.entry = entries;
             bag.entryTag = entryTags;
             bag.tag = tags;

             // Now add Custom items (those with customFile)
             account.inventory.forEach(inv => {
                 if (inv.customFile) {
                     const customItem = {
                         _id: inv._id, // User sends this as itemId to equip
                         file: inv.customFile,
                         name: inv.customName || "Custom Reward",
                         isCustom: true,
                         itemType: inv.itemType
                     };
                     if (bag[inv.itemType]) bag[inv.itemType].push(customItem);
                     else if (inv.itemType === "custom") bag.custom.push(customItem);
                 }
             });
        }

        // Add VIP Privileges as items in the bag!
        if (account.isVip && account.vipPlanEndDate && new Date(account.vipPlanEndDate) > new Date()) {
             const vipPrivilege = await VipPlanPrivilege.findOne({ level: account.vipLevel }).lean();
             if (vipPrivilege) {
                 if (vipPrivilege.vipFrameBadge) {
                     bag.frame.unshift({ _id: `vip_${vipPrivilege._id}_frame`, file: vipPrivilege.vipFrameBadge, price: 0, isVipItem: true, name: "VIP Frame" });
                 }
                 if (vipPrivilege.vipBackground) {
                     bag.background.unshift({ _id: `vip_${vipPrivilege._id}_background`, file: vipPrivilege.vipBackground, price: 0, isVipItem: true, name: "VIP Background" });
                 }
                 if (vipPrivilege.vipEntrance1) {
                     bag.entry.unshift({ _id: `vip_${vipPrivilege._id}_entry1`, file: vipPrivilege.vipEntrance1, price: 0, isVipItem: true, name: "VIP Entrance 1" });
                 }
                 if (vipPrivilege.vipEntrance2) {
                     bag.entry.unshift({ _id: `vip_${vipPrivilege._id}_entry2`, file: vipPrivilege.vipEntrance2, price: 0, isVipItem: true, name: "VIP Entrance 2" });
                 }
                 if (vipPrivilege.freeEntryImage) {
                     bag.entry.unshift({ _id: `vip_${vipPrivilege._id}_entryFree`, file: vipPrivilege.freeEntryImage, price: 0, isVipItem: true, name: "Free Entry Image" });
                 }
             }
        }

        return res.status(200).json({ 
            status: true, 
             message: "My bag fetched successfully.",
             data: {
                 inventory: bag,
                 equipped: account.equipped || {}
             } 
        });

    } catch (error) {
        console.error("getMyBag error:", error);
        return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
    }
};
