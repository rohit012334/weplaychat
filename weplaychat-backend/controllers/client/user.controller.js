const User = require("../../models/user.model");

//fs
const fs = require("fs");

//mongoose
const mongoose = require("mongoose");

//import model
const History = require("../../models/history.model");
const Host = require("../../models/host.model");
const ChatTopic = require("../../models/chatTopic.model");
const Chat = require("../../models/chat.model");
const Message = require("../../models/message.model");
const LiveBroadcastHistory = require("../../models/liveBroadcastHistory.model");
const Block = require("../../models/block.model");
const CheckIn = require("../../models/checkIn.model");
const HostMatchHistory = require("../../models/hostMatchHistory.model");
const LiveBroadcastView = require("../../models/liveBroadcastView.model");
const LiveBroadcaster = require("../../models/liveBroadcaster.model");
const VipPlanPrivilege = require("../../models/vipPlanPrivilege.model");
const FollowerFollowing = require("../../models/followerFollowing.model");

//deletefile
const { deleteFile } = require("../../util/deletefile");

//userFunction
const userFunction = require("../../util/userFunction");

function deleteFileIfExists(filePath) {
  if (filePath) {
    const fullPath = path.resolve(__dirname, filePath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`File deleted: ${fullPath}`);
    } else {
      console.log(`File not found: ${fullPath}`);
    }
  } else {
    console.log("No file path provided to delete.");
  }
}

//generateHistoryUniqueId
const generateHistoryUniqueId = require("../../util/generateHistoryUniqueId");

//validatePlanExpiration
const validatePlanExpiration = require("../../util/validatePlanExpiration");

const path = require("path");

//getFirebaseAdmin
const getFirebaseAdmin = require("../../util/privateKey");

