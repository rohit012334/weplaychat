const LiveBroadcaster = require("../../models/liveBroadcaster.model");

//import model
const Host = require("../../models/host.model");
const LiveBroadcastHistory = require("../../models/liveBroadcastHistory.model");
const LiveBroadcastView = require("../../models/liveBroadcastView.model");
const FollowerFollowing = require("../../models/followerFollowing.model");
const User = require("../../models/user.model");

//private key
const admin = require("../../util/privateKey");

//momemt
const moment = require("moment-timezone");

//mongoose
const mongoose = require("mongoose");

//RtcTokenBuilder
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

//live host
exports.HostStreaming = async (req, res) => {
  try {
    const { hostId, channel, agoraUID } = req.query;

    if (!hostId || !channel || !agoraUID) {
      return res.status(200).json({ status: false, message: "Invalid request parameters." });
    }

    if (!settingJSON) {
      return res.status(200).json({ status: false, message: "Setting not found." });
    }

    const idObjectId = new mongoose.Types.ObjectId(hostId);
    let host = null;

    // 1. Check in User table first
    const user = await User.findById(idObjectId).select("isHost hostId").lean();

    if (user) {
      if (user.isHost && user.hostId) {
        // User is a host, use their hostId
        host = await Host.findById(user.hostId).select("userId name gender image countryFlagImage country isFake isBlock").lean();
      } else {
        return res.status(200).json({ status: false, message: "You are not a host." });
      }
    } else {
      // 2. User not found, search in Host table directly
      host = await Host.findById(idObjectId).select("userId name gender image countryFlagImage country isFake isBlock").lean();
    }

    if (!host) {
      return res.status(200).json({ status: false, message: "Host context not found." });
    }

    const hostObjectId = host._id;

    const role = RtcRole.PUBLISHER;
    const uid = 0;
    const expirationTimeInSeconds = 24 * 3600;
    const privilegeExpiredTs = Math.floor(Date.now() / 1000) + expirationTimeInSeconds;

    console.log("🔹 [HostStreaming] Generating Agora Token:");
    console.log("   - AppId:", global.settingJSON?.agoraAppId);
    console.log("   - Certificate:", global.settingJSON?.agoraAppCertificate);
    console.log("   - Channel:", channel);
    console.log("   - UID:", uid);

    const [token] = await Promise.all([
      RtcTokenBuilder.buildTokenWithUid(global.settingJSON.agoraAppId, global.settingJSON.agoraAppCertificate, channel, uid, role, privilegeExpiredTs),
      LiveBroadcaster.deleteOne({ hostId: hostObjectId }),
    ]);

    if (host.isBlock) {
      return res.status(200).json({ status: false, message: "You are blocked by the admin." });
    }

    const liveHistory = new LiveBroadcastHistory({
      hostId: host._id,
      startTime: moment().tz("Asia/Kolkata").format(),
    });

    const liveBroadcaster = new LiveBroadcaster({
      liveHistoryId: liveHistory._id,
      hostId: host._id,
      userId: host.userId,
      name: host.name,
      gender: host.gender,
      image: host.image,
      countryFlagImage: host.countryFlagImage,
      country: host.country,
      isFake: host.isFake,
      agoraUid: agoraUID,
      channel: channel,
      token: token,
    });

    await Promise.all([
      liveHistory.save(),
      liveBroadcaster.save(),
      Host.updateOne(
        { _id: hostObjectId },
        {
          $set: {
            isOnline: true,
            isBusy: true,
            isLive: true,
            liveHistoryId: liveHistory._id,
            agoraUid: agoraUID,
            channel: channel,
            token: token,
          },
        }
      ),
    ]);

    res.status(200).json({
      status: true,
      message: "Live started successfully by the host.",
      data: liveBroadcaster,
    });

    const followers = await FollowerFollowing.find({ followingId: hostObjectId, followingModel: "Host" }).distinct("followerId");

    if (followers.length > 0) {
      const followerTokens = await User.find({
        _id: { $in: followers },
        isBlock: false,
        fcmToken: { $ne: null },
      }).distinct("fcmToken");

      if (followerTokens.length === 0) {
        console.log("No valid FCM tokens found.");
      } else {
        const titleOptions = ["🌟 Your favorite host just went live!", "🚨 A live session is happening now!", "🎬 Go live with the host now!", "🔥 Don’t miss this live show!"];

        const bodyOptions = [
          "🎉 Jump into the action and support your host live!",
          "💬 Interact and enjoy the moment. Live now!",
          "📺 It’s showtime! Watch your host live!",
          "✨ Be part of the live journey. Join now!",
        ];

        const title = titleOptions[Math.floor(Math.random() * titleOptions.length)];
        const body = bodyOptions[Math.floor(Math.random() * bodyOptions.length)];

        const payload = {
          tokens: followerTokens,
          data: {
            title,
            body,
            type: "LIVE",
            hostId: host._id.toString(),
            liveHistoryId: liveHistory._id.toString(),
            name: host.name.toString(),
            image: host.image.toString(),
            agoraUid: agoraUID.toString(),
            channel: channel.toString(),
            token: token.toString(),
          },
        };

        const firebaseApp = await admin();
        firebaseApp
          .messaging()
          .sendEachForMulticast(payload)
          .then((response) => {
            console.log("Notification sent:", response.successCount, "successes");
            if (response.failureCount > 0) {
              response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                  console.error(`Token ${followerTokens[idx]} failed:`, resp.error.message);
                }
              });
            }
          })
          .catch((error) => {
            console.error("FCM Error:", error);
          });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};


