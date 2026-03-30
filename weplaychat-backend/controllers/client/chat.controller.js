const Chat = require("../../models/chat.model");

//import model
const ChatTopic = require("../../models/chatTopic.model");
const User = require("../../models/user.model");
const Host = require("../../models/host.model");
const History = require("../../models/history.model");
const Agency = require("../../models/agency.model");
const VipPlanPrivilege = require("../../models/vipPlanPrivilege.model");

//mongoose
const mongoose = require("mongoose");

//private key
const admin = require("../../util/privateKey");

//deletefile
const { deleteFiles } = require("../../util/deletefile");

//generateHistoryUniqueId
const generateHistoryUniqueId = require("../../util/generateHistoryUniqueId");

// Unified message sending ( User to User, User to Host, Host to User )
exports.pushChatMessage = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ status: false, message: "Unauthorized access. Invalid token." });
    }

    if (!req.body.receiverId || !req.body.messageType || !req.files) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const senderId = new mongoose.Types.ObjectId(req.user.userId);
    const receiverId = new mongoose.Types.ObjectId(req.body.receiverId);
    const receiverModel = req.body.receiverModel || "Host"; // "User" or "Host"
    const chatTopicId = req.body.chatTopicId ? new mongoose.Types.ObjectId(req.body.chatTopicId) : null;

    const [uniqueId, sender, receiver] = await Promise.all([
      generateHistoryUniqueId(),
      User.findById(senderId).lean().select("name image coin isVip vipLevel vipPlanEndDate isHost hostId"),
      receiverModel === "Host"
        ? Host.findOne({ _id: receiverId, isBlock: false }).lean().select("_id name image fcmToken chatRate agencyId")
        : User.findOne({ _id: receiverId, isBlock: false }).lean().select("_id name image fcmToken"),
    ]);

    if (!sender) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "Sender not found." });
    }

    if (!receiver) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "Receiver not found." });
    }

    let chatTopic;
    if (chatTopicId) {
      chatTopic = await ChatTopic.findById(chatTopicId);
    } else {
      chatTopic = await ChatTopic.findOne({
        $or: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      });

      if (!chatTopic) {
        chatTopic = new ChatTopic({
          senderId: senderId,
          senderModel: sender.isHost ? "Host" : "User",
          receiverId: receiverId,
          receiverModel: receiverModel,
        });
      }
    }

    if (!chatTopic) {
       if (req.files) deleteFiles(req.files);
       return res.status(200).json({ status: false, message: "Chat Topic not found." });
    }

    // --- COIN DEDUCTION LOGIC (Only for User to Host) ---
    let isWithinFreeLimit = true;
    const chatRate = receiverModel === "Host" ? (receiver.chatRate || 10) : 0;
    
    // Only deduct if User is sending to a Host and NOT a Host himself sending to Host
    if (receiverModel === "Host" && !sender.isHost) {
      const maxFreeChatMessages = global.settingJSON ? global.settingJSON.maxFreeChatMessages : 10;
      
      let hasUnlimitedChat = false;
      if (sender.isVip && sender.vipPlanEndDate && new Date(sender.vipPlanEndDate) > new Date()) {
        const privilege = await VipPlanPrivilege.findOne({ level: sender.vipLevel }).lean();
        if (privilege && privilege.unlimitedChat) {
          hasUnlimitedChat = true;
        }
      }
      
      isWithinFreeLimit = hasUnlimitedChat || chatTopic.messageCount < maxFreeChatMessages;

      if (!isWithinFreeLimit && sender.coin < chatRate) {
        if (req.files) deleteFiles(req.files);
        return res.status(200).json({ status: false, message: "Insufficient coins to send message." });
      }
    } else {
       isWithinFreeLimit = true; // FREE for User-User or Host-User
    }

    const chat = new Chat();
    chat.senderId = senderId;
    chat.chatTopicId = chatTopic._id;
    chat.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

    const messageType = Number(req.body.messageType);
    if (messageType == 2) {
      chat.messageType = 2;
      chat.message = "📸 Image";
      chat.image = req?.files?.image ? req?.files?.image[0].path : "";
    } else if (messageType == 3) {
      chat.messageType = 3;
      chat.message = "🎤 Audio";
      chat.audio = req?.files?.audio ? req?.files?.audio[0].path : "";
    } else {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "Invalid messageType." });
    }

    await Promise.all([
      chat.save(),
      ChatTopic.updateOne(
        { _id: chatTopic._id },
        {
          $set: { 
             chatId: chat._id, 
             senderModel: chatTopic.senderModel || "User", 
             receiverModel: chatTopic.receiverModel || receiverModel 
          },
          $inc: { messageCount: 1 },
        }
      ),
    ]);

    res.status(200).json({ status: true, message: "Success", chat });

    // --- Post-send Processing ---
    if (!isWithinFreeLimit && receiverModel === "Host") {
        // Business logic for host earnings, agency commission, and histories
        const adminCommissionRate = global.settingJSON ? global.settingJSON.adminCommissionRate : 10;
        const deductedCoins = chatRate;
        const adminShare = (chatRate * adminCommissionRate) / 100;
        const hostEarnings = chatRate - adminShare;

        let agencyShare = 0;
        let agencyUpdate = null;
        if (receiver.agencyId) {
           const agency = await Agency.findById(receiver.agencyId).lean().select("_id commissionType commission");
           if (agency) {
              agencyShare = agency.commissionType === 1 ? (hostEarnings * agency.commission) / 100 : 0;
              agencyUpdate = Agency.updateOne({ _id: agency._id }, {
                 $inc: {
                   hostCoins: hostEarnings,
                   totalEarnings: Math.floor(agencyShare),
                   totalEarningsWithCommissionAndHostCoin: hostEarnings + Math.floor(agencyShare),
                   netAvailableEarnings: hostEarnings + Math.floor(agencyShare)
                 }
              });
           }
        }

        await Promise.all([
          User.updateOne({ _id: senderId, coin: { $gte: deductedCoins } }, { $inc: { coin: -deductedCoins, spentCoins: deductedCoins } }),
          Host.updateOne({ _id: receiver._id }, { $inc: { coin: hostEarnings } }),
          History.create({
            uniqueId: uniqueId,
            type: 9, // CHAT type
            userId: senderId,
            hostId: receiverId,
            agencyId: receiver?.agencyId,
            userCoin: chatRate,
            hostCoin: hostEarnings,
            adminCoin: adminShare,
            date: chat.date
          }),
          agencyUpdate
        ]);
    }

    // --- FCM Notification ---
    if (receiver.fcmToken) {
      const payload = {
        token: receiver.fcmToken,
        data: {
          title: `${sender.name} sent you a message 📩`,
          body: `🗨️ ${chat.message}`,
          type: "CHAT",
          senderId: String(senderId),
          receiverId: String(receiverId),
          userName: String(sender.name),
          userImage: String(sender.image || ""),
          senderRole: sender.isHost ? "host" : "user",
          chatTopicId: String(chatTopic._id)
        },
      };

      const adminPromise = await admin;
      adminPromise.messaging().send(payload).catch(err => console.error("FCM Error:", err));
    }
  } catch (error) {
    if (req.files) deleteFiles(req.files);
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// Unified chat history retrieval
exports.fetchChatHistory = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ status: false, message: "Unauthorized access. Invalid token." });
    }

    if (!req.query.receiverId) {
      return res.status(200).json({ status: false, message: "receiverId is required." });
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const senderId = new mongoose.Types.ObjectId(req.user.userId);
    const receiverId = new mongoose.Types.ObjectId(req.query.receiverId);
    const receiverModel = req.query.receiverModel || "Host";

    const chatTopic = await ChatTopic.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });

    if (!chatTopic) {
      return res.status(200).json({ status: true, message: "No history found.", chat: [] });
    }

    const [updatedReadStatus, chatHistory, receiverDetails] = await Promise.all([
      Chat.updateMany({ chatTopicId: chatTopic._id, senderId: { $ne: senderId }, isRead: false }, { $set: { isRead: true } }),
      Chat.find({ chatTopicId: chatTopic._id })
        .sort({ createdAt: -1 })
        .skip((start - 1) * limit)
        .limit(limit)
        .lean(),
      receiverModel === "Host" 
         ? Host.findById(receiverId).select("audioCallRate privateCallRate").lean()
         : User.findById(receiverId).select("name").lean()
    ]);

    return res.status(200).json({
      status: true,
      message: "Success",
      chatTopic: chatTopic._id,
      chat: chatHistory,
      callRate: receiverModel === "Host" ? {
        privateCallRate: receiverDetails?.privateCallRate || 0,
        audioCallRate: receiverDetails?.audioCallRate || 0,
      } : null
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//send message ( image or audio ) ( host )
exports.submitChatMessage = async (req, res) => {
  try {
    if (!req.body.senderId || !req.body.chatTopicId || !req.body.receiverId || !req.body.messageType) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const messageType = Number(req.body.messageType);
    const senderId = new mongoose.Types.ObjectId(req.body.senderId);
    const receiverId = new mongoose.Types.ObjectId(req.body.receiverId);
    const chatTopicId = new mongoose.Types.ObjectId(req.body.chatTopicId);

    const [sender, receiver, chatTopic] = await Promise.all([
      Host.findOne({ _id: senderId, isBlock: false }).lean().select("name image"),
      User.findById({ _id: receiverId, isBlock: false }).lean().select("name image fcmToken"),
      ChatTopic.findOne({ _id: chatTopicId }).lean().select("_id chatId"),
    ]);

    if (!sender) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "Sender does not found." });
    }

    if (!receiver) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "Receiver dose not found." });
    }

    if (!chatTopic) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "ChatTopic dose not found." });
    }

    const chat = new Chat();
    chat.senderId = sender._id;

    if (messageType == 2) {
      chat.messageType = 2;
      chat.message = "📸 Image";
      chat.image = req.files ? req?.files?.image[0].path : "";
    } else if (messageType == 3) {
      chat.messageType = 3;
      chat.message = "🎤 Audio";
      chat.audio = req.files ? req?.files?.audio[0].path : "";
    } else {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "messageType must be passed valid." });
    }

    chat.chatTopicId = chatTopic._id;
    chat.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

    await Promise.all([
      chat.save(),
      ChatTopic.updateOne(
        { _id: chatTopic._id },
        {
          $set: { chatId: chat._id },
        }
      ),
    ]);

    res.status(200).json({
      status: true,
      message: "Message sent successfully.",
      chat: chat,
    });

    if (receiver.fcmToken !== null) {
      const payload = {
        token: receiver.fcmToken,
        data: {
          title: `${sender.name} sent you a message 📩`,
          body: `🗨️ ${chat.message}`,
          type: "CHAT",
          senderId: String(chatTopic?.senderId || ""),
          receiverId: String(chatTopic?.receiverId || ""),
          userName: String(sender?.name || ""),
          hostName: String(receiver?.name || ""),
          userImage: String(sender?.image || ""),
          hostImage: String(receiver?.image || ""),
          senderRole: "user",
          isFakeSender: "false",
        },
      };

      const adminPromise = await admin;
      adminPromise
        .messaging()
        .send(payload)
        .then((response) => {
          console.log("Successfully sent with response: ", response);
        })
        .catch((error) => {
          console.log("Error sending message:      ", error);
        });
    }
  } catch (error) {
    if (req.files) deleteFiles(req.files);
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get old chat ( host )
exports.retrieveChatHistory = async (req, res) => {
  try {
    if (!req.query.senderId || !req.query.receiverId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const senderId = new mongoose.Types.ObjectId(req.query.senderId);
    const receiverId = new mongoose.Types.ObjectId(req.query.receiverId);

    let chatTopic;
    const [receiver, foundChatTopic] = await Promise.all([
      User.findOne({ _id: receiverId, isBlock: false }).lean().select("_id"),
      ChatTopic.findOne({
        $or: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      }).select("_id"),
    ]);

    if (!receiver) {
      return res.status(200).json({ status: false, message: "Receiver not found." });
    }

    chatTopic = foundChatTopic;
    if (!chatTopic) {
      chatTopic = new ChatTopic();
      chatTopic.senderId = senderId;
      chatTopic.receiverId = receiver._id;
    }

    const [savedChatTopic, updatedReadStatus, chatHistory] = await Promise.all([
      chatTopic.save(),
      Chat.updateMany({ chatTopicId: chatTopic._id, isRead: false }, { $set: { isRead: true } }),
      Chat.find({ chatTopicId: chatTopic._id })
        .sort({ createdAt: -1 })
        .skip((start - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return res.status(200).json({
      status: true,
      message: "Chat history retrieved successfully.",
      chatTopic: chatTopic._id,
      chat: chatHistory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