//check the user is exists or not with loginType 3 quick (identity)
exports.quickUserVerification = async (req, res) => {
  try {
    const { identity } = req.query;

    if (!identity) {
      return res
        .status(200)
        .json({ status: false, message: "identity is required." });
    }

    const user = await User.findOne({ identity, loginType: 3 })
      .select("_id")
      .lean();

    return res.status(200).json({
      status: true,
      message: user ? "User login successfully." : "User must sign up.",
      isLogin: !!user,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error" });
  }
};

//user login and sign up
// exports.signInOrSignUpUser = async (req, res) => {
//   try {
//     const { identity, loginType, fcmToken, email, name, image, dob } = req.body;

//     if (!identity || loginType === undefined || !fcmToken) {
//       if (req.file) deleteFile(req.file);
//       return res
//         .status(200)
//         .json({ status: false, message: "Oops! Invalid details!!" });
//     }

//     const { uid, provider } = req.user;

//     let userQuery;

//     switch (loginType) {
//       case 1:
//         if (!email)
//           return res
//             .status(200)
//             .json({ status: false, message: "email is required." });
//         userQuery = { email, loginType: 1 };
//         break;
//       case 2:
//         if (!email)
//           return res
//             .status(200)
//             .json({ status: false, message: "email is required." });
//         userQuery = { email, loginType: 2 };
//         break;
//       case 3:
//         if (!identity && !email) {
//           return res
//             .status(200)
//             .json({
//               status: false,
//               message: "Either identity or email is required.",
//             });
//         }
//         userQuery = {};
//         break;
//       default:
//         if (req.file) deleteFile(req.file);
//         return res
//           .status(200)
//           .json({ status: false, message: "Invalid loginType." });
//     }

//     let user = null;
//     if (Object.keys(userQuery).length > 0) {
//       user = await User.findOne(userQuery).select(
//         "_id loginType name image fcmToken lastlogin isBlock isHost hostId",
//       );
//     }

//     if (user) {
//       console.log("✅ User already exists, logging in...");

//       if (user.isBlock) {
//         return res
//           .status(403)
//           .json({ status: false, message: "🚷 User is blocked by the admin." });
//       }

//       if (user.isHost && user.hostId) {
//         const host = await Host.findById(user.hostId).select(
//           "isBlock fcmToken",
//         );

//         if (!host) {
//           console.warn(`⚠️ No Host found with ID: ${user.hostId}`);
//         } else {
//           if (host.isBlock) {
//             return res
//               .status(403)
//               .json({
//                 status: false,
//                 message: "🚷 Host account is blocked by the admin.",
//               });
//           }

//           host.fcmToken = fcmToken || host.fcmToken;
//           await host.save();
//         }
//       }

//       user.name = name ? name?.trim() : user.name;
//       user.dob = dob ? dob?.trim() : user.dob;
//       user.image = req.file ? req.file.path : image ? image : user.image;
//       user.fcmToken = fcmToken ? fcmToken : user.fcmToken;
//       user.lastlogin = new Date().toLocaleString("en-US", {
//         timeZone: "Asia/Kolkata",
//       });
//       await user.save();

//       return res
//         .status(200)
//         .json({
//           status: true,
//           message: "User logged in.",
//           user: user,
//           signUp: false,
//         });
//     } else {
//       console.log("🆕 Registering new user...");

//       const bonusCoins = settingJSON.isFreeCallEnabled ? 0 : (settingJSON.loginBonus ? settingJSON.loginBonus : 5000);

//       const newUser = new User();
//       newUser.firebaseUid = uid;
//       newUser.provider = provider;
//       newUser.coin = bonusCoins;
//       newUser.freeCallCount = settingJSON.isFreeCallEnabled ? (settingJSON.freeCallLimit || 5) : 0;
//       newUser.date = new Date().toLocaleString("en-US", {
//         timeZone: "Asia/Kolkata",
//       });

//       const user = await userFunction(newUser, req);

//       res.status(200).json({
//         status: true,
//         message: "A new user has registered an account.",
//         signUp: true,
//         user: {
//           _id: user._id,
//           loginType: user.loginType,
//           name: user.name,
//           image: user.image,
//           fcmToken: user.fcmToken,
//           lastlogin: user.lastlogin,
//         },
//       });

//       const uniqueId = await generateHistoryUniqueId();

//       await Promise.all([
//         History.create({
//           uniqueId: uniqueId,
//           userId: newUser._id,
//           userCoin: bonusCoins,
//           type: 1,
//           date: new Date().toLocaleString("en-US", {
//             timeZone: "Asia/Kolkata",
//           }),
//         }),
//       ]);

//       if (user && user.fcmToken && user.fcmToken !== null) {
//         const payload = {
//           token: user.fcmToken,
//           data: {
//             title: "🚀 Instant Bonus Activated! 🎁",
//             body: "🎊 Hooray! You've unlocked a special welcome reward just for joining us. Enjoy your bonus! 💰",
//             type: "LOGINBONUS",
//           },
//         };

//         const adminPromise = await admin;
//         adminPromise
//           .messaging()
//           .send(payload)
//           .then((response) => {
//             console.log("Successfully sent with response: ", response);
//           })
//           .catch((error) => {
//             console.log("Error sending message: ", error);
//           });
//       }

//       //✅ Send random messages from 4 hosts
//       const [hosts, latestMessageDoc] = await Promise.all([
//         Host.find({ video: { $ne: [] } })
//           .sort({ createdAt: -1 })
//           .limit(5),
//         Message.findOne().sort({ createdAt: -1 }).lean(),
//       ]);

//       const fallbackMessages = [
//         "Hey there! 👋",
//         "How's your day going? 😊",
//         "Wanna chat? 💬",
//         "You look amazing today! ✨",
//         "Let's talk! 💖",
//         "Hope you're having a great time! 🌟",
//         "What's your favorite movie? 🎬",
//         "I’d love to get to know you better! 😄",
//       ];

//       for (const host of hosts) {
//         const chatTopic = await ChatTopic.findOne({
//           $or: [
//             { senderId: host._id, receiverId: user._id },
//             { senderId: user._id, receiverId: host._id },
//           ],
//         });

//         const messages =
//           latestMessageDoc?.message?.length > 0
//             ? latestMessageDoc.message
//             : fallbackMessages;
//         const randomMessage =
//           messages[Math.floor(Math.random() * messages.length)];
//         const messageType = Math.random() < 0.5 ? 1 : 2;

//         let imageUrl = "";
//         if (messageType === 2) {
//           const images = Array.isArray(host.image) ? host.image : [host.image];
//           if (images.length > 0) {
//             const index = Math.floor(Math.random() * images.length);
//             imageUrl = images[index];
//           }
//         }

//         let chat;
//         if (chatTopic) {
//           chat = new Chat({
//             chatTopicId: chatTopic._id,
//             senderId: host._id,
//             messageType,
//             message: messageType === 2 ? "📸 Image" : randomMessage,
//             image: messageType === 2 ? imageUrl : "",
//             date: new Date().toLocaleString("en-US", {
//               timeZone: "Asia/Kolkata",
//             }),
//           });
//           chatTopic.chatId = chat._id;
//           await Promise.all([chat.save(), chatTopic.save()]);
//         } else {
//           const newChatTopic = new ChatTopic({
//             senderId: host._id,
//             receiverId: user._id,
//           });

//           chat = new Chat({
//             chatTopicId: newChatTopic._id,
//             senderId: host._id,
//             messageType,
//             message: messageType === 2 ? "📸 Image" : randomMessage,
//             image: messageType === 2 ? imageUrl : "",
//             date: new Date().toLocaleString("en-US", {
//               timeZone: "Asia/Kolkata",
//             }),
//           });

//           newChatTopic.chatId = chat._id;
//           await Promise.all([newChatTopic.save(), chat.save()]);
//         }

//         if (user && user.fcmToken && user.fcmToken !== null) {
//           const payload = {
//             token: user.fcmToken,
//             data: {
//               title: `${host.name} sent you a message 📩`,
//               body: `🗨️ ${chat.message}`,
//               type: "CHAT",
//               senderId: String(host._id),
//               isFake: String(host.isFake),
//               receiverId: String(user._id),
//               userName: String(host.name),
//               hostName: String(user.name),
//               userImage: String(host.image || ""),
//               hostImage: String(user.image || ""),
//               senderRole: "host",
//               isFakeSender: String(host.isFake || "false"),
//             },
//           };

//           const adminInstance = await admin;
//           adminInstance.messaging().send(payload).catch(console.error);
//         }
//       }
//     }
//   } catch (error) {
//     if (req.file) deleteFile(req.file);
//     console.error("Error:", error);
//     res.status(500).json({ status: false, message: "Internal Server Error" });
//   }
// };

exports.signInOrSignUpUser = async (req, res) => {
  try {
    const { identity, loginType, fcmToken, email, name, image, dob } = req.body;

    if (!identity || loginType === undefined || !fcmToken) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "Oops! Invalid details!!" });
    }

    const { uid, provider } = req.user;

    let userQuery;

    switch (loginType) {
      case 1:
        if (!email) return res.status(200).json({ status: false, message: "email is required." });
        userQuery = { email, loginType: 1 };
        break;
      case 2:
        if (!email) return res.status(200).json({ status: false, message: "email is required." });
        userQuery = { email, loginType: 2 };
        break;
      case 3:
        if (!identity && !email) {
          return res.status(200).json({ status: false, message: "Either identity or email is required." });
        }
        userQuery = {};
        break;
      default:
        if (req.file) deleteFile(req.file);
        return res.status(200).json({ status: false, message: "Invalid loginType." });
    }

    let user = null;
    if (Object.keys(userQuery).length > 0) {
      user = await User.findOne(userQuery).select(
        "_id loginType name image fcmToken lastlogin isBlock isHost hostId"
      );
    }

    // ✅ Fallback: firebaseUid se check karo (loginType 3 + duplicate fix)
    if (!user && uid) {
      user = await User.findOne({ firebaseUid: uid }).select(
        "_id loginType name image fcmToken lastlogin isBlock isHost hostId"
      );
    }

    if (user) {
      console.log("✅ User already exists, logging in...");

      if (user.isBlock) {
        return res.status(403).json({ status: false, message: "🚷 User is blocked by the admin." });
      }

      if (user.isHost && user.hostId) {
        const host = await Host.findById(user.hostId).select("isBlock fcmToken");

        if (!host) {
          console.warn(`⚠️ No Host found with ID: ${user.hostId}`);
        } else {
          if (host.isBlock) {
            return res.status(403).json({ status: false, message: "🚷 Host account is blocked by the admin." });
          }
          host.fcmToken = fcmToken || host.fcmToken;
          await host.save();
        }
      }

      user.name = name ? name?.trim() : user.name;
      user.dob = dob ? dob?.trim() : user.dob;
      user.image = req.file ? req.file.path : image ? image : user.image;
      user.fcmToken = fcmToken ? fcmToken : user.fcmToken;
      user.lastlogin = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      await user.save();

      return res.status(200).json({
        status: true,
        message: "User logged in.",
        user: user,
        signUp: false,
      });

    } else {
      console.log("🆕 Registering new user...");

      const bonusCoins = settingJSON.isFreeCallEnabled ? 0 : (settingJSON.loginBonus ? settingJSON.loginBonus : 5000);

      const newUser = new User();
      newUser.firebaseUid = uid;
      newUser.provider = provider;
      newUser.coin = bonusCoins;
      newUser.freeCallCount = settingJSON.isFreeCallEnabled ? (settingJSON.freeCallLimit || 5) : 0;
      newUser.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

      const user = await userFunction(newUser, req);

      // ✅ Pehle response bhejo
      res.status(200).json({
        status: true,
        message: "A new user has registered an account.",
        signUp: true,
        user: {
          _id: user._id,
          loginType: user.loginType,
          name: user.name,
          image: user.image,
          fcmToken: user.fcmToken,
          lastlogin: user.lastlogin,
        },
      });

      // ✅ Baaki sab background mein — alag try-catch
      try {
        const firebaseAdmin = await getFirebaseAdmin();

        const uniqueId = await generateHistoryUniqueId();
        await History.create({
          uniqueId: uniqueId,
          userId: newUser._id,
          userCoin: bonusCoins,
          type: 1,
          date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
        });

        // ✅ Login bonus FCM
        if (user?.fcmToken) {
          const payload = {
            token: user.fcmToken,
            data: {
              title: "🚀 Instant Bonus Activated! 🎁",
              body: "🎊 Hooray! You've unlocked a special welcome reward just for joining us. Enjoy your bonus! 💰",
              type: "LOGINBONUS",
            },
          };
          firebaseAdmin.messaging().send(payload)
            .then((r) => console.log("FCM sent:", r))
            .catch((e) => console.log("FCM error:", e));
        }

        // ✅ Host fake messages
        const [hosts, latestMessageDoc] = await Promise.all([
          Host.find({ video: { $ne: [] } }).sort({ createdAt: -1 }).limit(5),
          Message.findOne().sort({ createdAt: -1 }).lean(),
        ]);

        const fallbackMessages = [
          "Hey there! 👋",
          "How's your day going? 😊",
          "Wanna chat? 💬",
          "You look amazing today! ✨",
          "Let's talk! 💖",
          "Hope you're having a great time! 🌟",
          "What's your favorite movie? 🎬",
          "I'd love to get to know you better! 😄",
        ];

        for (const host of hosts) {
          const chatTopic = await ChatTopic.findOne({
            $or: [
              { senderId: host._id, receiverId: user._id },
              { senderId: user._id, receiverId: host._id },
            ],
          });

          const messages = latestMessageDoc?.message?.length > 0 ? latestMessageDoc.message : fallbackMessages;
          const randomMessage = messages[Math.floor(Math.random() * messages.length)];
          const messageType = Math.random() < 0.5 ? 1 : 2;

          let imageUrl = "";
          if (messageType === 2) {
            const images = Array.isArray(host.image) ? host.image : [host.image];
            if (images.length > 0) {
              imageUrl = images[Math.floor(Math.random() * images.length)];
            }
          }

          let chat;
          if (chatTopic) {
            chat = new Chat({
              chatTopicId: chatTopic._id,
              senderId: host._id,
              messageType,
              message: messageType === 2 ? "📸 Image" : randomMessage,
              image: messageType === 2 ? imageUrl : "",
              date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
            });
            chatTopic.chatId = chat._id;
            await Promise.all([chat.save(), chatTopic.save()]);
          } else {
            const newChatTopic = new ChatTopic({
              senderId: host._id,
              receiverId: user._id,
            });
            chat = new Chat({
              chatTopicId: newChatTopic._id,
              senderId: host._id,
              messageType,
              message: messageType === 2 ? "📸 Image" : randomMessage,
              image: messageType === 2 ? imageUrl : "",
              date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
            });
            newChatTopic.chatId = chat._id;
            await Promise.all([newChatTopic.save(), chat.save()]);
          }

          // ✅ Host chat FCM
          if (user?.fcmToken) {
            const payload = {
              token: user.fcmToken,
              data: {
                title: `${host.name} sent you a message 📩`,
                body: `🗨️ ${chat.message}`,
                type: "CHAT",
                senderId: String(host._id),
                isFake: String(host.isFake),
                receiverId: String(user._id),
                userName: String(host.name),
                hostName: String(user.name),
                userImage: String(host.image || ""),
                hostImage: String(user.image || ""),
                senderRole: "host",
                isFakeSender: String(host.isFake || "false"),
              },
            };
            firebaseAdmin.messaging().send(payload).catch(console.error);
          }
        }

      } catch (bgError) {
        // ✅ Response already sent hai — yahan res mat use karo
        console.error("Background task error:", bgError);
      }
    }

  } catch (error) {
    if (req.file) deleteFile(req.file);
    console.error("Error:", error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

const Otp = require("../../models/otp.model");

exports.sendOtp = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    if (!mobileNumber) {
      return res.status(400).json({
        status: false,
        message: "Mobile number is required",
      });
    }

    // Generate 6 digit OTP
    // const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp = "1234";
    console.log("🔹 [OTP] Generated OTP:", otp, "for mobile:", mobileNumber);

    // Delete previous OTP for this number
    await Otp.deleteMany({ mobileNumber });

    // Save new OTP (5 min expiry)
    await Otp.create({
      mobileNumber,
      otp,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    // TODO: Integrate SMS provider (MSG91 / Twilio)
    console.log("OTP:", otp);

    return res.status(200).json({
      status: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const jwt = require("jsonwebtoken");

exports.verifyOtp = async (req, res) => {
  try {
    const { mobileNumber, otp, fcmToken } = req.body;
    const { uid, provider } = req.user;

    if (!mobileNumber || !otp) {
      console.warn("⚠️ [OTP] Missing mobileNumber or OTP in request body:", req.body);
      return res.status(400).json({
        status: false,
        message: "Mobile number and OTP are required",
      });
    }

    console.log(`🔹 [OTP] Verifying OTP: ${otp} for mobile: ${mobileNumber}`);

    // ✅ Check OTP
    const otpData = await Otp.findOne({ mobileNumber, otp });
    if (!otpData) {
      console.warn(`❌ [OTP] Verification failed. No matching OTP found in DB for ${mobileNumber} with OTP ${otp}`);
      return res.status(400).json({
        status: false,
        message: "Invalid or expired OTP",
      });
    }
    console.log("✅ [OTP] OTP successfully matched.");

    // ✅ Delete OTP after verification
    await Otp.deleteMany({ mobileNumber });

    // 🔎 Check user by mobile OR firebase UID
    let user = await User.findOne({
      $or: [{ mobileNumber }, { firebaseUid: uid }],
    }).select(
      "_id loginType name image fcmToken lastlogin isBlock isHost hostId",
    );

    let isNewUser = false;

    // =====================================================
    // ✅ IF USER EXISTS → LOGIN
    // =====================================================
    if (user) {
      console.log("✅ User already exists, logging in...");

      if (user.isBlock) {
        return res.status(403).json({
          status: false,
          message: "🚷 User is blocked by admin.",
        });
      }

      if (user.isHost && user.hostId) {
        const host = await Host.findById(user.hostId).select(
          "isBlock fcmToken",
        );

        if (!host) {
          console.warn(`⚠️ No Host found with ID: ${user.hostId}`);
        } else {
          if (host.isBlock) {
            return res
              .status(403)
              .json({
                status: false,
                message: "🚷 Host account is blocked by the admin.",
              });
          }

          host.fcmToken = fcmToken || host.fcmToken;
          await host.save();
        }
      }

      // Update user details
      user.mobileNumber = mobileNumber;
      user.firebaseUid = uid;
      user.provider = provider;
      user.fcmToken = fcmToken || user.fcmToken;
      user.lastlogin = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      });

      await user.save();
    }

    // =====================================================
    // 🆕 IF USER DOES NOT EXIST → REGISTER
    // =====================================================
    else {
      console.log("🆕 Registering new user...");

      isNewUser = true;

      const bonusCoins = settingJSON.isFreeCallEnabled ? 0 : (settingJSON.loginBonus || 5000);

      const newUser = new User({
        mobileNumber,
        firebaseUid: uid,
        provider,
        coin: bonusCoins,
        freeCallCount: settingJSON.isFreeCallEnabled ? (settingJSON.freeCallLimit || 5) : 0,
        fcmToken,
        lastlogin: new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        }),
        date: new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        }),
      });

      user = await newUser.save();

      // 🎁 Create bonus history
      const uniqueId = await generateHistoryUniqueId();

      await History.create({
        uniqueId,
        userId: user._id,
        userCoin: bonusCoins,
        type: 1,
        date: new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        }),
      });

      newUser.uniqueId = uniqueId;
      await newUser.save();

      if (user?.fcmToken) {
        const payload = {
          token: user.fcmToken,
          data: {
            title: "🚀 Instant Bonus Activated! 🎁",
            body: "🎊 Hooray! You've unlocked a special welcome reward just for joining us. Enjoy your bonus! 💰",
            type: "LOGINBONUS",
          },
        };

        const firebaseAdmin = await getFirebaseAdmin();
        firebaseAdmin
          .messaging()
          .send(payload)
          .then((response) => {
            console.log("Successfully sent with response: ", response);
          })
          .catch((error) => {
            console.log("Error sending message: ", error);
          });
      }

      //✅ Send random messages from 4 hosts
      const [hosts, latestMessageDoc] = await Promise.all([
        Host.find({ video: { $ne: [] } })
          .sort({ createdAt: -1 })
          .limit(5),
        Message.findOne().sort({ createdAt: -1 }).lean(),
      ]);

      const fallbackMessages = [
        "Hey there! 👋",
        "How's your day going? 😊",
        "Wanna chat? 💬",
        "You look amazing today! ✨",
        "Let's talk! 💖",
        "Hope you're having a great time! 🌟",
        "What's your favorite movie? 🎬",
        "I’d love to get to know you better! 😄",
      ];

      for (const host of hosts) {
        const chatTopic = await ChatTopic.findOne({
          $or: [
            { senderId: host._id, receiverId: user._id },
            { senderId: user._id, receiverId: host._id },
          ],
        });

        const messages =
          latestMessageDoc?.message?.length > 0
            ? latestMessageDoc.message
            : fallbackMessages;
        const randomMessage =
          messages[Math.floor(Math.random() * messages.length)];
        const messageType = Math.random() < 0.5 ? 1 : 2;

        let imageUrl = "";
        if (messageType === 2) {
          const images = Array.isArray(host.image) ? host.image : [host.image];
          if (images.length > 0) {
            const index = Math.floor(Math.random() * images.length);
            imageUrl = images[index];
          }
        }

        let chat;
        if (chatTopic) {
          chat = new Chat({
            chatTopicId: chatTopic._id,
            senderId: host._id,
            messageType,
            message: messageType === 2 ? "📸 Image" : randomMessage,
            image: messageType === 2 ? imageUrl : "",
            date: new Date().toLocaleString("en-US", {
              timeZone: "Asia/Kolkata",
            }),
          });
          chatTopic.chatId = chat._id;
          await Promise.all([chat.save(), chatTopic.save()]);
        } else {
          const newChatTopic = new ChatTopic({
            senderId: host._id,
            receiverId: user._id,
          });

          chat = new Chat({
            chatTopicId: newChatTopic._id,
            senderId: host._id,
            messageType,
            message: messageType === 2 ? "📸 Image" : randomMessage,
            image: messageType === 2 ? imageUrl : "",
            date: new Date().toLocaleString("en-US", {
              timeZone: "Asia/Kolkata",
            }),
          });

          newChatTopic.chatId = chat._id;
          await Promise.all([newChatTopic.save(), chat.save()]);
        }

        if (user && user.fcmToken && user.fcmToken !== null) {
          const payload = {
            token: user.fcmToken,
            data: {
              title: `${host.name} sent you a message 📩`,
              body: `🗨️ ${chat.message}`,
              type: "CHAT",
              senderId: String(host._id),
              isFake: String(host.isFake),
              receiverId: String(user._id),
              userName: String(host.name),
              hostName: String(user.name),
              userImage: String(host.image || ""),
              hostImage: String(user.image || ""),
              senderRole: "host",
              isFakeSender: String(host.isFake || "false"),
            },
          };

          const adminInstance = await admin;
          adminInstance.messaging().send(payload).catch(console.error);
        }
      }
    }

    // =====================================================
    // 🎤 HOST CHECK
    // =====================================================
    let hostData = null;

    if (user.isHost && user.hostId) {
      const host = await Host.findById(user.hostId);

      if (host) {
        if (host.isBlock) {
          return res.status(403).json({
            status: false,
            message: "🚷 Host account is blocked.",
          });
        }

        host.fcmToken = fcmToken || host.fcmToken;
        await host.save();

        hostData = host;
      }
    }

    // =====================================================
    // 🔐 GENERATE JWT
    // =====================================================
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      status: true,
      message: isNewUser ? "User registered successfully" : "Login successful",
      signUp: isNewUser,
      token,
      user,
      host: hostData,
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