exports.endLive = async (req, res) => {
  try {
    const { hostId, liveHistoryId } = req.body;

    if (!hostId || !liveHistoryId) {
      return res.status(400).json({
        status: false,
        message: "hostId and liveHistoryId required",
      });
    }

    // 1️⃣ Fetch required records
    const [host, liveHistory, liveBroadcaster] = await Promise.all([
      Host.findById(hostId),
      LiveBroadcastHistory.findById(liveHistoryId),
      LiveBroadcaster.findOne({ hostId, liveHistoryId }),
    ]);

    if (!host || !liveHistory || !liveBroadcaster) {
      return res.json({
        status: false,
        message: "Live not found or already ended",
      });
    }

    if (!host.isLive) {
      return res.json({
        status: false,
        message: "Host is not live",
      });
    }

    // 2️⃣ Calculate duration
    const endTime = moment().tz("Asia/Kolkata");
    const startTime = moment(liveHistory.startTime);
    const durationSeconds = endTime.diff(startTime, "seconds");
    const formattedDuration = moment
      .utc(durationSeconds * 1000)
      .format("HH:mm:ss");

    // 3️⃣ Collect Stats
    const totalCoins = liveHistory.coins || 0;
    const totalGifts = liveHistory.gifts || 0;
    const totalComments = liveHistory.liveComments || 0;
    const totalViewers = liveHistory.audienceCount || 0;
    const totalShares = liveHistory.shareCount || 0;

    const coinValue = 0.01; // adjust according to business logic
    const revenue = totalCoins * coinValue;

    // 4️⃣ Update DB
    await Promise.all([
      LiveBroadcastHistory.updateOne(
        { _id: liveHistoryId },
        {
          $set: {
            endTime: endTime.toDate(),
            duration: formattedDuration,
          },
        }
      ),
      Host.updateOne(
        { _id: hostId },
        {
          $set: {
            isLive: false,
            isBusy: false,
            liveHistoryId: null,
          },
        }
      ),
      LiveBroadcaster.deleteOne({ hostId, liveHistoryId }),
      LiveBroadcastView.deleteMany({ liveHistoryId }),
    ]);

    // 5️⃣ Return stats to app
    return res.json({
      status: true,
      data: {
        duration: formattedDuration,
        totalViewers,
        totalGifts,
        totalCoins,
        revenue,
        totalComments,
        totalShares,
      },
    });
  } catch (error) {
    console.error("End Live Error:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};
