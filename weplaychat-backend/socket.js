///import model
const Agency = require("./models/agency.model");
const User = require("./models/user.model");
const Host = require("./models/host.model");
const ChatTopic = require("./models/chatTopic.model");
const Chat = require("./models/chat.model");
const History = require("./models/history.model");
const Gift = require("./models/gift.model");
const Privatecall = require("./models/privatecall.model");
const Randomcall = require("./models/randomcall.model");
const LiveBroadcaster = require("./models/liveBroadcaster.model");
const LiveBroadcastView = require("./models/liveBroadcastView.model");
const LiveBroadcastHistory = require("./models/liveBroadcastHistory.model");
const VipPlanPrivilege = require("./models/vipPlanPrivilege.model");
const Block = require("./models/block.model");

//generateHistoryUniqueId
const generateHistoryUniqueId = require("./util/generateHistoryUniqueId");

//mongoose
const mongoose = require("mongoose");

//moment
const moment = require("moment-timezone");

//agora-access-token
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

io.on("connection", async (socket) => {
  console.log("Socket Connection done Client ID: ", socket.id);

  const { globalRoom } = socket.handshake.query;
  console.error(socket.handshake.query);
  const id = globalRoom.split(":")[1];
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    console.warn("Invalid or missing ID from globalRoom:", globalRoom);
    return;
  }

  console.log("Socket connected with:", id);

  if (globalRoom) {
    if (!socket.rooms.has(globalRoom)) {
      socket.join(globalRoom);
      console.log(`Socket joined room: ${globalRoom}`);
    } else {
      console.log(`Socket is already in room: ${globalRoom}`);
    }

    const user = await User.findById(id).select("_id isOnline").lean();

    if (user) {
      await User.findByIdAndUpdate(user._id, { $set: { isOnline: true } }, { new: true });
    } else {
      const host = await Host.findOne({ _id: id, status: 2 }).select("_id isOnline").lean();

      if (host) {
        await Host.findByIdAndUpdate(host._id, { $set: { isOnline: true } }, { new: true });
      }
    }
  } else {
    console.warn("Invalid globalRoom format:", globalRoom);
  }

  // --- Unified Chat Message Handling ---
  socket.on("chatMessageSent", async (data) => {
    try {
      const parseData = typeof data === "string" ? JSON.parse(data) : data;
      console.log("🔹 [Socket] chatMessageSent received:", parseData);

      const senderId = new mongoose.Types.ObjectId(parseData?.senderId);
      const receiverUserId = new mongoose.Types.ObjectId(parseData?.receiverId);
      const chatTopicId = new mongoose.Types.ObjectId(parseData?.chatTopicId);

      const [uniqueId, sender, receiverUser, chatTopic] = await Promise.all([
        generateHistoryUniqueId(),
        User.findById(senderId).lean().select("_id name image coin isVip vipLevel vipPlanEndDate isHost"),
        User.findById(receiverUserId).lean().select("_id name image fcmToken isHost isBlock"),
        ChatTopic.findById(chatTopicId).lean().select("_id senderId receiverId chatId messageCount"),
      ]);

      if (!sender || !receiverUser || !chatTopic) {
        console.log("❌ Sender, Receiver or Topic not found via socket");
        return;
      }

      // --- Coin Deduction Check (User to Host) ---
      let hostReceiver = null;
      let isWithinFreeLimit = true;
      let chatRate = 0;

      if (receiverUser.isHost && !sender.isHost) {
          hostReceiver = await Host.findOne({ userId: receiverUserId, isBlock: false }).lean().select("_id chatRate agencyId");
          if (hostReceiver) {
              chatRate = hostReceiver.chatRate || (global.settingJSON ? global.settingJSON.chatRate : 10);
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
                console.log("❌ Insufficient coins via socket.");
                io.in("globalRoom:" + senderId.toString()).emit("insufficientCoins", "Insufficient coins to send message.");
                return;
              }
          }
      }

      const chat = new Chat({
        messageType: parseData?.messageType || 1, // Default to Text
        senderId: senderId,
        message: parseData?.message || "",
        image: parseData?.image || "",
        chatTopicId: chatTopic._id,
        date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      });

      await Promise.all([
        chat.save(),
        ChatTopic.updateOne({ _id: chatTopic._id }, {
            $set: { chatId: chat._id },
            $inc: { messageCount: 1 },
        }),
      ]);

      const eventData = {
        data: { ...parseData, messageId: chat._id.toString(), date: chat.date },
        messageId: chat._id.toString(),
      };

      // Emit to both parties
      io.in("globalRoom:" + senderId.toString()).emit("chatMessageSent", eventData);
      io.in("globalRoom:" + receiverUserId.toString()).emit("chatMessageSent", eventData);

      // --- Post-send Coin Deduction Logic ---
      if (!isWithinFreeLimit && hostReceiver) {
          const adminCommissionRate = global.settingJSON ? global.settingJSON.adminCommissionRate : 10;
          const adminShare = (chatRate * adminCommissionRate) / 100;
          const hostEarnings = chatRate - adminShare;

          let agencyShare = 0;
          let agencyUpdate = null;
          if (hostReceiver.agencyId) {
             const agency = await Agency.findById(hostReceiver.agencyId).lean().select("_id commissionType commission");
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
            User.updateOne({ _id: senderId, coin: { $gte: chatRate } }, { $inc: { coin: -chatRate, spentCoins: chatRate } }),
            Host.updateOne({ _id: hostReceiver._id }, { $inc: { coin: hostEarnings } }),
            History.create({
              uniqueId: uniqueId,
              type: 9,
              userId: senderId,
              hostId: hostReceiver._id,
              agencyId: hostReceiver?.agencyId,
              userCoin: chatRate,
              hostCoin: hostEarnings,
              adminCoin: adminShare,
              date: chat.date
            }),
            agencyUpdate
          ]);
          console.log(`💰 [Socket] coins deducted for messaging`);
      }

      // --- FCM Notification ---
      if (receiverUser.fcmToken && !receiverUser.isBlock) {
        const payload = {
          token: receiverUser.fcmToken,
          data: {
            title: `${sender.name} sent you a message 📩`,
            body: `🗨️ ${chat.message}`,
            type: "CHAT",
            senderId: String(senderId),
            receiverId: String(receiverUserId),
            userName: String(sender.name),
            userImage: String(sender.image || ""),
            senderRole: sender.isHost ? "host" : "user",
          },
        };

        const adminInstance = await admin();
        adminInstance.messaging().send(payload).catch(err => console.error("FCM Error via Socket:", err));
      }
    } catch (error) {
      console.error("Error in socket chatMessageSent:", error);
    }
  });

  // --- Unified Gift Handling ---
  socket.on("chatGiftSent", async (data) => {
    try {
      const parseData = typeof data === "string" ? JSON.parse(data) : data;
      console.log("🎁 [Socket] chatGiftSent received:", parseData);

      const senderId = new mongoose.Types.ObjectId(parseData?.senderId);
      const receiverUserId = new mongoose.Types.ObjectId(parseData?.receiverId);
      const chatTopicId = new mongoose.Types.ObjectId(parseData?.chatTopicId);
      const giftId = new mongoose.Types.ObjectId(parseData?.giftId);

      const [uniqueId, sender, receiverUser, chatTopic, gift] = await Promise.all([
        generateHistoryUniqueId(),
        User.findById(senderId).lean().select("_id name coin"),
        User.findById(receiverUserId).lean().select("_id name fcmToken isHost isBlock"),
        ChatTopic.findById(chatTopicId).lean().select("_id senderId receiverId chatId"),
        Gift.findById(giftId).lean().select("_id coin image svgaImage type"),
      ]);

      if (!sender || !receiverUser || !chatTopic || !gift) {
        console.log("❌ Missing gift or chat setup for gift sending");
        return;
      }

      const giftPrice = gift?.coin || 0;
      const giftCount = parseData?.giftCount || 1;
      const totalGiftCost = giftPrice * giftCount;

      if (sender.coin < totalGiftCost) {
        console.log("❌ Insufficient gift coins via socket.");
        io.in("globalRoom:" + senderId.toString()).emit("insufficientCoins", "Insufficient coins to send gift.");
        return;
      }

      const chat = new Chat({
        messageType: 4, // GIFT
        message: `🎁 ${sender.name} sent a gift`,
        giftImage: gift.image || "",
        giftsvgaImage: gift.svgaImage || "",
        senderId: senderId,
        chatTopicId: chatTopic._id,
        giftCount: giftCount,
        giftType: gift.type,
        date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      });

      await Promise.all([
        chat.save(),
        ChatTopic.updateOne({ _id: chatTopic._id }, { $set: { chatId: chat._id } }),
      ]);

      const eventData = {
        data: { ...parseData, messageId: chat._id.toString(), date: chat.date },
        messageId: chat._id.toString(),
      };

      io.in("globalRoom:" + senderId.toString()).emit("chatGiftSent", eventData);
      io.in("globalRoom:" + receiverUserId.toString()).emit("chatGiftSent", eventData);

      // --- Reward Logic ---
      const hostReceiver = receiverUser.isHost ? await Host.findOne({ userId: receiverUserId }).lean() : null;
      const adminCommissionRate = global.settingJSON ? global.settingJSON.adminCommissionRate : 10;
      const adminShare = (totalGiftCost * adminCommissionRate) / 100;
      const hostEarnings = totalGiftCost - adminShare;

      let agencyShare = 0;
      let agencyUpdate = null;
      if (hostReceiver && hostReceiver.agencyId) {
         const agency = await Agency.findById(hostReceiver.agencyId).lean().select("_id commissionType commission");
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
        User.updateOne({ _id: senderId, coin: { $gte: totalGiftCost } }, { $inc: { coin: -totalGiftCost, spentCoins: totalGiftCost } }),
        hostReceiver ? Host.updateOne({ _id: hostReceiver._id }, { $inc: { coin: hostEarnings, totalGifts: 1 } }) : 
                     User.updateOne({ _id: receiverUserId }, { $inc: { coin: hostEarnings } }),
        History.create({
          uniqueId: uniqueId,
          type: 10, // GIFT type
          userId: senderId,
          hostId: hostReceiver ? hostReceiver._id : null,
          receiverId: !hostReceiver ? receiverUserId : null,
          agencyId: hostReceiver?.agencyId,
          giftId: gift._id,
          giftCoin: gift.coin || 0,
          userCoin: totalGiftCost,
          hostCoin: hostEarnings,
          adminCoin: adminShare,
          date: chat.date
        }),
        agencyUpdate
      ]);

      if (receiverUser.fcmToken && !receiverUser.isBlock) {
        const payload = {
          token: receiverUser.fcmToken,
          data: {
            title: `${sender.name} sent you a gift 🎁`,
            body: `💝 Gift worth ${totalGiftCost} coins!`,
            type: "GIFT",
          },
        };
        const adminInstance = await admin();
        adminInstance.messaging().send(payload).catch(err => console.error("Gift FCM error:", err));
      }
    } catch (error) {
      console.error("Gift socket error:", error);
    }
  });

  socket.on("chatMessageSeen", async (data) => {
    try {
      const parsedData = typeof data === "string" ? JSON.parse(data) : data;
      console.log("🔹 Data in chatMessageSeen event:", parsedData);

      const updated = await Chat.findByIdAndUpdate(parsedData.messageId, { $set: { isRead: true } }, { new: true, lean: true, select: "_id isRead" });

      if (!updated) {
        console.log(`No message found with ID ${parsedData.messageId}`);
      } else {
        console.log(`Updated isRead to true for message with ID: ${updated._id}`);
      }
    } catch (error) {
      console.error("Error updating chatMessageSeen:", error);
    }
  });

  //private video call
  socket.on("callRinging", async (data) => {
    const parsedData = typeof data === "string" ? JSON.parse(data) : data;
    console.log("callRinging request received:", parsedData);
    console.error("callRinging request received:", parsedData);

    const { callerId, receiverId, agoraUID, channel, callType, callerRole, receiverRole } = parsedData;

    const validRoles = ["user", "host"];
    if (!validRoles.includes(callerRole?.toLowerCase()) || !validRoles.includes(receiverRole?.toLowerCase())) {
      io.in("globalRoom:" + callerId.toString()).emit("callRinging", { message: "Invalid roles provided." });
      return;
    }

    const callerModel = callerRole.trim().toLowerCase() === "user" ? User : Host;
    const receiverModel = receiverRole.trim().toLowerCase() === "host" ? Host : User;

    const role = RtcRole.PUBLISHER;
    const uid = agoraUID ? agoraUID : 0;
    const expirationTimeInSeconds = 24 * 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    console.log("🔹 [Socket - callRinging] Generating Agora Token:");
    console.log("   - AppId:", global.settingJSON?.agoraAppId);
    console.log("   - Certificate:", global.settingJSON?.agoraAppCertificate);
    console.log("   - Channel:", channel);
    console.log("   - UID:", uid);

    const [callUniqueId, token, caller, receiver] = await Promise.all([
      generateHistoryUniqueId(),
      RtcTokenBuilder.buildTokenWithUid(global.settingJSON?.agoraAppId, global.settingJSON?.agoraAppCertificate, channel, uid, role, privilegeExpiredTs),
      callerModel.findById(callerId).select("_id name image isBlock isBusy callId isOnline uniqueId freeCallCount freeCallHosts coin isVip vipLevel vipPlanEndDate").lean(),
      receiverModel.findById(receiverId).select("_id name image isBlock isBusy callId isOnline uniqueId fcmToken isLive privateCallRate audioCallRate").lean(),
    ]);

    if (!caller) {
      io.in("globalRoom:" + callerId.toString()).emit("callRinging", { message: "Caller does not found." });
      return;
    }

    if (caller.isBlock) {
      io.in("globalRoom:" + callerId.toString()).emit("callRinging", {
        message: "Caller is blocked.",
        isBlock: true,
      });
      return;
    }

    if (caller.isBusy && caller.callId) {
      io.in("globalRoom:" + callerId.toString()).emit("callRinging", {
        message: "Caller is busy with someone else.",
        isBusy: true,
      });
      return;
    }

    if (!receiver) {
      io.in("globalRoom:" + callerId.toString()).emit("callRinging", { message: "Receiver does not found." });
      return;
    }

    if (receiver.isBlock) {
      io.in("globalRoom:" + callerId.toString()).emit("callRinging", {
        message: "Receiver is blocked.",
        isBlock: true,
      });
      return;
    }

    if (!receiver.isOnline) {
      io.in("globalRoom:" + callerId.toString()).emit("callRinging", {
        message: "Receiver is not online.",
        isOnline: false,
      });
      return;
    }

    const isLiveHostIncomingCall = receiverRole.trim().toLowerCase() === "host" && receiver.isLive;
    console.error(`=-=-=-=isLiveHostIncomingCall=-=-${isLiveHostIncomingCall}`)
    console.error("=-=-=-=receiverRole=-=-", receiverRole)
    console.error("=-=-=-=receiverRole=-=-", receiverRole === "host")
    console.error("=-=-=-=receiverRole=-=-", receiver.isLive)
    console.error("=-=-=-=receiverRole=-=-", receiver)

    if ((receiver.isBusy && receiver.callId) && !isLiveHostIncomingCall) {
      io.in("globalRoom:" + callerId.toString()).emit("callRinging", {
        message: "Receiver is busy with another call.",
        isBusy: true,
      });
      return;
    }

    let isFreeCall = false;
    if (callerRole.trim().toLowerCase() === "user" && receiverRole.trim().toLowerCase() === "host") {
      const isFreeCallHost = caller.freeCallHosts ? caller.freeCallHosts.some((id) => id.toString() === receiver._id.toString()) : false;

      if (settingJSON.isFreeCallEnabled && caller.freeCallCount > 0 && !isFreeCallHost) {
        isFreeCall = true;
        console.log("🆓 This is a FREE call!");
      } else {
        let callRate = callType.trim().toLowerCase() === "audio" ? receiver.audioCallRate : receiver.privateCallRate;
        
        // VIP Discount Logic
        if (caller.isVip && caller.vipPlanEndDate && new Date(caller.vipPlanEndDate) > new Date()) {
          const privilege = await VipPlanPrivilege.findOne({ level: caller.vipLevel }).lean();
          if (privilege) {
            const discount = (callType.trim().toLowerCase() === "audio" ? 0 : privilege.videoCallDiscount) || 0; 
             // Note: You can add audioCallDiscount to model later if needed
            callRate = Math.floor(callRate * (1 - discount / 100));
            console.log(`🎁 VIP Discount Applied: ${discount}% | Original: ${receiver.privateCallRate} | Final: ${callRate}`);
          }
        }

        if (caller.coin < callRate) {
          io.in("globalRoom:" + callerId.toString()).emit("callRinging", {
            message: "Insufficient coins. Please recharge to call.",
            insufficientCoins: true,
          });
          return;
        }
      }
    }

    if ((!receiver.isBusy && receiver.callId === null) || isLiveHostIncomingCall) {
      console.log("Receiver and Caller are free. Proceeding with call setup.");

      const callHistory = new History();
      callHistory.uniqueId = callUniqueId;

      const [callerVerify, receiverVerify] = await Promise.all([
        callerModel.updateOne(
          {
            _id: caller._id,
            isBlock: false,
            isOnline: true,
            // isBusy: false,
            callId: null,
            ...(callerRole.trim().toLowerCase() === "host" ? { isFake: false } : {}),
          },
          {
            $set: {
              isBusy: true,
              callId: callHistory._id.toString(),
            },
          }
        ),
        receiverModel.updateOne(
          {
            _id: receiver._id,
            isBlock: false,
            isOnline: true,
            // isBusy: false,
            // callId: null,
            ...(receiverRole.trim().toLowerCase() === "host" ? { isFake: false } : {}),
          },
          {
            $set: {
              isBusy: true,
              callId: callHistory._id.toString(),
            },
          }
        ),
      ]);

      console.log(callerVerify, receiverVerify);

      if (callerVerify.modifiedCount > 0 && receiverVerify.modifiedCount > 0) {
        const dataOfVideoCall = {
          callType: callType,
          callerId: caller._id,
          receiverId: receiver._id,
          callerImage: caller.image,
          callerName: caller.name,
          callerUniqueId: caller.uniqueId,
          receiverName: receiver.name,
          receiverImage: receiver.image,
          receiverUniqueId: receiver.uniqueId,
          callId: callHistory._id,
          callType: callType.trim().toLowerCase(),
          callMode: "private",
          callerRole,
          receiverRole,
          token,
          channel,
          isFree: isFree,
        };

        io.in("globalRoom:" + receiver._id.toString()).emit("callIncoming", dataOfVideoCall); // Notify receiver
        io.in("globalRoom:" + caller._id.toString()).emit("callConnected", dataOfVideoCall); // Notify caller

        if (!receiver.isBlock && receiver.fcmToken !== null) {
          const isVideo = callType?.trim().toLowerCase() === "video";
          const callerName = caller?.name?.trim() || "Someone";

          const notificationTitle = isVideo ? "📹 Video Call Request" : "📞 Audio Call Request";
          const notificationBody = isVideo
            ? `${callerName} is inviting you to a video call. Tap to connect now! 👥`
            : `${callerName} is calling you for an audio chat. Tap to join the conversation! 📞`;

          const payload = {
            token: receiver.fcmToken,
            data: {
              title: notificationTitle,
              body: notificationBody,
              type: "callIncoming",
              callType: String(dataOfVideoCall.callType),
              callId: String(dataOfVideoCall.callId),
              callerId: String(dataOfVideoCall.callerId),
              receiverId: String(dataOfVideoCall.receiverId),
              callerName: String(dataOfVideoCall.callerName),
              callerImage: String(dataOfVideoCall.callerImage),
              callerUniqueId: String(dataOfVideoCall.callerUniqueId),
              receiverName: String(dataOfVideoCall.receiverName),
              receiverImage: String(dataOfVideoCall.receiverImage),
              receiverUniqueId: String(dataOfVideoCall.receiverUniqueId),
              token: String(dataOfVideoCall.token),
              channel: String(dataOfVideoCall.channel),
              callMode: String(dataOfVideoCall.callMode),
              isFree: String(dataOfVideoCall.isFree),
              gender: String(dataOfVideoCall.gender),
            },
          };

          const adminInstance = await admin;
          adminInstance
            .messaging()
            .send(payload)
            .then((response) => {
              console.log("📨 Call notification sent successfully:", response);
            })
            .catch((error) => {
              console.error("⚠️ Failed to send call notification:", error);
            });
        }

        console.log(`Call successfully initiated: ${caller.name} → ${receiver.name}`);

        callHistory.type = callType?.trim()?.toLowerCase() === "audio" ? 11 : callType?.trim()?.toLowerCase() === "video" ? 12 : null;
        callHistory.callType = callType?.trim()?.toLowerCase();
        callHistory.isPrivate = true;
        callHistory.userId = caller._id;
        callHistory.hostId = receiver._id;
        callHistory.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

        await Promise.all([
          callHistory.save(),
          Privatecall({
            caller: caller._id,
            receiver: receiver._id,
          }).save(),
        ]);
      } else {
        console.log("Failed to verify caller or receiver availability");

        io.in("globalRoom:" + caller._id.toString()).emit("callRinging", {
          message: "Call setup failed. One or both users became unavailable.",
          isBusy: true,
        });

        // Update isBusy only for the user who failed verification
        if (callerVerify.modifiedCount > 0) {
          await User.updateOne({ _id: callerId, isBusy: true }, { $set: { isBusy: false, callId: null } });
          console.log(`🔹 Caller Status Updated: Caller verification failed, isBusy reset`);
        }

        if (receiverVerify.modifiedCount > 0) {
          await Host.updateOne({ _id: receiverId, isBusy: true }, { $set: { isBusy: false, callId: null } });
          console.log(`🔹 Receiver Status Updated: Receiver verification failed, isBusy reset`);
        }
        return;
      }
    } else {
      console.log("Condition not met - receiver not available");
      console.error("Condition not met - receiver not available --> callRinging");

      io.in("globalRoom:" + callerId.toString()).emit("callRinging", {
        message: "Receiver is unavailable for a call at this moment.",
        isBusy: true,
      });
      return;
    }
  });

  socket.on("callResponseHandled", async (data) => {
    try {
      const parsedData = typeof data === "string" ? JSON.parse(data) : data;

      const { callerId, receiverId, callId, isAccept, callType, callMode, callerRole, receiverRole } = parsedData;
      console.log("🟢 [callResponseHandled] Event received:", parsedData);

      const validRoles = ["user", "host"];
      if (!validRoles.includes(callerRole?.toLowerCase()) || !validRoles.includes(receiverRole?.toLowerCase())) {
        io.in("globalRoom:" + callerId.toString()).emit("callRinging", { message: "Invalid roles provided." });
        return;
      }

      const callerModel = callerRole.trim().toLowerCase() === "user" ? User : Host;
      const receiverModel = receiverRole.trim().toLowerCase() === "host" ? Host : User;

      const callerRoom = `globalRoom:${callerId}`;
      const receiverRoom = `globalRoom:${receiverId}`;

      console.log(`🔄 Fetching caller, receiver, and call history for callId: ${callId}`);

      const [caller, receiver, callHistory] = await Promise.all([
        callerModel.findById(callerId).select("_id name isBusy callId").lean(),
        receiverModel.findById(receiverId).select("_id name isBusy callId").lean(),
        History.findById(callId).select("_id callConnect callEndTime duration isFree"),
      ]);

      if (!caller || !receiver || !callHistory) {
        console.error("❌ [callResponseHandled] Invalid caller, receiver, or call history.");
        return io.to(callerRoom).emit("callResponseHandled", { message: "Invalid call data." });
      }

      console.log(`✅ Caller: ${caller.name} | Receiver: ${receiver.name} | Call ID: ${callId}`);

      if (callMode.trim().toLowerCase() === "private") {
        if (!isAccept && caller.callId?.toString() === callId.toString()) {
          console.log(`📵 [callResponseHandled] Call rejected by receiver ${receiver.name}`);

          io.to(callerRoom).emit("callRejected", data);
          io.to(receiverRoom).emit("callRejected", data);

          const [callerUpdate, receiverUpdate, privateCallDeleted] = await Promise.all([
            callerModel.updateOne({ _id: caller._id }, { $set: { isBusy: false, callId: null } }),
            receiverModel.updateOne({ _id: receiver._id }, { $set: { isBusy: false, callId: null } }),
            Privatecall.deleteOne({ caller: caller._id, receiver: receiver._id }),
          ]);

          console.log(`🔹 Caller Status Updated:`, callerUpdate);
          console.log(`🔹 Receiver Status Updated:`, receiverUpdate);
          console.log(`🔹 Private Call Deleted:`, privateCallDeleted);

          let chatTopic;
          chatTopic = await ChatTopic.findOne({
            $or: [
              {
                $and: [{ senderId: caller._id }, { receiverId: receiver._id }],
              },
              {
                $and: [{ senderId: receiver._id }, { receiverId: caller._id }],
              },
            ],
          });

          const chat = new Chat();

          if (!chatTopic) {
            chatTopic = new ChatTopic();

            chatTopic.chatId = chat._id;
            chatTopic.senderId = caller._id;
            chatTopic.receiverId = receiver._id;
          }

          chat.chatTopicId = chatTopic._id;
          chat.senderId = callerId;
          chat.messageType = callType.trim().toLowerCase() === "audio" ? 5 : 6;
          chat.message = callType.trim().toLowerCase() === "audio" ? "📞 Audio Call" : "📽 Video Call";
          chat.callType = 2; // 2.declined
          chat.callId = callId;
          chat.isRead = true;
          chat.date = new Date().toLocaleString();

          chatTopic.chatId = chat._id;

          callHistory.callConnect = false;
          callHistory.callEndTime = moment().tz("Asia/Kolkata").format();

          const start = moment.tz(callHistory.callStartTime, "Asia/Kolkata");
          const end = moment.tz(callHistory.callEndTime, "Asia/Kolkata");
          callHistory.duration = moment.utc(end.diff(start)).format("HH:mm:ss");

          await Promise.all([chat.save(), chatTopic.save(), callHistory?.save()]);
          console.log("✅ Call rejection chat & history saved.");
          return;
        }

        if (isAccept && caller.callId?.toString() === callId.toString()) {
          console.log(`📞 [callResponseHandled] Call accepted by receiver ${receiver.name}`);

          const privateCallDelete = await Privatecall.deleteOne({
            caller: new mongoose.Types.ObjectId(caller._id),
            receiver: new mongoose.Types.ObjectId(receiver._id),
          });

          console.log("🗑 Private call entry deleted:", privateCallDelete);

          if (privateCallDelete?.deletedCount > 0) {
            console.log("🟢 Call accepted, emitting event...");

            const [callerSockets, receiverSockets] = await Promise.all([io.in(callerRoom).fetchSockets(), io.in(receiverRoom).fetchSockets()]);

            const callerSocket = callerSockets?.[0];
            const receiverSocket = receiverSockets?.[0];

            if (callerSocket && !callerSocket.rooms.has(callId)) {
              callerSocket.join(callId);
            }

            if (receiverSocket && !receiverSocket.rooms.has(callId)) {
              receiverSocket.join(callId);
            }

            io.to(callId.toString()).emit("callAnswerReceived", data);

            if (callHistory.isFree) {
              const duration = (settingJSON.freeCallDuration || 15) * 1000;
              setTimeout(() => {
                console.log(`⏰ Free call timeout reached for call ${callId}. Disconnecting...`);
                io.to(callId.toString()).emit("callDisconnected", { callId, reason: "Free call limit reached" });
              }, duration);
            }

            console.log(`📡 [callAnswerReceived] Event sent to both parties: Caller(${caller.name}) & Receiver(${receiver.name})`);

            let chatTopic;
            chatTopic = await ChatTopic.findOne({
              $or: [
                {
                  $and: [{ senderId: caller._id }, { receiverId: receiver._id }],
                },
                {
                  $and: [{ senderId: receiver._id }, { receiverId: caller._id }],
                },
              ],
            });

            const chat = new Chat();

            if (!chatTopic) {
              chatTopic = new ChatTopic();

              chatTopic.chatId = chat._id;
              chatTopic.senderId = caller._id;
              chatTopic.receiverId = receiver._id;
            }

            chat.chatTopicId = chatTopic._id;
            chat.senderId = callerId;
            chat.messageType = callType.trim().toLowerCase() === "audio" ? 5 : 6;
            chat.message = callType.trim().toLowerCase() === "audio" ? "📞 Audio Call" : "📽 Video Call";
            chat.callType = 1; //1.received
            chat.callId = callId;
            chat.date = new Date().toLocaleString();

            chatTopic.chatId = chat._id;

            await Promise.all([
              chat?.save(),
              chatTopic?.save(),
              User.updateOne({ _id: caller._id }, { $set: { isBusy: true, callId: callId } }),
              Host.updateOne({ _id: receiver._id }, { $set: { isBusy: true, callId: callId } }),
              History.updateOne({ _id: callHistory._id }, { $set: { callConnect: true, callStartTime: moment().tz("Asia/Kolkata").format() } }),
            ]);

            console.log("✅ Caller and Receiver status updated & call history saved.");
          } else {
            console.log(`🚨 Call disconnected`);

            io.to(receiverRoom).emit("callAutoEnded", data);

            await Promise.all([
              User.updateOne({ _id: caller._id, isBusy: true }, { $set: { isBusy: false, callId: null } }),
              Host.updateOne({ _id: receiver._id, isBusy: true }, { $set: { isBusy: false, callId: null } }),
            ]);

            console.log("🔹 Caller & Receiver status reset.");
          }
        }
      }

      if (callMode.trim().toLowerCase() === "random") {
        if (!isAccept && caller.callId?.toString() === callId.toString()) {
          console.log(`📵 [callResponseHandled] Call rejected by receiver ${receiver.name}`);

          io.to(callerRoom).emit("callRejected", data);
          io.to(receiverRoom).emit("callRejected", data);

          const [callerUpdate, receiverUpdate, randomCallDeleted] = await Promise.all([
            callerModel.updateOne({ _id: caller._id }, { $set: { isBusy: false, callId: null } }),
            receiverModel.updateOne({ _id: receiver._id }, { $set: { isBusy: false, callId: null } }),
            Randomcall.deleteOne({ caller: caller._id }),
          ]);

          console.log(`🔹 Caller Status Updated:`, callerUpdate);
          console.log(`🔹 Receiver Status Updated:`, receiverUpdate);
          console.log(`🔹 Random Call Deleted:`, randomCallDeleted);

          let chatTopic;
          chatTopic = await ChatTopic.findOne({
            $or: [
              {
                $and: [{ senderId: caller._id }, { receiverId: receiver._id }],
              },
              {
                $and: [{ senderId: receiver._id }, { receiverId: caller._id }],
              },
            ],
          });

          const chat = new Chat();

          if (!chatTopic) {
            chatTopic = new ChatTopic();

            chatTopic.chatId = chat._id;
            chatTopic.senderId = caller._id;
            chatTopic.receiverId = receiver._id;
          }

          chat.chatTopicId = chatTopic._id;
          chat.senderId = callerId;
          chat.messageType = 6;
          chat.message = "📽 Video Call";
          chat.callType = 2; // 2.declined
          chat.callId = callId;
          chat.isRead = true;
          chat.date = new Date().toLocaleString();

          chatTopic.chatId = chat._id;

          callHistory.callConnect = false;
          callHistory.callEndTime = moment().tz("Asia/Kolkata").format();

          const start = moment.tz(callHistory.callStartTime, "Asia/Kolkata");
          const end = moment.tz(callHistory.callEndTime, "Asia/Kolkata");
          callHistory.duration = moment.utc(end.diff(start)).format("HH:mm:ss");

          await Promise.all([chat.save(), chatTopic.save(), callHistory?.save()]);
          console.log("✅ Call rejection chat & history saved.");
          return;
        }

        if (isAccept && caller.callId?.toString() === callId.toString()) {
          console.log(`📞 [callResponseHandled] Call accepted by receiver ${receiver.name}`);

          const randomCallDeleted = await Randomcall.deleteOne({
            caller: new mongoose.Types.ObjectId(caller._id),
          });

          console.log("🗑 Private call entry deleted:", randomCallDeleted);

          if (randomCallDeleted?.deletedCount > 0) {
            console.log("🟢 Call accepted, emitting event...");

            const [callerSockets, receiverSockets] = await Promise.all([io.in(callerRoom).fetchSockets(), io.in(receiverRoom).fetchSockets()]);

            const callerSocket = callerSockets?.[0];
            const receiverSocket = receiverSockets?.[0];

            if (callerSocket && !callerSocket.rooms.has(callId)) {
              callerSocket.join(callId);
            }

            if (receiverSocket && !receiverSocket.rooms.has(callId)) {
              receiverSocket.join(callId);
            }

            io.to(callId.toString()).emit("callAnswerReceived", data);

            console.log(`📡 [callAnswerReceived] Event sent to both parties: Caller(${caller.name}) & Receiver(${receiver.name})`);

            let chatTopic;
            chatTopic = await ChatTopic.findOne({
              $or: [
                {
                  $and: [{ senderId: caller._id }, { receiverId: receiver._id }],
                },
                {
                  $and: [{ senderId: receiver._id }, { receiverId: caller._id }],
                },
              ],
            });

            const chat = new Chat();

            if (!chatTopic) {
              chatTopic = new ChatTopic();

              chatTopic.chatId = chat._id;
              chatTopic.senderId = caller._id;
              chatTopic.receiverId = receiver._id;
            }

            chat.chatTopicId = chatTopic._id;
            chat.senderId = callerId;
            chat.messageType = 6;
            chat.message = "📽 Video Call";
            chat.callType = 1; //1.received
            chat.callId = callId;
            chat.date = new Date().toLocaleString();

            chatTopic.chatId = chat._id;

            await Promise.all([
              chat?.save(),
              chatTopic?.save(),
              User.updateOne({ _id: caller._id }, { $set: { isBusy: true, callId: callId } }),
              Host.updateOne({ _id: receiver._id }, { $set: { isBusy: true, callId: callId } }),
              History.updateOne({ _id: callHistory._id }, { $set: { callConnect: true, callStartTime: moment().tz("Asia/Kolkata").format() } }),
            ]);

            console.log("✅ Caller and Receiver status updated & call history saved.");
          } else {
            console.log(`🚨 Call disconnected`);

            io.to(receiverRoom).emit("callAutoEnded", data);

            await Promise.all([
              User.updateOne({ _id: caller._id, isBusy: true }, { $set: { isBusy: false, callId: null } }),
              Host.updateOne({ _id: receiver._id, isBusy: true }, { $set: { isBusy: false, callId: null } }),
            ]);

            console.log("🔹 Caller & Receiver status reset.");
          }
        }
      }
    } catch (error) {
      console.error("❌ [callResponseHandled] Error:", error);
      io.to(`globalRoom:${socket.id}`).emit("callResponseHandled", { message: "Server error. Please try again." });
    }
  });

  socket.on("callCancelled", async (data) => {
    const parseData = typeof data === "string" ? JSON.parse(data) : data;
    const { callerId, receiverId, callId, callType, callMode, callerRole, receiverRole } = parseData;
    console.log("🟢 [callCancelled] Event received:", parseData);

    const validRoles = ["user", "host"];
    if (!validRoles.includes(callerRole?.toLowerCase()) || !validRoles.includes(receiverRole?.toLowerCase())) {
      io.in("globalRoom:" + callerId.toString()).emit("callRinging", { message: "Invalid roles provided." });
      return;
    }

    console.log(`🔄 Fetching call details for callId: ${callId}`);

    const callerModel = callerRole.trim().toLowerCase() === "user" ? User : Host;
    const receiverModel = receiverRole.trim().toLowerCase() === "host" ? Host : User;

    const [caller, receiver, callHistory] = await Promise.all([
      callerModel.findById(callerId).select("_id name fcmToken isBlock").lean(),
      receiverModel.findById(receiverId).select("_id name fcmToken isBlock").lean(),
      History.findById(callId).select("_id userId callConnect"),
    ]);

    if (!caller || !receiver || !callHistory) {
      console.error("❌ [callCancelled] Invalid caller, receiver, or call history.");
      return io.to(`globalRoom:${callerId}`).emit("callCancelFailed", { message: "Invalid call data." });
    }

    io.to("globalRoom:" + callerId).emit("callFinished", data);
    io.to("globalRoom:" + receiverId).emit("callFinished", data);

    console.log(`✅ Caller: ${caller.name} | Receiver: ${receiver.name} | Call ID: ${callId}`);

    if (callMode.trim().toLowerCase() === "private") {
      const [callerUpdate, receiverUpdate, privateCallDeleted] = await Promise.all([
        callerModel.updateOne({ _id: caller._id }, { $set: { isBusy: false, callId: null } }),
        receiverModel.updateOne({ _id: receiver._id }, { $set: { isBusy: false, callId: null } }),
        Privatecall.deleteOne({ caller: caller._id, receiver: receiver._id }),
      ]);

      console.log(`🔹 Caller Status Updated:`, callerUpdate);
      console.log(`🔹 Receiver Status Updated:`, receiverUpdate);
      console.log(`🔹 Private Call Deleted:`, privateCallDeleted);
    }

    if (callMode.trim().toLowerCase() === "random") {
      const [callerUpdate, receiverUpdate, randomCallDeleted] = await Promise.all([
        callerModel.updateOne({ _id: caller._id }, { $set: { isBusy: false, callId: null } }),
        receiverModel.updateOne({ _id: receiver._id }, { $set: { isBusy: false, callId: null } }),
        Randomcall.deleteOne({ caller: caller._id }),
      ]);

      console.log(`🔹 Caller Status Updated:`, callerUpdate);
      console.log(`🔹 Receiver Status Updated:`, receiverUpdate);
      console.log(`🔹 Private Call Deleted:`, randomCallDeleted);
    }

    callHistory.callConnect = false;

    let chatTopic;
    chatTopic = await ChatTopic.findOne({
      $or: [
        {
          $and: [{ senderId: caller._id }, { receiverId: receiver._id }],
        },
        {
          $and: [{ senderId: receiver._id }, { receiverId: caller._id }],
        },
      ],
    });

    const chat = new Chat();

    if (!chatTopic) {
      chatTopic = new ChatTopic();

      chatTopic.chatId = chat._id;
      chatTopic.senderId = caller._id;
      chatTopic.receiverId = receiver._id;
      await chatTopic.save();
    }

    chat.chatTopicId = chatTopic._id;
    chat.callId = callHistory?._id;
    chat.senderId = callHistory?.userId;
    chat.messageType = callType.trim().toLowerCase() === "audio" ? 5 : 6;
    chat.message = callType.trim().toLowerCase() === "audio" ? "📞 Audio Call" : "📽 Video Call";
    chat.callType = 3; //3.missedCall
    chat.date = new Date().toLocaleString();
    chat.isRead = true;

    chatTopic.chatId = chat._id;

    await Promise.all([chat?.save(), chatTopic?.save(), callHistory?.save()]);

    if (!receiver.isBlock && receiver.fcmToken !== null) {
      const payload = {
        token: receiver.fcmToken,
        data: {
          title: `📞 Missed Call from ${caller.name || "Someone"} ⏳`,
          body: `You missed a call from  ${caller.name || "Someone"}. Tap to reconnect now! 🔄✨`,
          type: "missedCall",
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
  });

  socket.on("callDisconnected", async (data) => {
    const parseData = typeof data === "string" ? JSON.parse(data) : data;
    const { callerId, receiverId, callId, callType, callMode, callerRole, receiverRole } = parseData;
    console.log("[callDisconnected]", "data in callDisconnected:", parseData);

    const validRoles = ["user", "host"];
    if (!validRoles.includes(callerRole?.toLowerCase()) || !validRoles.includes(receiverRole?.toLowerCase())) {
      io.in("globalRoom:" + callerId.toString()).emit("callRinging", { message: "Invalid roles provided." });
      return;
    }

    const callerModel = callerRole.trim().toLowerCase() === "user" ? User : Host;
    const receiverModel = receiverRole.trim().toLowerCase() === "host" ? Host : User;

    const [caller, receiver, callHistory] = await Promise.all([
      callerModel.findById(callerId).select("_id name gender").lean(),
      receiverModel.findById(receiverId).select("_id name gender").lean(),
      History.findById(callId).select("_id callConnect callStartTime callEndTime duration"),
    ]);

    if (!caller || !receiver || !callHistory) {
      console.error("❌ [callDisconnected] Invalid caller, receiver, or call history.");
      return io.to(`globalRoom:${callerId}`).emit("callTerminationFailed", { message: "Invalid call data." });
    }

    io.to(callId.toString()).emit("callDisconnected", data);
    io.socketsLeave(callId.toString());

    console.log(`✅ Caller: ${caller.name} | Receiver: ${receiver.name} | Call ID: ${callId}`);

    if (callMode.trim().toLowerCase() === "private") {
      const [callerUpdate, receiverUpdate, privateCallDeleted] = await Promise.all([
        callerModel.updateOne({ _id: callerId }, { $set: { isBusy: false, callId: null } }),
        receiverModel.updateOne({ _id: receiverId }, { $set: { isBusy: false, callId: null } }),
        Privatecall.deleteOne({ caller: callerId, receiver: receiverId }),
      ]);

      console.log(`🔹 Caller Status Updated:`, callerUpdate);
      console.log(`🔹 Receiver Status Updated:`, receiverUpdate);
      console.log(`🔹 Private Call Deleted:`, privateCallDeleted);
    }

    if (callMode.trim().toLowerCase() === "random") {
      const [callerUpdate, receiverUpdate, randomCallDeleted] = await Promise.all([
        callerModel.updateOne({ _id: callerId }, { $set: { isBusy: false, callId: null } }),
        receiverModel.updateOne({ _id: receiverId }, { $set: { isBusy: false, callId: null } }),
        Randomcall.deleteOne({ caller: callerId }),
      ]);

      console.log(`🔹 Caller Status Updated:`, callerUpdate);
      console.log(`🔹 Receiver Status Updated:`, receiverUpdate);
      console.log(`🔹 Private Call Deleted:`, randomCallDeleted);
    }

    callHistory.callConnect = false;
    callHistory.callEndTime = moment().tz("Asia/Kolkata").format();

    const start = moment.tz(callHistory.callStartTime, "Asia/Kolkata");
    const end = moment.tz(callHistory.callEndTime, "Asia/Kolkata");
    const duration = moment.utc(end.diff(start)).format("HH:mm:ss");
    callHistory.duration = duration;

    await Promise.all([
      Chat.findOneAndUpdate(
        { callId: callHistory._id },
        {
          $set: {
            callDuration: duration,
            messageType: callType.trim().toLowerCase() === "audio" ? 5 : 6,
            message: callType.trim().toLowerCase() === "audio" ? "📞 Audio Call" : "📽 Video Call",
            callType: 1, // 1 = Received Call
            isRead: true,
          },
        },
        { new: true }
      ),
      callHistory.save(),
    ]);
    await chargeCoin({ callerId: caller?._id, receiverId: receiver?._id, callId: callHistory?._id, callMode: callMode , gender: receiver?.gender })
  });

  const chargeCoin = async(parsedData) => {
    try {
      console.error("[chargeCoin] Parsed Data:", parsedData);

      const { callerId, receiverId, callId, callMode, gender } = parsedData;

      const [caller, receiver, callHistory, vipPrivilege] = await Promise.all([
        User.findById(callerId).select("_id coin").lean(),
        Host.findById(receiverId).select("_id coin privateCallRate audioCallRate randomCallRate randomCallFemaleRate randomCallMaleRate agencyId").lean(),
        History.findById(callId).select("_id callType isPrivate isFree createdAt updatedAt").lean(),
        VipPlanPrivilege.findOne().select("audioCallDiscount privateCallDiscount").lean(),
      ]);

      if (!caller || !receiver || !callHistory) {
        console.log("[callCoinCharged] Caller, Receiver, or CallHistory not found!");
        return;
      }

      if (callHistory.isFree) {
        console.log("🆓 Free call concluded. Updating freeCallCount and freeCallHosts.");
        await User.updateOne(
          { _id: callerId },
          { 
            $inc: { freeCallCount: -1 },
            $addToSet: { freeCallHosts: receiverId } 
          }
        );
        return;
      }

      const start = moment.tz(callHistory.createdAt, "Asia/Kolkata");
      const end = moment().tz("Asia/Kolkata");
      const hh = moment.utc(end.diff(start)).format("HH");
      const mm = moment.utc(end.diff(start)).format("mm");
      const ss = moment.utc(end.diff(start)).format("ss");
      console.error({ hh, mm, ss, callHistory, currentTime: end  });
      let totalMinutes = Number(mm);
      if(Number(ss) > 0){
        totalMinutes += (Number(ss)/60);
      }
      if(Number(hh) > 0){
        totalMinutes += Number(hh) * 60;
      }
      
      console.error({ hh, mm, ss, totalMinutes });

      if (callMode === "private" && callHistory.callType === "audio") {
        const adminCommissionRate = settingJSON?.adminCommissionRate;
        let audioCallCharge = Math.abs(receiver.audioCallRate) * totalMinutes;
        console.error({ audioCallCharge, audioCallRate: receiver.audioCallRate, totalMinutes  });
        let audioCallDiscount = 0;

        // Check if user is VIP and apply discount
        if (caller?.isVip && vipPrivilege) {
          audioCallDiscount = Math.min(Math.max(vipPrivilege.audioCallDiscount || 0, 0), 100);

          const discountAmount = Math.floor((audioCallCharge * audioCallDiscount) / 100);
          audioCallCharge = audioCallCharge - discountAmount;
        }

        const adminShare = Math.floor((audioCallCharge * adminCommissionRate) / 100);
        const hostEarnings = audioCallCharge - adminShare;
        let agencyShare = 0;

        if (caller.coin >= audioCallCharge) {
          let agencyUpdate = null;
          if (receiver.agencyId) {
            const agency = await Agency.findById(receiver.agencyId).lean().select("_id commissionType commission");

            if (agency) {
              if (agency.commissionType === 1) {
                // Percentage commission
                agencyShare = (hostEarnings * agency.commission) / 100;
              } else {
                // Fixed salary, ignore earnings share
                agencyShare = 0;
              }

              agencyUpdate = Agency.updateOne({ _id: agency._id }, [
                {
                  $set: {
                    hostCoins: { $add: ["$hostCoins", hostEarnings] },
                    totalEarnings: { $add: ["$totalEarnings", Math.floor(agencyShare)] },
                    totalEarningsWithCommissionAndHostCoin: {
                      $add: [{ $add: ["$hostCoins", hostEarnings] }, { $add: ["$totalEarnings", Math.floor(agencyShare)] }],
                    },
                    netAvailableEarnings: {
                      $add: [{ $add: ["$hostCoins", hostEarnings] }, { $add: ["$totalEarnings", Math.floor(agencyShare)] }],
                    },
                  },
                },
              ]);
            }
          }

          console.log(`[callCoinCharged] Deducting ${audioCallCharge} coins from Caller: ${caller._id}, Admin Share: ${adminShare}, Host Earnings: ${hostEarnings}`);
          console.error(`[callCoinCharged] Deducting ${audioCallCharge} coins from Caller: ${caller._id}, Admin Share: ${adminShare}, Host Earnings: ${hostEarnings}`);

          await Promise.all([
            User.updateOne(
              { _id: caller._id, coin: { $gte: audioCallCharge } },
              {
                $inc: {
                  coin: -audioCallCharge,
                  spentCoins: audioCallCharge,
                },
              }
            ),
            Host.updateOne({ _id: receiver._id }, { $inc: { coin: hostEarnings } }),
            History.updateOne(
              { _id: callHistory._id, userId: caller._id, hostId: receiver._id },
              {
                $set: {
                  agencyId: receiver.agencyId,
                  date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
                },
                $inc: {
                  userCoin: audioCallCharge,
                  hostCoin: hostEarnings,
                  adminCoin: adminShare,
                  agencyCoin: Math.floor(agencyShare),
                },
              }
            ),
            agencyUpdate,
          ]);

          console.log("[callCoinCharged] Coin deduction and history update successful.");
          console.error("[callCoinCharged] Coin deduction and history update successful.");
        } else {
          console.log(`[callCoinCharged] Insufficient Coins for Caller: ${caller._id}`);
          io.in("globalRoom:" + caller._id.toString()).emit("insufficientCoins", "You don't have sufficient coins.");
        }
      }

      if (callMode === "private" && callHistory.callType === "video" && callHistory.isPrivate) {
        const adminCommissionRate = settingJSON?.adminCommissionRate;
        let privateCallCharge = Math.abs(receiver.privateCallRate) * totalMinutes;
        let privateCallDiscount = 0;
        console.error({ privateCallCharge, audioCallRate: receiver.privateCallRate, totalMinutes  });

        // Check if user is VIP and apply discount
        if (caller.isVip && vipPrivilege) {
          privateCallDiscount = Math.min(Math.max(vipPrivilege.videoCallDiscount || 0, 0), 100);

          const discountAmount = Math.floor((privateCallCharge * privateCallDiscount) / 100);
          privateCallCharge = privateCallCharge - discountAmount;
        }

        const adminShare = Math.floor((privateCallCharge * adminCommissionRate) / 100);
        const hostEarnings = privateCallCharge - adminShare;
        let agencyShare = 0;

        if (caller.coin >= privateCallCharge) {
          let agencyUpdate = null;
          if (receiver.agencyId) {
            const agency = await Agency.findById(receiver.agencyId).lean().select("_id commissionType commission");

            if (agency) {
              if (agency.commissionType === 1) {
                // Percentage commission
                agencyShare = (hostEarnings * agency.commission) / 100;
              } else {
                // Fixed salary, ignore earnings share
                agencyShare = 0;
              }

              agencyUpdate = Agency.updateOne({ _id: agency._id }, [
                {
                  $set: {
                    hostCoins: { $add: ["$hostCoins", hostEarnings] },
                    totalEarnings: { $add: ["$totalEarnings", Math.floor(agencyShare)] },
                    totalEarningsWithCommissionAndHostCoin: {
                      $add: [{ $add: ["$hostCoins", hostEarnings] }, { $add: ["$totalEarnings", Math.floor(agencyShare)] }],
                    },
                    netAvailableEarnings: {
                      $add: [{ $add: ["$hostCoins", hostEarnings] }, { $add: ["$totalEarnings", Math.floor(agencyShare)] }],
                    },
                  },
                },
              ]);
            }
          }

          console.log(`[callCoinCharged] Deducting ${privateCallCharge} coins from Caller: ${caller._id}, Admin Share: ${adminShare}, Host Earnings: ${hostEarnings}`);
           console.error(`[callCoinCharged] Deducting ${privateCallCharge} coins from Caller: ${caller._id}, Admin Share: ${adminShare}, Host Earnings: ${hostEarnings}`);

          await Promise.all([
            User.updateOne(
              { _id: caller._id, coin: { $gte: privateCallCharge } },
              {
                $inc: {
                  coin: -privateCallCharge,
                  spentCoins: privateCallCharge,
                },
              }
            ),
            Host.updateOne({ _id: receiver._id }, { $inc: { coin: hostEarnings } }),
            History.updateOne(
              { _id: callHistory._id, userId: caller._id, hostId: receiver._id },
              {
                $set: {
                  agencyId: receiver.agencyId,
                  date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
                },
                $inc: {
                  userCoin: privateCallCharge,
                  hostCoin: hostEarnings,
                  adminCoin: adminShare,
                  agencyCoin: Math.floor(agencyShare),
                },
              }
            ),
            agencyUpdate,
          ]);

          console.log("[callCoinCharged] Coin deduction and history update successful.");
          console.error("[callCoinCharged] Coin deduction and history update successful.");
        } else {
          console.log(`[callCoinCharged] Insufficient Coins for Caller: ${caller._id}`);
          console.error(`[callCoinCharged] Insufficient Coins for Caller: ${caller._id}`);
          io.in("globalRoom:" + caller._id.toString()).emit("insufficientCoins", "You don't have sufficient coins.");
        }
      }

      if (callMode === "random" && callHistory.callType === "video" && callHistory.isRandom) {
        const genderQuery = gender?.toLowerCase();

        let randomCallCharge;
        if (genderQuery === "female") {
          randomCallCharge = Math.abs(receiver.randomCallFemaleRate) * totalMinutes;
        } else if (genderQuery === "male") {
          randomCallCharge = Math.abs(receiver.randomCallMaleRate) * totalMinutes;
        } else {
          randomCallCharge = (Math.abs(receiver.randomCallRate) || 100) * totalMinutes;
        }
        
        console.error({ randomCallCharge, audioCallRate: receiver.randomCallRate, totalMinutes  });

        // Check if user is VIP and apply discount
        let randomCallDiscount = 0;
        if (caller.isVip && vipPrivilege) {
          randomCallDiscount = Math.min(Math.max(vipPrivilege.randomMatchCallDiscount || 0, 0), 100);

          const discountAmount = Math.floor((randomCallCharge * randomCallDiscount) / 100);
          randomCallCharge = randomCallCharge - discountAmount;
        }

        const adminCommissionRate = settingJSON?.adminCommissionRate;

        const adminShare = Math.floor((randomCallCharge * adminCommissionRate) / 100);
        const hostEarnings = randomCallCharge - adminShare;
        let agencyShare = 0;

        if (caller.coin >= randomCallCharge) {
          let agencyUpdate = null;
          if (receiver.agencyId) {
            const agency = await Agency.findById(receiver.agencyId).lean().select("_id commissionType commission");

            if (agency) {
              if (agency.commissionType === 1) {
                // Percentage commission
                agencyShare = (hostEarnings * agency.commission) / 100;
              } else {
                // Fixed salary, ignore earnings share
                agencyShare = 0;
              }

              agencyUpdate = Agency.updateOne({ _id: agency._id }, [
                {
                  $set: {
                    hostCoins: { $add: ["$hostCoins", hostEarnings] },
                    totalEarnings: { $add: ["$totalEarnings", Math.floor(agencyShare)] },
                    totalEarningsWithCommissionAndHostCoin: {
                      $add: [{ $add: ["$hostCoins", hostEarnings] }, { $add: ["$totalEarnings", Math.floor(agencyShare)] }],
                    },
                    netAvailableEarnings: {
                      $add: [{ $add: ["$hostCoins", hostEarnings] }, { $add: ["$totalEarnings", Math.floor(agencyShare)] }],
                    },
                  },
                },
              ]);
              F;
            }
          }

          console.log(`[callCoinCharged] Deducting ${randomCallCharge} coins from Caller: ${caller._id}, Admin Share: ${adminShare}, Host Earnings: ${hostEarnings}`);

          await Promise.all([
            User.updateOne(
              { _id: caller._id, coin: { $gte: randomCallCharge } },
              {
                $inc: {
                  coin: -randomCallCharge,
                  spentCoins: randomCallCharge,
                },
              }
            ),
            Host.updateOne({ _id: receiver._id }, { $inc: { coin: hostEarnings } }),
            History.updateOne(
              { _id: callHistory._id, userId: caller._id, hostId: receiver._id },
              {
                $set: {
                  agencyId: receiver.agencyId,
                  date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
                },
                $inc: {
                  userCoin: randomCallCharge,
                  hostCoin: hostEarnings,
                  adminCoin: adminShare,
                  agencyCoin: Math.floor(agencyShare),
                },
              }
            ),
            agencyUpdate,
          ]);

          console.log("[callCoinCharged] Coin deduction and history update successful.");
        } else {
          console.log(`[callCoinCharged] Insufficient Coins for Caller: ${caller._id}`);
          io.in("globalRoom:" + caller._id.toString()).emit("insufficientCoins", "You don't have sufficient coins.");
        }
      }
    } catch (error) {
      console.error("[callCoinCharged] Error:", error);
    }
  }

  socket.on("callCoinCharged", async (data) => {
    try {
      const parsedData = typeof data === "string" ? JSON.parse(data) : data;
      console.log("[callCoinCharged] Parsed Data:", parsedData);

      const { callerId, receiverId, callId, callMode, gender } = parsedData;

      const [caller, receiver, callHistory] = await Promise.all([
        User.findById(callerId).select("_id coin isVip vipLevel").lean(),
        Host.findById(receiverId).select("_id coin privateCallRate audioCallRate randomCallRate randomCallFemaleRate randomCallMaleRate agencyId").lean(),
        History.findById(callId).select("_id callType isPrivate createdAt updatedAt").lean(),
      ]);

      let vipPrivilege = null;
      if (caller?.isVip) {
        vipPrivilege = await VipPlanPrivilege.findOne({ level: caller.vipLevel || 1 }).lean();
      }

      if (!caller || !receiver || !callHistory) {
        console.log("[callCoinCharged] Caller, Receiver, or CallHistory not found!");
        return;
      }

      const start = moment.tz(callHistory.createdAt, "Asia/Kolkata");
      const end = moment().tz("Asia/Kolkata");
      const hh = moment.utc(end.diff(start)).format("HH");
      const mm = moment.utc(end.diff(start)).format("mm");
      const ss = moment.utc(end.diff(start)).format("ss");
      console.error({ hh, mm, ss, callHistory, currentTime: end  });
      let totalMinutes = Number(mm);
      if(Number(ss) > 0){
        totalMinutes += (Number(ss)/60);
      }
      if(Number(hh) > 0){
        totalMinutes += Number(hh) * 60;
      }
      
      console.error({ hh, mm, ss, totalMinutes });

      if (callMode === "private" && callHistory.callType === "audio") {
        const adminCommissionRate = settingJSON?.adminCommissionRate;
        let audioCallCharge = Math.abs(receiver.audioCallRate) * totalMinutes;
        console.error({ audioCallCharge, audioCallRate: receiver.audioCallRate, totalMinutes  });
        let audioCallDiscount = 0;

        // Check if user is VIP and apply discount
        if (caller?.isVip && vipPrivilege) {
          audioCallDiscount = Math.min(Math.max(vipPrivilege.audioCallDiscount || 0, 0), 100);

          const discountAmount = Math.floor((audioCallCharge * audioCallDiscount) / 100);
          audioCallCharge = audioCallCharge - discountAmount;
        }

        const adminShare = Math.floor((audioCallCharge * adminCommissionRate) / 100);
        const hostEarnings = audioCallCharge - adminShare;
        let agencyShare = 0;

        if (caller.coin >= audioCallCharge) {
          let agencyUpdate = null;
          if (receiver.agencyId) {
            const agency = await Agency.findById(receiver.agencyId).lean().select("_id commissionType commission");

            if (agency) {
              if (agency.commissionType === 1) {
                // Percentage commission
                agencyShare = (hostEarnings * agency.commission) / 100;
              } else {
                // Fixed salary, ignore earnings share
                agencyShare = 0;
              }

              agencyUpdate = Agency.updateOne({ _id: agency._id }, [
                {
                  $set: {
                    hostCoins: { $add: ["$hostCoins", hostEarnings] },
                    totalEarnings: { $add: ["$totalEarnings", Math.floor(agencyShare)] },
                    totalEarningsWithCommissionAndHostCoin: {
                      $add: [{ $add: ["$hostCoins", hostEarnings] }, { $add: ["$totalEarnings", Math.floor(agencyShare)] }],
                    },
                    netAvailableEarnings: {
                      $add: [{ $add: ["$hostCoins", hostEarnings] }, { $add: ["$totalEarnings", Math.floor(agencyShare)] }],
                    },
                  },
                },
              ]);
            }
          }

          console.log(`[callCoinCharged] Deducting ${audioCallCharge} coins from Caller: ${caller._id}, Admin Share: ${adminShare}, Host Earnings: ${hostEarnings}`);
          console.error(`[callCoinCharged] Deducting ${audioCallCharge} coins from Caller: ${caller._id}, Admin Share: ${adminShare}, Host Earnings: ${hostEarnings}`);

          await Promise.all([
            User.updateOne(
              { _id: caller._id, coin: { $gte: audioCallCharge } },
              {
                $inc: {
                  coin: -audioCallCharge,
                  spentCoins: audioCallCharge,
                },
              }
            ),
            Host.updateOne({ _id: receiver._id }, { $inc: { coin: hostEarnings } }),
            History.updateOne(
              { _id: callHistory._id, userId: caller._id, hostId: receiver._id },
              {
                $set: {
                  agencyId: receiver.agencyId,
                  date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
                },
                $inc: {
                  userCoin: audioCallCharge,
                  hostCoin: hostEarnings,
                  adminCoin: adminShare,
                  agencyCoin: Math.floor(agencyShare),
                },
              }
            ),
            agencyUpdate,
          ]);

          console.log("[callCoinCharged] Coin deduction and history update successful.");
          console.error("[callCoinCharged] Coin deduction and history update successful.");
        } else {
          console.log(`[callCoinCharged] Insufficient Coins for Caller: ${caller._id}`);
          io.in("globalRoom:" + caller._id.toString()).emit("insufficientCoins", "You don't have sufficient coins.");
        }
      }

      if (callMode === "private" && callHistory.callType === "video" && callHistory.isPrivate) {
        const adminCommissionRate = settingJSON?.adminCommissionRate;
        let privateCallCharge = Math.abs(receiver.privateCallRate) * totalMinutes;
        let privateCallDiscount = 0;
        console.error({ privateCallCharge, audioCallRate: receiver.privateCallRate, totalMinutes  });

        // Check if user is VIP and apply discount
        if (caller.isVip && vipPrivilege) {
          privateCallDiscount = Math.min(Math.max(vipPrivilege.videoCallDiscount || 0, 0), 100);

          const discountAmount = Math.floor((privateCallCharge * privateCallDiscount) / 100);
          privateCallCharge = privateCallCharge - discountAmount;
        }

        const adminShare = Math.floor((privateCallCharge * adminCommissionRate) / 100);
        const hostEarnings = privateCallCharge - adminShare;
        let agencyShare = 0;

        if (caller.coin >= privateCallCharge) {
          let agencyUpdate = null;
          if (receiver.agencyId) {
            const agency = await Agency.findById(receiver.agencyId).lean().select("_id commissionType commission");

            if (agency) {
              if (agency.commissionType === 1) {
                // Percentage commission
                agencyShare = (hostEarnings * agency.commission) / 100;
              } else {
                // Fixed salary, ignore earnings share
                agencyShare = 0;
              }

              agencyUpdate = Agency.updateOne({ _id: agency._id }, [
                {
                  $set: {
                    hostCoins: { $add: ["$hostCoins", hostEarnings] },
                    totalEarnings: { $add: ["$totalEarnings", Math.floor(agencyShare)] },
                    totalEarningsWithCommissionAndHostCoin: {
                      $add: [{ $add: ["$hostCoins", hostEarnings] }, { $add: ["$totalEarnings", Math.floor(agencyShare)] }],
                    },
                    netAvailableEarnings: {
                      $add: [{ $add: ["$hostCoins", hostEarnings] }, { $add: ["$totalEarnings", Math.floor(agencyShare)] }],
                    },
                  },
                },
              ]);
            }
          }

          console.log(`[callCoinCharged] Deducting ${privateCallCharge} coins from Caller: ${caller._id}, Admin Share: ${adminShare}, Host Earnings: ${hostEarnings}`);
           console.error(`[callCoinCharged] Deducting ${privateCallCharge} coins from Caller: ${caller._id}, Admin Share: ${adminShare}, Host Earnings: ${hostEarnings}`);

          await Promise.all([
            User.updateOne(
              { _id: caller._id, coin: { $gte: privateCallCharge } },
              {
                $inc: {
                  coin: -privateCallCharge,
                  spentCoins: privateCallCharge,
                },
              }
            ),
            Host.updateOne({ _id: receiver._id }, { $inc: { coin: hostEarnings } }),
            History.updateOne(
              { _id: callHistory._id, userId: caller._id, hostId: receiver._id },
              {
                $set: {
                  agencyId: receiver.agencyId,
                  date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
                },
                $inc: {
                  userCoin: privateCallCharge,
                  hostCoin: hostEarnings,
                  adminCoin: adminShare,
                  agencyCoin: Math.floor(agencyShare),
                },
              }
            ),
            agencyUpdate,
          ]);

          console.log("[callCoinCharged] Coin deduction and history update successful.");
          console.error("[callCoinCharged] Coin deduction and history update successful.");
        } else {
          console.log(`[callCoinCharged] Insufficient Coins for Caller: ${caller._id}`);
          console.error(`[callCoinCharged] Insufficient Coins for Caller: ${caller._id}`);
          io.in("globalRoom:" + caller._id.toString()).emit("insufficientCoins", "You don't have sufficient coins.");
        }
      }

      if (callMode === "random" && callHistory.callType === "video" && callHistory.isRandom) {
        const genderQuery = gender?.toLowerCase();

        let randomCallCharge;
        if (genderQuery === "female") {
          randomCallCharge = Math.abs(receiver.randomCallFemaleRate) * totalMinutes;
        } else if (genderQuery === "male") {
          randomCallCharge = Math.abs(receiver.randomCallMaleRate) * totalMinutes;
        } else {
          randomCallCharge = (Math.abs(receiver.randomCallRate) || 100) * totalMinutes;
        }
        
        console.error({ randomCallCharge, audioCallRate: receiver.randomCallRate, totalMinutes  });

        // Check if user is VIP and apply discount
        let randomCallDiscount = 0;
        if (caller.isVip && vipPrivilege) {
          randomCallDiscount = Math.min(Math.max(vipPrivilege.randomMatchCallDiscount || 0, 0), 100);

          const discountAmount = Math.floor((randomCallCharge * randomCallDiscount) / 100);
          randomCallCharge = randomCallCharge - discountAmount;
        }

        const adminCommissionRate = settingJSON?.adminCommissionRate;

        const adminShare = Math.floor((randomCallCharge * adminCommissionRate) / 100);
        const hostEarnings = randomCallCharge - adminShare;
        let agencyShare = 0;

        if (caller.coin >= randomCallCharge) {
          let agencyUpdate = null;
          if (receiver.agencyId) {
            const agency = await Agency.findById(receiver.agencyId).lean().select("_id commissionType commission");

            if (agency) {
              if (agency.commissionType === 1) {
                // Percentage commission
                agencyShare = (hostEarnings * agency.commission) / 100;
              } else {
                // Fixed salary, ignore earnings share
                agencyShare = 0;
              }

              agencyUpdate = Agency.updateOne({ _id: agency._id }, [
                {
                  $set: {
                    hostCoins: { $add: ["$hostCoins", hostEarnings] },
                    totalEarnings: { $add: ["$totalEarnings", Math.floor(agencyShare)] },
                    totalEarningsWithCommissionAndHostCoin: {
                      $add: [{ $add: ["$hostCoins", hostEarnings] }, { $add: ["$totalEarnings", Math.floor(agencyShare)] }],
                    },
                    netAvailableEarnings: {
                      $add: [{ $add: ["$hostCoins", hostEarnings] }, { $add: ["$totalEarnings", Math.floor(agencyShare)] }],
                    },
                  },
                },
              ]);
              F;
            }
          }

          console.log(`[callCoinCharged] Deducting ${randomCallCharge} coins from Caller: ${caller._id}, Admin Share: ${adminShare}, Host Earnings: ${hostEarnings}`);

          await Promise.all([
            User.updateOne(
              { _id: caller._id, coin: { $gte: randomCallCharge } },
              {
                $inc: {
                  coin: -randomCallCharge,
                  spentCoins: randomCallCharge,
                },
              }
            ),
            Host.updateOne({ _id: receiver._id }, { $inc: { coin: hostEarnings } }),
            History.updateOne(
              { _id: callHistory._id, userId: caller._id, hostId: receiver._id },
              {
                $set: {
                  agencyId: receiver.agencyId,
                  date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
                },
                $inc: {
                  userCoin: randomCallCharge,
                  hostCoin: hostEarnings,
                  adminCoin: adminShare,
                  agencyCoin: Math.floor(agencyShare),
                },
              }
            ),
            agencyUpdate,
          ]);

          console.log("[callCoinCharged] Coin deduction and history update successful.");
        } else {
          console.log(`[callCoinCharged] Insufficient Coins for Caller: ${caller._id}`);
          io.in("globalRoom:" + caller._id.toString()).emit("insufficientCoins", "You don't have sufficient coins.");
        }
      }
    } catch (error) {
      console.error("[callCoinCharged] Error:", error);
    }
  });

  socket.on("callCoinChargedForFakeCall", async (data) => {
    try {
      const parsedData = typeof data === "string" ? JSON.parse(data) : data;
      console.log("[callCoinChargedForFakeCall] Parsed Data:", parsedData);

      const { callerId, receiverId, callMode, callType, gender } = parsedData;

      const [callUniqueId, caller, receiver] = await Promise.all([
        generateHistoryUniqueId(),
        User.findById(callerId).select("_id coin isVip vipLevel").lean(),
        Host.findById(receiverId).select("_id coin privateCallRate audioCallRate randomCallRate randomCallFemaleRate randomCallMaleRate agencyId").lean(),
      ]);

      let vipPrivilege = null;
      if (caller?.isVip) {
        vipPrivilege = await VipPlanPrivilege.findOne({ level: caller.vipLevel || 1 }).lean();
      }

      if (!caller || !receiver) {
        console.log("[callCoinChargedForFakeCall] Caller or Receiver not found!");
        return;
      }

      const normalizedCallType = callType?.trim()?.toLowerCase();
      const normalizedCallMode = callMode?.trim()?.toLowerCase();

      let historyDoc = await History.findOne({
        userId: caller._id,
        hostId: receiver._id,
        callType: normalizedCallMode,
        isPrivate: normalizedCallMode === "private",
        isRandom: normalizedCallMode === "random",
        type: normalizedCallType === "audio" ? 11 : 12,
      });

      if (!historyDoc) {
        historyDoc = await History.create({
          uniqueId: callUniqueId,
          type: normalizedCallType === "audio" ? 11 : 12,
          userId: caller._id,
          hostId: receiver._id,
          isPrivate: normalizedCallMode === "private",
          isRandom: normalizedCallMode === "random",
          callType: normalizedCallMode,
          date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
        });
      }

      const historyId = historyDoc._id;
      const settingJSON = global.settings || { adminCommissionRate: 20 };
      const adminCommissionRate = settingJSON.adminCommissionRate || 20;

      const processCallPayment = async (callCharge, discountPercent = 0) => {
        const discountAmount = Math.floor((callCharge * discountPercent) / 100);
        callCharge -= discountAmount;

        const adminShare = Math.floor((callCharge * adminCommissionRate) / 100);
        const hostEarnings = callCharge - adminShare;

        let agencyShare = 0;
        let agencyUpdate = null;

        if (receiver.agencyId) {
          const agency = await Agency.findById(receiver.agencyId).lean().select("_id commissionType commission");

          if (agency) {
            if (agency.commissionType === 1) {
              agencyShare = (hostEarnings * agency.commission) / 100;
            }

            agencyUpdate = Agency.updateOne({ _id: agency._id }, [
              {
                $set: {
                  hostCoins: { $add: ["$hostCoins", hostEarnings] },
                  totalEarnings: { $add: ["$totalEarnings", Math.floor(agencyShare)] },
                  totalEarningsWithCommissionAndHostCoin: {
                    $add: [{ $add: ["$hostCoins", hostEarnings] }, { $add: ["$totalEarnings", Math.floor(agencyShare)] }],
                  },
                  netAvailableEarnings: {
                    $add: [{ $add: ["$hostCoins", hostEarnings] }, { $add: ["$totalEarnings", Math.floor(agencyShare)] }],
                  },
                },
              },
            ]);
          }
        }

        if (caller.coin >= callCharge) {
          await Promise.all([
            User.updateOne(
              { _id: caller._id, coin: { $gte: callCharge } },
              {
                $inc: {
                  coin: -callCharge,
                  spentCoins: callCharge,
                },
              }
            ),
            Host.updateOne({ _id: receiver._id }, { $inc: { coin: hostEarnings } }),
            History.updateOne(
              { _id: historyId },
              {
                $set: {
                  agencyId: receiver.agencyId || null,
                  date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
                },
                $inc: {
                  userCoin: callCharge,
                  hostCoin: hostEarnings,
                  adminCoin: adminShare,
                  agencyCoin: Math.floor(agencyShare),
                },
              }
            ),
            agencyUpdate,
          ]);

          console.log("[callCoinChargedForFakeCall] Coin deduction and history update successful.");
        } else {
          console.log(`[callCoinChargedForFakeCall] Insufficient Coins for Caller: ${caller._id}`);
          io.in("globalRoom:" + caller._id.toString()).emit("insufficientCoins", "You don't have sufficient coins.");
        }
      };

      if (normalizedCallMode === "private" && normalizedCallType === "audio") {
        const rate = Math.abs(receiver.audioCallRate);
        const discount = (caller?.isVip && vipPrivilege?.audioCallDiscount) ? Math.min(Math.max(vipPrivilege.audioCallDiscount, 0), 100) : 0;
        await processCallPayment(rate, discount);
      }

      if (normalizedCallMode === "private" && normalizedCallType === "video") {
        const rate = Math.abs(receiver.privateCallRate);
        const discount = (caller?.isVip && vipPrivilege?.videoCallDiscount) ? Math.min(Math.max(vipPrivilege.videoCallDiscount, 0), 100) : 0;
        await processCallPayment(rate, discount);
      }

      if (normalizedCallMode === "random" && normalizedCallType === "video") {
        let rate = Math.abs(receiver.randomCallRate) || 100;
        if (gender?.toLowerCase() === "female") {
          rate = Math.abs(receiver.randomCallFemaleRate);
        } else if (gender?.toLowerCase() === "male") {
          rate = Math.abs(receiver.randomCallMaleRate);
        }

        const discount = caller.isVip && vipPrivilege?.randomMatchCallDiscount ? Math.min(Math.max(vipPrivilege.randomMatchCallDiscount, 0), 100) : 0;

        await processCallPayment(rate, discount);
      }
    } catch (error) {
      console.error("[callCoinChargedForFakeCall] Error:", error);
    }
  });

  //random video call
  socket.on("ringingStarted", async (data) => {
    const parsedData = typeof data === "string" ? JSON.parse(data) : data;
    const { callerId, receiverId, agoraUID, channel, gender, callerRole, receiverRole } = parsedData;
    console.error("ringingStarted request received:", parsedData);

    const validRoles = ["user", "host"];
    if (!validRoles.includes(callerRole?.toLowerCase()) || !validRoles.includes(receiverRole?.toLowerCase())) {
      io.in("globalRoom:" + callerId.toString()).emit("callRinging", { message: "Invalid roles provided." });
      return;
    }

    const callerModel = callerRole.trim().toLowerCase() === "user" ? User : Host;
    const receiverModel = receiverRole.trim().toLowerCase() === "host" ? Host : User;

    const role = RtcRole.PUBLISHER;
    const uid = agoraUID ? agoraUID : 0;
    const expirationTimeInSeconds = 24 * 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    console.log("🔹 [Socket - randomCall] Generating Agora Token:");
    console.log("   - AppId:", global.settingJSON?.agoraAppId);
    console.log("   - Certificate:", global.settingJSON?.agoraAppCertificate);
    console.log("   - Channel:", channel);
    console.log("   - UID:", uid);

    const [callUniqueId, token, caller, receiver] = await Promise.all([
      generateHistoryUniqueId(),
      RtcTokenBuilder.buildTokenWithUid(global.settingJSON?.agoraAppId, global.settingJSON?.agoraAppCertificate, channel, uid, role, privilegeExpiredTs),
      User.findById(callerId).select("_id name image isBlock isBusy callId isOnline uniqueId").lean(),
      Host.findById(receiverId).select("_id name image isBlock isBusy callId isOnline uniqueId fcmToken").lean(),
    ]);

    if (!caller) {
      io.in("globalRoom:" + caller._id.toString()).emit("ringingStarted", { message: "Caller does not found." });
      console.error("Caller not found for ID:", callerId);
      return;
    }

    if (caller.isBlock) {
      io.in("globalRoom:" + caller._id.toString()).emit("ringingStarted", {
        message: "Caller is blocked.",
        isBlock: true,
      });
      return;
    }

    if (caller.isBusy && caller.callId) {
      io.in("globalRoom:" + caller._id.toString()).emit("ringingStarted", {
        message: "Caller is busy with someone else.",
        isBusy: true,
      });
      console.error("Caller is busy with another call. Caller ID:", callerId);
      return;
    }

    if (!receiver) {
      io.in("globalRoom:" + caller._id.toString()).emit("ringingStarted", { message: "Receiver does not found." });
      console.error("Receiver not found for ID:", receiverId);
      return;
    }

    if (receiver.isBlock) {
      io.in("globalRoom:" + caller._id.toString()).emit("ringingStarted", {
        message: "Receiver is blocked.",
        isBlock: true,
      });
      console.error("Receiver is blocked. Receiver ID:", receiverId);
      return;
    }

    if (!receiver.isOnline) {
      io.in("globalRoom:" + caller._id.toString()).emit("ringingStarted", {
        message: "Receiver is not online.",
        isOnline: false,
      });
      console.error("Receiver is not online. Receiver ID:", receiverId);
      return;
    }

    if (receiver.isBusy && receiver.callId) {
      io.in("globalRoom:" + caller._id.toString()).emit("ringingStarted", {
        message: "Receiver is busy with another call.",
        isBusy: true,
      });
      console.error("Receiver is busy with another call. Receiver ID:", receiverId);
      return;
    }

    if (!receiver.isBusy && receiver.callId === null) {
      console.log("Receiver and Caller are free. Proceeding with call setup.");

      const callHistory = new History();
      callHistory.uniqueId = callUniqueId;
      callHistory.callId = callUniqueId;

      const [callerVerify, receiverVerify] = await Promise.all([
        callerModel.updateOne(
          {
            _id: caller._id,
            isBlock: false,
            isOnline: true,
            isBusy: false,
            callId: null,
            ...(callerRole.trim().toLowerCase() === "host" ? { isFake: false, isLive: false } : {}),
          },
          {
            $set: {
              isBusy: true,
              callId: callHistory._id.toString(),
            },
          }
        ),
        receiverModel.updateOne(
          {
            _id: receiver._id,
            isBlock: false,
            isOnline: true,
            isBusy: false,
            callId: null,
            ...(receiverRole.trim().toLowerCase() === "host" ? { isFake: false, isLive: false } : {}),
          },
          {
            $set: {
              isBusy: true,
              callId: callHistory._id.toString(),
            },
          }
        ),
      ]);

      if (callerVerify.modifiedCount > 0 && receiverVerify.modifiedCount > 0) {
        const dataOfVideoCall = {
          callerId: caller._id,
          receiverId: receiver._id,
          callerImage: caller.image,
          callerName: caller.name,
          callerUniqueId: caller.uniqueId,
          receiverName: receiver.name,
          receiverImage: receiver.image,
          receiverUniqueId: receiver.uniqueId,
          callId: callHistory._id,
          callType: "video",
          callMode: "random",
          token,
          channel,
          callerRole,
          receiverRole,
          gender: gender.trim().toLowerCase(),
        };

        io.in("globalRoom:" + receiver._id.toString()).emit("callIncoming", dataOfVideoCall); // Notify receiver
        io.in("globalRoom:" + caller._id.toString()).emit("callConnected", dataOfVideoCall); // Notify caller

        console.log(`Call successfully initiated: ${caller.name} → ${receiver.name}`);

        if (!receiver.isBlock && receiver.fcmToken !== null) {
          const isVideo = dataOfVideoCall.callType?.trim().toLowerCase() === "video";
          const isRandom = dataOfVideoCall.callMode === "random";
          const callerName = dataOfVideoCall.callerName?.trim() || "Someone";

          const notificationTitle = isVideo ? (isRandom ? "🎥 Incoming Random Video Call!" : "🎥 Incoming Video Call") : isRandom ? "📞 Incoming Random Audio Call!" : "📞 Incoming Audio Call";

          const notificationBody = isVideo
            ? isRandom
              ? `${callerName} wants to randomly video chat with you! Tap to join 🔗`
              : `${callerName} is inviting you to a video call. Tap to connect now! 👥`
            : isRandom
            ? `${callerName} wants a random audio chat! Tap to talk 🎙️`
            : `${callerName} is calling you for an audio chat. Tap to join the conversation! 📞`;

          const payload = {
            token: receiver.fcmToken,
            data: {
              title: notificationTitle,
              body: notificationBody,
              type: "callIncoming",
              callType: dataOfVideoCall.callType,
              callId: dataOfVideoCall.callId.toString(),
              callerId: dataOfVideoCall.callerId.toString(),
              receiverId: dataOfVideoCall.receiverId.toString(),
              callerName: dataOfVideoCall.callerName,
              callerImage: dataOfVideoCall.callerImage,
              callerUniqueId: dataOfVideoCall.callerUniqueId,
              receiverName: dataOfVideoCall.receiverName,
              receiverImage: dataOfVideoCall.receiverImage,
              receiverUniqueId: dataOfVideoCall.receiverUniqueId,
              token: dataOfVideoCall.token,
              channel: dataOfVideoCall.channel,
              callMode: dataOfVideoCall.callMode,
              gender: dataOfVideoCall.gender,
            },
          };

          const adminInstance = await admin;
          adminInstance
            .messaging()
            .send(payload)
            .then((response) => {
              console.log("📨 Call notification sent successfully:", response);
            })
            .catch((error) => {
              console.error("⚠️ Failed to send call notification:", error);
            });
        }

        callHistory.type = 13;
        callHistory.callConnect = false;
        callHistory.isFree = isFree;
        callHistory.isPrivate = true;
        callHistory.callType = "video";
        callHistory.isRandom = true;
        callHistory.userId = caller._id;
        callHistory.hostId = receiver._id;
        callHistory.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

        await Promise.all([
          callHistory.save(),
          Randomcall({
            caller: caller._id,
          }).save(),
        ]);
      } else {
        console.log("Failed to verify caller or receiver availability");

        io.in("globalRoom:" + caller._id.toString()).emit("ringingStarted", {
          message: "Call setup failed. One or both users became unavailable.",
          isBusy: true,
        });

        // Update isBusy only for the user who failed verification
        if (callerVerify.modifiedCount > 0) {
          await User.updateOne({ _id: callerId, isBusy: true }, { $set: { isBusy: false, callId: null } });
          console.log(`🔹 Caller Status Updated: Caller verification failed, isBusy reset`);
        }

        if (receiverVerify.modifiedCount > 0) {
          await User.updateOne({ _id: receiverId, isBusy: true }, { $set: { isBusy: false, callId: null } });
          console.log(`🔹 Receiver Status Updated: Receiver verification failed, isBusy reset`);
        }
        return;
      }
    } else {
      console.log("Condition not met - receiver not available");
      console.error("Condition not met - receiver not available --> CallStarted");

      io.in("globalRoom:" + caller._id.toString()).emit("ringingStarted", {
        message: "Receiver is unavailable for a call at this moment.",
        isBusy: true,
      });
      return;
    }
  });

  //live-streaming
  socket.on("liveRoomJoin", async (data) => {
    const parsedData = typeof data === "string" ? JSON.parse(data) : data;
    console.log("liveRoomJoin connected : ", parsedData);

    const sockets = await io.in(globalRoom).fetchSockets();

    if (sockets?.length) {
      sockets.forEach((socket) => {
        // Leave all previous liveHistoryId rooms dynamically
        socket.rooms.forEach((room) => {
          if (room !== globalRoom) {
            console.log(`Leaving old room: ${room}`);
            socket.leave(room);
          }
        });

        // Join the new live room
        socket.join(parsedData.liveHistoryId);
        console.log(`Joined new room: ${parsedData.liveHistoryId}`);
      });

      io.in(parsedData.liveHistoryId).emit("liveRoomJoin", data);
    } else {
      console.log("Sockets not able to emit");
    }
  });

  socket.on("liveStreamStatusCheck", async (data) => {
    try {
      const dataOfCheck = typeof data === "string" ? JSON.parse(data) : data;
      console.log("[liveStreamStatusCheck] Parsed data:", dataOfCheck);

      const { liveHistoryId, hostId } = dataOfCheck;

      const liveUser = await LiveBroadcaster.findOne({ hostId: hostId, liveHistoryId: liveHistoryId }).lean();

      if (!liveUser) {
        console.log(`[liveStreamStatusCheck] User ${hostId} is not live.`);

        const targetSocket = io.sockets.sockets.get(socket.id);
        if (targetSocket) {
          console.log("Target socket exists, emitting...");
          targetSocket.emit("liveStreamStatusCheck", { hostId, liveStatus: false });
        } else {
          console.log("Target socket not found.");
        }
        return;
      }

      console.log(`[liveStreamStatusCheck] User ${hostId} is live.`);

      const targetSocket = io.sockets.sockets.get(socket.id);
      if (targetSocket) {
        console.log("Target socket exists, emitting...");
        targetSocket.emit("liveStreamStatusCheck", { hostId, liveStatus: true });
      } else {
        console.log("Target socket not found.");
      }
    } catch (error) {
      console.error("[liveStreamStatusCheck] Error:", error);
    }
  });

  socket.on("liveJoinerCount", async (data) => {
    const dataOfaddView = typeof data === "string" ? JSON.parse(data) : data;
    console.log("[liveJoinerCount] Received data:", dataOfaddView);

    const { userId, liveHistoryId } = dataOfaddView;

    const [user, liveUser, existLiveView] = await Promise.all([
      User.findById(userId).select("_id name image gender countryFlagImage country isVip vipLevel").lean(),
      LiveBroadcaster.findOne({ liveHistoryId }).select("view").lean(),
      LiveBroadcastView.findOne({ userId, liveHistoryId }).lean(),
    ]);

    if (!user) {
      console.log(`[liveJoinerCount] User not found.`);
      return;
    }

    if (!liveUser) {
      console.log(`[liveJoinerCount] LiveUser not found.`);
      return;
    }

    if (!socket.rooms.has(liveHistoryId)) {
      socket.join(liveHistoryId.toString());
      console.log(`[liveJoinerCount] joined room: ${liveHistoryId}`);
    } else {
      console.log(`[liveJoinerCount] User is already in room: ${liveHistoryId}`);
    }

    let isHidden = false;
    if (user?.isVip) {
      const vipPrivilege = await VipPlanPrivilege.findOne({ level: user.vipLevel || 1 }).lean();
      if (vipPrivilege?.hide) {
        isHidden = true;
      }
    }

    if (!existLiveView && !isHidden) {
      console.log("[liveJoinerCount] Creating new LiveView entry");

      await LiveBroadcastView.create({
        userId,
        liveHistoryId,
        ...user,
      });
    }

    const totalViews = await LiveBroadcastView.countDocuments({ liveHistoryId });
    console.log(`[liveJoinerCount] Total viewers for ${liveHistoryId}:`, totalViews);

    // If user is hidden, they see a message that they joined successfully but no one else is notified? 
    // Actually, we just don't add them to the view list.
    io.in(liveHistoryId).emit("liveJoinerCount", totalViews);

    await Promise.all([
      LiveBroadcaster.updateOne(
        { _id: liveUser?._id },
        {
          $set: { view: totalViews },
        }
      ),
      LiveBroadcastHistory.updateOne(
        { _id: liveHistoryId },
        {
          $set: { audienceCount: totalViews },
        }
      ),
    ]);
  });

  socket.on("removeLiveJoiner", async (data) => {
    try {
      const dataOflessView = typeof data === "string" ? JSON.parse(data) : data;
      console.log("[removeLiveJoiner] Received data:", dataOflessView);

      const { userId, liveHistoryId } = dataOflessView;

      const [liveUser, existLiveView] = await Promise.all([LiveBroadcaster.findOne({ liveHistoryId }).select("_id view").lean(), LiveBroadcastView.findOne({ userId, liveHistoryId }).lean()]);

      if (!liveUser) {
        console.log(`[removeLiveJoiner] LiveUser not found.`);
        return;
      }

      if (existLiveView) {
        console.log("[removeLiveJoiner] Removing user from LiveView");
        await LiveBroadcastView.deleteOne({ _id: existLiveView._id });
      }

      const totalViews = await LiveBroadcastView.countDocuments({ liveHistoryId });
      console.log(`[removeLiveJoiner] Updated total viewers for ${liveHistoryId}:`, totalViews);

      io.in(liveHistoryId).emit("removeLiveJoiner", totalViews);

      await LiveBroadcaster.updateOne({ _id: liveUser._id }, { $set: { view: totalViews } });

      socket.leave(liveHistoryId);
      console.log(`[removeLiveJoiner] User left room: ${liveHistoryId}`);
    } catch (error) {
      console.error("[removeLiveJoiner] Error:", error);
    }
  });

  socket.on("liveCommentBroadcast", async (data) => {
    try {
      const dataOfComment = typeof data === "string" ? JSON.parse(data) : data;
      console.log("[liveCommentBroadcast] Parsed data:", dataOfComment);

      const { liveHistoryId, userId, comment } = dataOfComment;
      if (!liveHistoryId || !userId) return;

      // Check if user is muted in this room
      const viewer = await LiveBroadcastView.findOne({ liveHistoryId, userId });
      if (viewer?.isMuted) {
        return io.to("globalRoom:" + userId).emit("liveCommentBroadcastError", "You are muted and cannot send messages in this room.");
      }

      if (!socket.rooms.has(liveHistoryId)) {
        socket.join(liveHistoryId.toString());
        console.log(`[liveCommentBroadcast] joined room: ${liveHistoryId}`);
      } else {
        console.log(`[liveCommentBroadcast] User is already in room: ${liveHistoryId}`);
      }

      const [liveHistory] = await Promise.all([LiveBroadcastHistory.findById(liveHistoryId).select("_id").lean()]);

      console.log(`[liveCommentBroadcast] Broadcast to room: ${liveHistoryId}`);
      io.in(liveHistoryId).emit("liveCommentBroadcast", data);

      const socketCount = (await io.in(liveHistoryId).fetchSockets())?.length || 0;
      console.log(`[liveCommentBroadcast] Active sockets in room ${liveHistoryId}:`, socketCount);

      if (liveHistory) {
        await LiveBroadcastHistory.updateOne({ _id: liveHistory._id }, { $inc: { liveComments: 1 } });
      }
    } catch (error) {
      console.error("[liveCommentBroadcast] Error:", error);
    }
  });

  socket.on("liveGiftSent", async (data) => {
    const giftData = typeof data === "string" ? JSON.parse(data) : data;
    console.log("Gift Data Received:", giftData);

    if (!socket.rooms.has(giftData.liveHistoryId)) {
      socket.join(giftData.liveHistoryId.toString());
      console.log(`[liveGiftSent] joined room: ${giftData.liveHistoryId}`);
    } else {
      console.log(`[liveGiftSent] User is already in room: ${giftData.liveHistoryId}`);
    }

    try {
      const [uniqueId, senderUser, receiver, gift] = await Promise.all([
        generateHistoryUniqueId(),
        User.findById(giftData.senderId).lean().select("_id coin"),
        Host.findById(giftData.receiverId).lean().select("_id coin totalGifts agencyId"),
        Gift.findById(giftData.giftId).lean().select("_id coin image type svgaImage"),
      ]);

      if (!senderUser) {
        console.log("Sender user not found");
        io.in(`globalRoom:${giftData.senderUserId}`).emit("liveGiftReceived", { error: "Sender user not found" });
        return;
      }

      if (!receiver) {
        console.log("Receiver user not found");
        io.in(`globalRoom:${giftData.receiverId}`).emit("liveGiftReceived", { error: "Receiver user not found" });
        return;
      }

      if (!gift) {
        console.log("Gift not found");
        io.in(`globalRoom:${giftData.senderUserId}`).emit("liveGiftReceived", { error: "Gift not found" });
        return;
      }

      const giftCount = Number(giftData.giftCount);
      const coinPerGift = Math.abs(gift.coin);
      const totalCoin = coinPerGift * giftCount;

      if (senderUser.coin < totalCoin) {
        console.log("Insufficient coins");
        io.in(`globalRoom:${giftData.senderUserId}`).emit("liveGiftReceived", { error: "You don't have enough coins" });
        return;
      }

      io.in(giftData.liveHistoryId).emit("liveGiftReceived", giftData);

      const adminCommissionRate = settingJSON.adminCommissionRate;
      let adminShare = (totalCoin * adminCommissionRate) / 100;
      let hostEarnings = totalCoin - adminShare;
      let agencyShare = 0;

      let agencyUpdate = null;
      if (receiver.agencyId) {
        const agency = await Agency.findById(receiver.agencyId).lean().select("_id commissionType commission");

        if (agency) {
          if (agency.commissionType === 1) {
            // Percentage commission
            agencyShare = (hostEarnings * agency.commission) / 100;
          } else {
            // Fixed salary, ignore earnings share
            agencyShare = 0;
          }

          agencyUpdate = Agency.updateOne({ _id: agency._id }, [
            {
              $set: {
                hostCoins: { $add: ["$hostCoins", hostEarnings] },
                totalEarnings: { $add: ["$totalEarnings", Math.floor(agencyShare)] },
                totalEarningsWithCommissionAndHostCoin: {
                  $add: [{ $add: ["$hostCoins", hostEarnings] }, { $add: ["$totalEarnings", Math.floor(agencyShare)] }],
                },
                netAvailableEarnings: {
                  $add: [{ $add: ["$hostCoins", hostEarnings] }, { $add: ["$totalEarnings", Math.floor(agencyShare)] }],
                },
              },
            },
          ]);
        }
      }

      const liveHistoryUpdate =
        giftData.liveHistoryId && mongoose.Types.ObjectId.isValid(giftData.liveHistoryId)
          ? LiveBroadcastHistory.findByIdAndUpdate(
              giftData.liveHistoryId,
              {
                $inc: {
                  coins: totalCoin,
                  gifts: giftCount,
                },
              },
              { new: true }
            )
          : Promise.resolve();

      await Promise.all([
        User.updateOne(
          { _id: senderUser._id, coin: { $gte: totalCoin } },
          {
            $inc: {
              coin: -totalCoin,
              spentCoins: totalCoin,
            },
          }
        ),
        Host.updateOne({ _id: receiver._id }, { $inc: { coin: hostEarnings, totalGifts: 1 } }),
        History.create({
          uniqueId: uniqueId,
          type: 2,
          userId: senderUser._id,
          hostId: receiver._id,
          agencyId: receiver?.agencyId,
          giftId: giftData.giftId,
          giftCoin: gift.coin || 0,
          giftImage: gift.image || "",
          giftsvgaImage: gift.svgaImage || "",
          giftType: gift.type || 1,
          giftCount: giftCount,
          userCoin: totalCoin,
          hostCoin: hostEarnings,
          adminCoin: adminShare,
          agencyCoin: Math.floor(agencyShare),
          date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
        }),
        agencyUpdate,
        liveHistoryUpdate,
      ]);
    } catch (error) {
      console.error("Error in liveGiftSent:", error);
      io.in(giftData.liveHistoryId).emit("liveGiftReceived", { error: "An error occurred while processing the gift." });
      return;
    }
  });

  socket.on("giftSent", async (data) => {
    const giftData = typeof data === "string" ? JSON.parse(data) : data;
    console.log("Gift Data Received:", giftData);

    if (!socket.rooms.has(giftData.liveHistoryId)) {
      socket.join(giftData.liveHistoryId?.toString());
      console.log(`[liveGiftSent] joined room: ${giftData.liveHistoryId}`);
    } else {
      console.log(`[liveGiftSent] User is already in room: ${giftData.liveHistoryId}`);
    }

    let sender = giftData.sendBy == "user" ? User : Host;
    let receiverModel = giftData.sendBy == "user" ? Host : User;


    try {
      const [uniqueId, senderUser, receiver, gift] = await Promise.all([
        generateHistoryUniqueId(),
        sender.findById(giftData.senderId).lean().select("_id coin totalGifts agencyId"),
        receiverModel.findById(giftData.receiverId).lean().select("_id coin totalGifts agencyId"),
        Gift.findById(giftData.giftId).lean().select("_id coin image type svgaImage"),
      ]);

      if (!senderUser) {
        console.log("Sender user not found");
        io.in(`globalRoom:${giftData.senderUserId}`).emit("liveGiftReceived", { error: "Sender user not found" });
        return;
      }

      if (!receiver) {
        console.log("Receiver user not found");
        io.in(`globalRoom:${giftData.receiverId}`).emit("liveGiftReceived", { error: "Receiver user not found" });
        return;
      }

      if (!gift) {
        console.log("Gift not found");
        io.in(`globalRoom:${giftData.senderUserId}`).emit("liveGiftReceived", { error: "Gift not found" });
        return;
      }

      const giftCount = Number(giftData.giftCount);
      const coinPerGift = Math.abs(gift.coin);
      const totalCoin = coinPerGift * giftCount;

      if (senderUser.coin < totalCoin) {
        console.log("Insufficient coins");
        io.in(`globalRoom:${giftData.senderUserId}`).emit("liveGiftReceived", { error: "You don't have enough coins" });
        return;
      }

      io.in(giftData.liveHistoryId).emit("liveGiftReceived", giftData);

      const adminCommissionRate = settingJSON.adminCommissionRate;
      let adminShare = (totalCoin * adminCommissionRate) / 100;
      let hostEarnings = totalCoin - adminShare;
      let agencyShare = 0;

      let agencyUpdate = null;
      if (receiver.agencyId) {
        const agency = await Agency.findById(receiver.agencyId).lean().select("_id commissionType commission");

        if (agency) {
          if (agency.commissionType === 1) {
            // Percentage commission
            agencyShare = (hostEarnings * agency.commission) / 100;
          } else {
            // Fixed salary, ignore earnings share
            agencyShare = 0;
          }

          agencyUpdate = Agency.updateOne({ _id: agency._id }, [
            {
              $set: {
                hostCoins: { $add: ["$hostCoins", hostEarnings] },
                totalEarnings: { $add: ["$totalEarnings", Math.floor(agencyShare)] },
                totalEarningsWithCommissionAndHostCoin: {
                  $add: [{ $add: ["$hostCoins", hostEarnings] }, { $add: ["$totalEarnings", Math.floor(agencyShare)] }],
                },
                netAvailableEarnings: {
                  $add: [{ $add: ["$hostCoins", hostEarnings] }, { $add: ["$totalEarnings", Math.floor(agencyShare)] }],
                },
              },
            },
          ]);
        }
      }

      // const liveHistoryUpdate =
      //   giftData.liveHistoryId && mongoose.Types.ObjectId.isValid(giftData.liveHistoryId)
      //     ? LiveBroadcastHistory.findByIdAndUpdate(
      //         giftData.liveHistoryId,
      //         {
      //           $inc: {
      //             coins: totalCoin,
      //             gifts: giftCount,
      //           },
      //         },
      //         { new: true }
      //       )
      //     : Promise.resolve();

      await Promise.all([
        sender.updateOne(
          { _id: senderUser._id, coin: { $gte: totalCoin } },
          {
            $inc: {
              coin: -totalCoin,
              spentCoins: totalCoin,
            },
          }
        ),
        receiverModel.updateOne({ _id: receiver._id }, { $inc: { coin: hostEarnings, totalGifts: 1 } }),
        History.create({
          uniqueId: uniqueId,
          type: 2,
          ...(giftData.sendBy == "user" ? {userId: senderUser._id} : {hostId: senderUser._id}),
          ...(giftData.sendBy == "user" ? {userId: receiver._id} : {hostId: receiver._id}),
          agencyId: receiver?.agencyId,
          giftId: giftData.giftId,
          giftCoin: gift.coin || 0,
          giftImage: gift.image || "",
          giftsvgaImage: gift.svgaImage || "",
          giftType: gift.type || 1,
          giftCount: giftCount,
          ...(giftData.sendBy == "user" ? {userCoin: totalCoin} : {hostCoin: totalCoin}),
          ...(giftData.sendBy == "host" ? {hostCoin: hostEarnings} : {userCoin: hostEarnings}),
          // userCoin: totalCoin,
          // hostCoin: hostEarnings,
          adminCoin: adminShare,
          agencyCoin: Math.floor(agencyShare),
          date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
        }),
        agencyUpdate,
      ]);
    } catch (error) {
      console.error("Error in liveGiftSent:", error);
      console.error("Gift Data for error emit:", giftData);
      console.error("Live history ID:", giftData.liveHistoryId);
      io.in(giftData.liveHistoryId).emit("liveGiftReceived", { error: "An error occurred while processing the gift." });
      return;
    }
  });

  socket.on("liveStreamEnd", async (data) => {
    try {
      const parsedData = typeof data === "string" ? JSON.parse(data) : data;
      console.log("Received liveStreamEnd event with data:", parsedData);

      const { hostId, liveHistoryId } = parsedData;

      io.in(liveHistoryId).emit("liveStreamEnd", data);

      const [host, liveUser, liveHistory] = await Promise.all([
        Host.findOne({ liveHistoryId }).select("_id isLive isBusy liveHistoryId").lean(),
        LiveBroadcaster.findOne({ hostId, liveHistoryId }).select("_id hostId liveHistoryId isAudio").lean(),
        LiveBroadcastHistory.findById(liveHistoryId).select("_id startTime endTime duration").lean(),
      ]);

      if (!host) {
        console.log("⚠️ Host not found.");
        return;
      }

      if (!liveUser) {
        console.log(`⚠️ No LiveUser found with hostId: ${hostId} and liveHistoryId: ${liveHistoryId}`);
        return;
      }

      if (!liveHistory) {
        console.log("⚠️ LiveHistory not found.");
        return;
      }

      if (host.isLive) {
        const endTime = moment().tz("Asia/Kolkata").format();
        const start = moment.tz(liveHistory.startTime, "Asia/Kolkata");
        const end = moment.tz(endTime, "Asia/Kolkata");
        const duration = moment.utc(end.diff(start)).format("HH:mm:ss");

        await Promise.all([
          LiveBroadcastHistory.updateOne({ _id: liveHistory._id }, { $set: { endTime, duration } }),
          Host.updateOne({ _id: host._id }, { $set: { isLive: false, isBusy: false, liveHistoryId: null } }),
          LiveBroadcastView.deleteMany({ liveHistoryId }),
          LiveBroadcaster.deleteOne({ hostId, liveHistoryId }),
        ]);

        console.log(`✅ Host is no longer live.`);
        console.log("✅ Related liveViews deleted.");
        console.log(`✅ LiveBroadcaster entry deleted for hostId: ${hostId}`);
      }

      const sockets = await io.in(liveHistoryId).fetchSockets();
      console.log(`🔄 Active sockets in room (${liveHistoryId}): ${sockets.length}`);

      if (sockets.length) {
        io.socketsLeave(liveHistoryId);
        console.log(`✅ All sockets removed from room: ${liveHistoryId}`);
      } else {
        console.log("⚠️ No active sockets found to remove.");
      }
    } catch (error) {
      console.error("❌ Error in liveStreamEnd:", error);
    }
  });

  // Room Moderation: Mute and Kick with Hierarchy
  socket.on("roomAction", async (data) => {
    try {
      const parsedData = typeof data === "string" ? JSON.parse(data) : data;
      console.log("🔹 [roomAction] event received:", parsedData);

      const { action, senderId, targetId, liveHistoryId } = parsedData; // action: "mute" or "kick"

      if (!action || !senderId || !targetId || !liveHistoryId) {
        return console.log("❌ [roomAction] Missing required fields.");
      }

      // Fetch sender and target details
      const [sender, target] = await Promise.all([
        User.findById(senderId).select("name isVip vipLevel").lean(),
        User.findById(targetId).select("name isVip vipLevel").lean(),
      ]);

      if (!sender || !target) {
        return console.log("❌ [roomAction] Sender or Target not found.");
      }

      const senderLevel = sender.isVip ? (sender.vipLevel || 1) : 0;
      const targetLevel = target.isVip ? (target.vipLevel || 1) : 0;

      // Hierarchy Check: Sender must have a higher level than target (or target is not VIP)
      // SVIP (3) can action on VVIP (2), VIP (1), Normal (0)
      // VVIP (2) can action on VIP (1), Normal (0)
      // VIP (1) can action on Normal (0)
      
      const [senderPrivilege, targetPrivilege] = await Promise.all([
        VipPlanPrivilege.findOne({ level: senderLevel }).lean(),
        VipPlanPrivilege.findOne({ level: targetLevel }).lean(),
      ]);

      // Check if sender has general room authority
      if (!senderPrivilege || !senderPrivilege.roomAuthority) {
        return io.to("globalRoom:" + senderId).emit("roomActionError", "You don't have authority to perform this action.");
      }

      // Specific check for 'kick'
      if (action === "kick" && !senderPrivilege.kick) {
        return io.to("globalRoom:" + senderId).emit("roomActionError", "You don't have authority to kick users.");
      }

      // Hierarchy Enforcer: SVIP can mute VVIP/VIP even if target has authority. 
      // Rule: level must be higher.
      if (senderLevel <= targetLevel && targetLevel > 0) {
        return io.to("globalRoom:" + senderId).emit("roomActionError", `You cannot ${action} a user with an equal or higher level.`);
      }

      // Check for specific 'Mute VIP/VVIP' permission if target is a VIP
      if (action === "mute" && targetLevel > 0 && !senderPrivilege.canMuteOthers) {
        return io.to("globalRoom:" + senderId).emit("roomActionError", "You don't have authority to mute other VIP members.");
      }

      // Execute Action
      if (action === "mute") {
        console.log(`🔇 User ${sender.name} muted ${target.name} in room ${liveHistoryId}`);
        
        // Persist mute in database
        await LiveBroadcastView.updateOne({ liveHistoryId, userId: targetId }, { $set: { isMuted: true } });

        io.in(liveHistoryId).emit("roomActionExecuted", { 
          action: "mute", 
          targetId, 
          senderName: sender.name, 
          targetName: target.name 
        });
      } else if (action === "kick") {
        console.log(`👞 User ${sender.name} kicked ${target.name} from room ${liveHistoryId}`);
        
        // Remove viewer from database (so they stop appearing in counts)
        await LiveBroadcastView.deleteOne({ liveHistoryId, userId: targetId });

        io.in(liveHistoryId).emit("roomActionExecuted", { 
          action: "kick", 
          targetId, 
          senderName: sender.name, 
          targetName: target.name 
        });
        
        // Target's frontend should handle the socket.leave based on this event
      }

    } catch (error) {
      console.error("❌ [roomAction] Error:", error);
    }
  });


  socket.on("disconnect", async (reason) => {
    console.log(`Socket disconnected: ${id} - ${socket.id} - Reason: ${reason}`);

    if (globalRoom) {
      const sockets = await io.in(globalRoom).fetchSockets();
      console.log("🔄 Checking active sockets in room:", sockets.length);

      if (sockets?.length == 0) {
        const personId = new mongoose.Types.ObjectId(id);
        console.log(`🔍 Fetching data for Id: ${personId}`);

        const host = await Host.findById(personId).select("_id callId isLive liveHistoryId").lean();
        if (host) {
          if (host.callId && host.callId !== null) {
            const callId = new mongoose.Types.ObjectId(host.callId);
            console.log(`📞 Host was in an active call. Ending Call ID: ${callId}`);

            io.socketsLeave(host.callId.toString());

            const [callHistory] = await Promise.all([
              History.findById(callId).select("_id callStartTime"),
              Privatecall.deleteOne({ receiver: personId }),
              Host.updateOne({ _id: personId }, { $set: { isOnline: false, isBusy: false, isLive: false, callId: null, liveHistoryId: null } }),
            ]);

            if (callHistory) {
              callHistory.callConnect = false;
              callHistory.callEndTime = moment().tz("Asia/Kolkata").format();

              const start = moment.tz(callHistory.callStartTime, "Asia/Kolkata");
              const end = moment.tz(callHistory.callEndTime, "Asia/Kolkata");
              const duration = moment.utc(end.diff(start)).format("HH:mm:ss");
              callHistory.duration = duration;

              await Promise.all([
                callHistory?.save(),
                Chat.findOneAndUpdate(
                  { callId: callHistory._id },
                  {
                    $set: {
                      callDuration: duration,
                      callType: 1, // 1 = Received Call
                      isRead: true,
                    },
                  },
                  { new: true }
                ),
              ]);
            }
          }

          if (host.isLive && host.liveHistoryId) {
            const liveHistoryId = new mongoose.Types.ObjectId(host.liveHistoryId);
            console.log(`📴 Live session ended for host. Live History ID: ${liveHistoryId}`);

            const liveHistory = await LiveBroadcastHistory.findById(liveHistoryId).select("startTime").lean();

            const endTime = moment().tz("Asia/Kolkata").format();
            const start = moment.tz(liveHistory.startTime, "Asia/Kolkata");
            const end = moment.tz(endTime, "Asia/Kolkata");
            const duration = moment.utc(end.diff(start)).format("HH:mm:ss");

            await Promise.all([
              LiveBroadcastHistory.updateOne({ _id: liveHistory._id }, { $set: { endTime, duration } }),
              Host.updateOne({ _id: host._id }, { $set: { isLive: false, isBusy: false, liveHistoryId: null } }),
              LiveBroadcastView.deleteMany({ liveHistoryId }),
              LiveBroadcaster.deleteOne({ hostId: personId, liveHistoryId }),
            ]);

            console.log(`✅ Host is no longer live.`);
            console.log("✅ Related liveViews deleted.");
            console.log(`✅ LiveBroadcaster entry deleted`);
          }

          await Host.updateOne(
            { _id: host._id },
            {
              $set: {
                isOnline: false,
                isBusy: false,
                isLive: false,
                liveHistoryId: null,
                callId: null,
              },
            }
          );
        } else {
          const user = await User.findById(personId).select("_id callId").lean();

          if (user) {
            if (user.callId && user.callId !== null) {
              const callId = new mongoose.Types.ObjectId(user.callId);
              console.log(`📞 User was in an active call. Ending Call ID: ${callId}`);

              io.socketsLeave(user.callId.toString());

              const [callHistory] = await Promise.all([
                History.findById(callId).select("_id callStartTime"),
                Privatecall.deleteOne({ caller: personId }),
                User.updateOne(
                  { _id: personId },
                  {
                    $set: {
                      isOnline: false,
                      isBusy: false,
                      isLive: false,
                      callId: null,
                      liveHistoryId: null,
                    },
                  }
                ),
              ]);

              if (callHistory) {
                callHistory.callConnect = false;
                callHistory.callEndTime = moment().tz("Asia/Kolkata").format();

                const start = moment.tz(callHistory.callStartTime, "Asia/Kolkata");
                const end = moment.tz(callHistory.callEndTime, "Asia/Kolkata");
                const duration = moment.utc(end.diff(start)).format("HH:mm:ss");
                callHistory.duration = duration;

                await Promise.all([
                  callHistory?.save(),
                  Chat.updateOne(
                    { callId: callHistory._id },
                    {
                      $set: {
                        callDuration: duration,
                        callType: 1, // 1 = Received Call
                        isRead: true,
                      },
                    }
                  ),
                ]);
              }
            }

            await User.updateOne(
              { _id: user._id },
              {
                $set: {
                  isOnline: false,
                  isBusy: false,
                  isLive: false,
                  liveHistoryId: null,
                  callId: null,
                },
              }
            );
          }
        }
      }
    }
  });
});