//update profile of the user
exports.modifyUserProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res
        .status(401)
        .json({
          status: false,
          message: "Unauthorized access. Invalid token.",
        });
    }

    res
      .status(200)
      .json({ status: true, message: "The user's profile has been modified." });

    const userId = new mongoose.Types.ObjectId(req.user.userId);

    const [user] = await Promise.all([User.findOne({ _id: userId })]);

    if (req?.file) {
      const image = user?.image?.split("storage");
      if (image) {
        const imagePath = "storage" + image[1];
        if (fs.existsSync(imagePath)) {
          const imageName = imagePath?.split("/")?.pop();
          if (imageName !== "male.png" && imageName !== "female.png") {
            fs.unlinkSync(imagePath);
          }
        }
      }

      user.image = req?.file?.path;
    }

    user.name = req.body.name ? req.body.name : user.name;
    user.selfIntro = req.body.selfIntro ? req.body.selfIntro : user.selfIntro;
    user.gender = req.body.gender
      ? req.body.gender?.toLowerCase()?.trim()
      : user.gender;
    user.bio = req.body.bio ? req.body.bio : user.bio;
    user.dob = req.body.dob ? req.body.dob.trim() : user.dob;
    user.age = req.body.age ? req.body.age : user.age;
    user.countryFlagImage = req.body.countryFlagImage
      ? req.body.countryFlagImage
      : user.countryFlagImage;
    user.country = req.body.country
      ? req.body.country.toLowerCase()?.trim()
      : user.country;
    await user.save();
  } catch (error) {
    if (req.file) deleteFile(req.file);
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get user profile
exports.retrieveUserProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res
        .status(401)
        .json({
          status: false,
          message: "Unauthorized access. Invalid token.",
        });
    }

    const userId = new mongoose.Types.ObjectId(req.user.userId);

    const [user, hostRequest, totalFollowers, totalFollowing] = await Promise.all([
      User.findOne({ _id: userId }).lean(),
      Host.findOne({ userId }).select("status").lean(),
      FollowerFollowing.countDocuments({ followingId: userId }),   // kitne log mujhe follow karte hain
      FollowerFollowing.countDocuments({ followerId: userId }),    // main kitno ko follow karta hoon
    ]);

    const hasHostRequest = !!hostRequest;
    user["id"] = user._id;

    const topUp = await History.find({ userId, type: { $in: [7, 8, 14, 16] } })
      .sort({ date: -1 })
      .select("userCoin")
      .lean();
    const balance = await History.find({ userId, type: { $in: [1, 6] } })
      .sort({ date: -1 })
      .select("userCoin")
      .lean();
    const topUpTotal = topUp.reduce(
      (sum, item) => sum + (item.userCoin || 0),
      0,
    );
    const balanceTotal = balance.reduce(
      (sum, item) => sum + (item.userCoin || 0),
      0,
    );

    let privileges = null;
    if (user.isVip && user.vipPlanEndDate && new Date(user.vipPlanEndDate) > new Date()) {
      privileges = await VipPlanPrivilege.findOne({ level: user.vipLevel }).lean();
    }

    res.status(200).json({
      status: true,
      message: "The user has retrieved their profile.",
      user: { ...user, privileges },
      hasHostRequest,
      topUpTotal,
      balanceTotal,
      totalFollowers,   // kitne log mujhe follow karte hain
      totalFollowing,   // main kitno ko follow karta hoon
    });

    if (
      user.isVip &&
      user.vipPlanId !== null &&
      user.vipPlanStartDate !== null &&
      user.vipPlanEndDate !== null
    ) {
      const validity = user.vipPlan.validity;
      const validityType = user.vipPlan.validityType;
      validatePlanExpiration(user, validity, validityType);
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//delete user
exports.deactivateMyAccount = async (req, res) => {
  try {
    const userUid = req.headers["x-user-uid"];
    if (!userUid) {
      console.warn("⚠️ [AUTH] User UID.");
      return res
        .status(401)
        .json({
          status: false,
          message: "User UID required for authentication.",
        });
    }

    const user = await User.findOne({ firebaseUid: userUid }).lean();
    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: "User not found." });
    }

    res.status(200).json({
      status: true,
      message: "User and related data successfully deleted.",
    });

    if (user.isHost && user.hostId !== null) {
      const host = await Host.findById(user.hostId)
        .select("_id image photoGallery video liveVideo")
        .lean();
      if (host) {
        deleteFileIfExists(host?.image);

        if (Array.isArray(host.photoGallery)) {
          for (const imgPath of host.photoGallery) {
            deleteFileIfExists(imgPath);
          }
        }

        if (Array.isArray(host.video)) {
          for (const imgPath of host.video) {
            deleteFileIfExists(imgPath);
          }
        }

        if (Array.isArray(host.liveVideo)) {
          for (const imgPath of host.liveVideo) {
            deleteFileIfExists(imgPath);
          }
        }

        await LiveBroadcastHistory.deleteMany({ hostId: host?._id });
        await Host.deleteOne({ _id: host?._id });
      }
    }

    if (user?.image) {
      const image = user?.image?.split("storage");
      if (image) {
        const imagePath = "storage" + image[1];
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log(`Deleted user image: ${imagePath}`);
        }
      }
    }

    const [chats] = await Promise.all([Chat.find({ senderId: user?._id })]);

    for (const chat of chats) {
      deleteFileIfExists(chat?.image);
      deleteFileIfExists(chat?.audio);
    }

    await Promise.all([
      ChatTopic.deleteMany({
        $or: [{ senderId: user?._id }, { receiverId: user?._id }],
      }),
      Chat.deleteMany({ senderId: user?._id }),
      Block.deleteMany({ userId: user?._id }),
      CheckIn.deleteMany({ userId: user?._id }),
      History.deleteMany({ userId: user?._id }),
      HostMatchHistory.deleteMany({ userId: user?._id }),
      LiveBroadcaster.deleteMany({ userId: user?._id }),
      LiveBroadcastView.deleteMany({ userId: user?._id }),
      User.deleteOne({ _id: user._id }),
    ]);

    if (user.firebaseUid) {
      try {
        const adminPromise = await admin;
        adminPromise.auth().deleteUser(user.firebaseUid);
        console.log(`✅ Firebase user deleted: ${user.firebaseUid}`);
      } catch (err) {
        console.error(
          `❌ Failed to delete Firebase user ${user.firebaseUid}:`,
          err.message,
        );
      }
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({
        status: false,
        message: error.message || "Internal Server Error",
      });
  }
};

//common profile retrieval ( Host ya User dono ke liye )
exports.retrieveProfileDetails = async (req, res) => {
  try {
    const { profileId } = req.query;

    if (!profileId || !mongoose.Types.ObjectId.isValid(profileId)) {
      return res.status(200).json({ status: false, message: "Valid profileId is required." });
    }

    const viewerId = req.user ? new mongoose.Types.ObjectId(req.user.userId) : null;
    const targetId = new mongoose.Types.ObjectId(profileId);

    // 1. Sabse pehle User collection mein search karo
    let user = await User.findOne({ _id: targetId, isBlock: false })
      .select("name gender bio identity language image coin isVip vipLevel country countryFlagImage mobileNumber uniqueId selfIntro isHost hostId")
      .lean();

    if (!user) {
      return res.status(200).json({ status: false, message: "Profile not found or blocked." });
    }

    let target = user;
    let profileType = "User";

    // 2. Agar isHost true hai, toh Host ka sara data fetch karo
    if (user.isHost && user.hostId) {
      const hostData = await Host.findOne({ _id: user.hostId, isBlock: false })
        .select("name email gender dob bio uniqueId countryFlagImage country impression language image photoGallery profileVideo randomCallRate randomCallFemaleRate randomCallMaleRate privateCallRate audioCallRate chatRate coin isFake video liveVideo userId")
        .lean();

      if (hostData) {
        target = hostData;
        profileType = "Host";
      }
    }

    // 3. Follow Counts & Status
    const [totalFollower, totalFollowing, isFollowing] = await Promise.all([
      FollowerFollowing.countDocuments({ followingId: targetId }),
      FollowerFollowing.countDocuments({ followerId: targetId }),
      viewerId ? FollowerFollowing.exists({ followerId: viewerId, followingId: targetId }) : false
    ]);

    target.totalFollower = totalFollower;
    target.totalFollowing = totalFollowing;
    target.isFollowing = !!isFollowing;
    target.profileType = profileType;

    // 4. Agar Host hai toh Gifts bhi show karo
    let receivedGifts = [];
    if (profileType === "Host") {
      receivedGifts = await History.aggregate([
        { $match: { hostId: targetId, giftId: { $ne: null } } },
        {
          $group: {
            _id: "$giftId",
            totalReceived: { $sum: "$giftCount" },
            lastReceivedAt: { $max: "$createdAt" },
            giftCoin: { $first: "$giftCoin" },
            giftImage: { $first: "$giftImage" },
            giftType: { $first: "$giftType" },
          },
        },
        { $limit: 10 } // Latest few gifts
      ]);
    }

    return res.status(200).json({
      status: true,
      message: `${profileType} profile retrieved successfully.`,
      profile: target,
      receivedGifts: profileType === "Host" ? receivedGifts : []
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
