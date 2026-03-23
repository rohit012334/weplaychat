# WePlayChat API Documentation (V3)

**Base URL:** `http://localhost:8000/api`

### POST `/api/admin/createAgency`
- **Body**: `email, commissionType, commission, password, countryCode, mobileNumber, description, countryFlagImage, country, uid`
- **Query**: `start, limit, search, startDate, endDate`

### PATCH `/api/admin/updateAgency`
- **Body**: `name, email, commissionType, commission, password, countryCode, mobileNumber, description, countryFlagImage, country, uid`
- **Query**: `start, limit, search, startDate, endDate`

### PATCH `/api/admin/toggleAgencyBlockStatus`
- **Query**: `start, limit, search, startDate, endDate`

### GET `/api/admin/getAgencies`
- **Query**: `start, limit, search, startDate, endDate`

### DELETE `/api/admin/deleteAgency`

### GET `/api/admin/getActiveAgenciesList`

### POST `/api/admin/background/createBackground`
- **Body**: `type`
- **Query**: `start, limit, backgroundId`

### PATCH `/api/admin/background/updateBackground`
- **Body**: `type`
- **Query**: `start, limit, backgroundId`

### GET `/api/admin/background/listBackgrounds`
- **Query**: `start, limit, backgroundId`

### DELETE `/api/admin/background/deleteBackground`
- **Query**: `backgroundId`

### PATCH `/api/admin/background/updateBackgroundStatus`
- **Query**: `backgroundId`

### GET `/api/admin/block/listBlockedHostsForUser`
- **Query**: `userId, start, limit, hostId`

### GET `/api/admin/block/listBlockedUsersForHost`
- **Query**: `hostId, start, limit`

### POST `/api/admin/coinPlan/createCoinPlan`
- **Body**: `bonusCoins, price, iconUrl, productId, coins`
- **Query**: `field, start, limit, userId`

### PATCH `/api/admin/coinPlan/modifyCoinPlan`
- **Body**: `coins, bonusCoins, price, iconUrl, productId`
- **Query**: `field, start, limit, userId`

### PATCH `/api/admin/coinPlan/toggleCoinPlanStatus`
- **Query**: `field, start, limit, userId`

### DELETE `/api/admin/coinPlan/removeCoinPlan`
- **Query**: `start, limit, userId`

### GET `/api/admin/coinPlan/fetchCoinPlans`
- **Query**: `start, limit, userId`

### GET `/api/admin/coinPlan/retrieveUserPurchaseRecords`
- **Query**: `start, limit, userId`

### POST `/api/admin/currency/createCurrency`
- **Body**: `name, symbol, countryCode, currencyCode, currencyId`
- **Query**: `currencyId`

### PATCH `/api/admin/currency/updateCurrency`
- **Body**: `currencyId, name, symbol, countryCode, currencyCode`
- **Query**: `currencyId`

### GET `/api/admin/currency/fetchCurrencyData`
- **Query**: `currencyId`

### DELETE `/api/admin/currency/destroyCurrency`
- **Query**: `currencyId`

### PATCH `/api/admin/currency/setdefaultCurrency`
- **Query**: `currencyId`

### GET `/api/admin/currency/getDefaultCurrency`

### POST `/api/admin/dailyRewardCoin/createDailyReward`
- **Body**: `dailyRewardCoin, dailyRewardCoinId`
- **Query**: `dailyRewardCoinId`

### PATCH `/api/admin/dailyRewardCoin/modifyDailyReward`
- **Body**: `dailyRewardCoinId, dailyRewardCoin`
- **Query**: `dailyRewardCoinId`

### GET `/api/admin/dailyRewardCoin/fetchDailyReward`
- **Query**: `dailyRewardCoinId`

### DELETE `/api/admin/dailyRewardCoin/removeDailyReward`
- **Query**: `dailyRewardCoinId`

### GET `/api/admin/dashboard/fetchDashboardMetrics`
- **Query**: `startDate, endDate, type`

### GET `/api/admin/dashboard/retrieveChartStats`
- **Query**: `type, startDate, endDate`

### GET `/api/admin/dashboard/getNewUsers`
- **Query**: `startDate, endDate`

### GET `/api/admin/dashboard/getTopPerformingAgencies`
- **Query**: `startDate, endDate`

### GET `/api/admin/dashboard/getTopPerformingHosts`
- **Query**: `startDate, endDate`

### GET `/api/admin/dashboard/fetchTopSpenders`
- **Query**: `startDate, endDate`

### GET `/api/admin/entry/listEntries`
- **Query**: `start, limit`

### DELETE `/api/admin/entry/deleteEntry`

### PATCH `/api/admin/entry/updateEntryStatus`

### POST `/api/admin/entryTag/create`
- **Body**: `type`
- **Query**: `start, limit, entryTagId`

### PATCH `/api/admin/entryTag/update`
- **Body**: `type`
- **Query**: `start, limit, entryTagId`

### GET `/api/admin/entryTag/list`
- **Query**: `start, limit, entryTagId`

### DELETE `/api/admin/entryTag/delete`
- **Query**: `entryTagId`

### PATCH `/api/admin/entryTag/updateStatus`
- **Query**: `entryTagId`

### GET `/api/admin/event/listEvents`
- **Query**: `start, limit`

### DELETE `/api/admin/event/deleteEvent`

### PATCH `/api/admin/event/updateEventStatus`

### GET `/api/admin/followerFollowing/fetchFollowing`
- **Query**: `userId, start, limit, hostId`

### GET `/api/admin/followerFollowing/fetchFollowers`
- **Query**: `hostId, start, limit`

### GET `/api/admin/frame/listFrames`
- **Query**: `start, limit`

### DELETE `/api/admin/frame/deleteFrame`

### PATCH `/api/admin/frame/updateFrameStatus`

### GET `/api/admin/gift/retrieveGifts`

### DELETE `/api/admin/gift/discardGift`

### POST `/api/admin/giftCategory/createGiftCategory`
- **Query**: `start, limit`

### PATCH `/api/admin/giftCategory/updateGiftCategory`
- **Query**: `name, start, limit`

### GET `/api/admin/giftCategory/getAllGiftCategories`
- **Query**: `start, limit`

### GET `/api/admin/giftCategory/listGiftCategories`

### DELETE `/api/admin/giftCategory/deleteGiftCategory`

### GET `/api/admin/history/getCoinTransactionHistory`
- **Query**: `userId, start, limit, startDate, endDate`

### GET `/api/admin/history/fetchCallTransactionHistory`
- **Query**: `userId, start, limit, startDate, endDate`

### GET `/api/admin/history/retrieveGiftTransactionHistory`
- **Query**: `userId, start, limit, startDate, endDate`

### GET `/api/admin/history/getVIPPlanTransactionHistory`
- **Query**: `userId, start, limit, startDate, endDate, hostId`

### GET `/api/admin/history/fetchCoinPlanTransactionHistory`
- **Query**: `userId, start, limit, hostId, startDate, endDate`

### GET `/api/admin/history/fetchCoinTransactionHistory`
- **Query**: `hostId, start, limit, startDate, endDate`

### GET `/api/admin/history/listCallTransactions`
- **Query**: `hostId, start, limit, startDate, endDate`

### GET `/api/admin/history/fetchGiftTransactionHistory`
- **Query**: `hostId, start, limit, startDate, endDate`

### GET `/api/admin/host/fetchHostRequest`
- **Query**: `requestId, userId, status, reason, start, limit`

### PATCH `/api/admin/host/handleHostRequest`
- **Query**: `requestId, userId, status, reason, agencyId`

### PATCH `/api/admin/host/assignHostToAgency`
- **Body**: `bio, dob, gender, countryFlagImage, country, language, impression, email`
- **Query**: `agencyId, userId, start, limit, search, startDate, endDate`

### GET `/api/admin/host/listAgencyHosts`
- **Body**: `bio, dob, gender, countryFlagImage, country, language, impression, email`
- **Query**: `agencyId, start, limit, search, startDate, endDate`

### PATCH `/api/admin/host/toggleHostStatusByType`
- **Query**: `type, start, limit, search, startDate, endDate`

### GET `/api/admin/host/fetchHostProfile`
- **Query**: `type, start, limit, search, startDate, endDate`

### GET `/api/admin/host/fetchHostList`
- **Query**: `type, start, limit, search, startDate, endDate`

### DELETE `/api/admin/host/deleteHost`

### POST `/api/admin/identityProof/createIdentityProof`
- **Query**: `title, identityProofId`

### PATCH `/api/admin/identityProof/updateIdentityProof`
- **Query**: `identityProofId, title`

### GET `/api/admin/identityProof/getIdentityProofs`
- **Query**: `identityProofId`

### DELETE `/api/admin/identityProof/deleteIdentityProof`
- **Query**: `identityProofId`

### POST `/api/admin/impression/createImpression`
- **Query**: `name, impressionId, start, limit`

### PATCH `/api/admin/impression/updateImpression`
- **Query**: `impressionId, name, start, limit`

### GET `/api/admin/impression/getImpressions`
- **Query**: `start, limit, impressionId`

### GET `/api/admin/impression/fetchAdImpressionMetrics`
- **Query**: `impressionId`

### DELETE `/api/admin/impression/deleteImpression`
- **Query**: `impressionId`

### GET `/api/admin/liveBroadcastHistory/fetchLiveHistory`
- **Query**: `hostId, start, limit, startDate, endDate`

### GET `/api/admin/login/`

### POST `/api/admin/manager/validateManagerLogin`
- **Body**: `password`

### GET `/api/admin/manager/getList`

### GET `/api/admin/manager/getById/:id`

### DELETE `/api/admin/manager/deleteManager/:id`

### PUT `/api/admin/manager/updatePasswordById/:id`

### POST `/api/admin/message/insertMessage`
- **Body**: `message`
- **Query**: `genderType`

### PATCH `/api/admin/message/updateMessage`
- **Body**: `message`
- **Query**: `genderType`

### GET `/api/admin/message/fetchMessage`
- **Query**: `genderType`

### POST `/api/admin/notification/sendNotificationToSingleUserByAdmin`
- **Body**: `title, message`

### POST `/api/admin/notification/sendNotificationToSingleHostByAdmin`
- **Body**: `title, message`

### POST `/api/admin/notification/sendNotifications`
- **Body**: `title, message`

### POST `/api/admin/paymentMethod/addPaymentMethod`
- **Body**: `details`

### PATCH `/api/admin/paymentMethod/modifyPaymentMethod`
- **Body**: `name, details`

### PATCH `/api/admin/paymentMethod/updatePaymentMethodStatus`

### GET `/api/admin/paymentMethod/retrievePaymentMethods`

### DELETE `/api/admin/paymentMethod/discardPaymentMethod`

### POST `/api/admin/validateResellerLogin`
- **Body**: `password`
- **Query**: `limit`

### POST `/api/admin/findUser`
- **Query**: `limit`

### POST `/api/admin/recharge`
- **Body**: `amount, notes, password`
- **Query**: `limit`

### GET `/api/admin/rechargeHistory`
- **Body**: `status, password`
- **Query**: `limit`

### GET `/api/admin/rechargeAnalytics`
- **Query**: `startDate, endDate`

### GET `/api/admin/getList`
- **Body**: `name, email, password, mobile, description, countryFlagImage, country`

### GET `/api/admin/getById/:id`
- **Body**: `name, email, password, mobile, description, countryFlagImage, country`
- **Query**: `startDate, endDate`

### DELETE `/api/admin/deleteReseller/:id`
- **Body**: `name, email, password, mobile, description, countryFlagImage, country`
- **Query**: `startDate, endDate`

### PUT `/api/admin/updateReseller/:id`
- **Body**: `name, email, password, mobile, description, countryFlagImage, country`
- **Query**: `startDate, endDate`

### PATCH `/api/admin/setting/updateSetting`
- **Body**: `paystackPublicKey, paystackSecretKey, paypalClientId, paypalSecretKey, cashfreeClientId, cashfreeClientSecret, agoraAppId, agoraAppCertificate, privacyPolicyLink, termsOfUsePolicyLink, stripePublishableKey, stripeSecretKey, razorpayId, razorpaySecretKey, flutterwaveId, loginBonus, adminCommissionRate, minCoinsToConvert, minCoinsForHostPayout, minCoinsForAgencyPayout, maxFreeChatMessages, freeCallLimit, freeCallDuration, privateKey, generalRandomCallRate, femaleRandomCallRate, maleRandomCallRate, videoPrivateCallRate, audioPrivateCallRate, chatInteractionRate`
- **Query**: `settingId, type`

### PATCH `/api/admin/setting/updateSettingToggle`
- **Query**: `settingId, type`

### GET `/api/admin/setting/fetchSettings`

### GET `/api/admin/spinWheel/get`

### PATCH `/api/admin/spinWheel/update`

### PATCH `/api/admin/subadmin/updateSetting`

### PATCH `/api/admin/subadmin/updateSettingToggle`

### GET `/api/admin/subadmin/list`
- **Body**: `coin, action, reason`
- **Query**: `limit`

### PUT `/api/admin/subadmin/update/:id`
- **Body**: `coin, action, reason`
- **Query**: `limit`

### DELETE `/api/admin/subadmin/delete/:id`
- **Body**: `coin, action, reason`
- **Query**: `limit`

### GET `/api/admin/subadmin/getById/:id`
- **Body**: `coin, action, reason`
- **Query**: `limit`

### POST `/api/admin/tag/createTag`
- **Body**: `name`
- **Query**: `start, limit`

### PATCH `/api/admin/tag/updateTag`
- **Body**: `name`
- **Query**: `start, limit`

### GET `/api/admin/tag/listTags`
- **Query**: `start, limit`

### DELETE `/api/admin/tag/deleteTag`

### PATCH `/api/admin/tag/updateTagStatus`

### GET `/api/admin/user/retrieveUserList`
- **Body**: `spins, action`
- **Query**: `start, limit, search, startDate, endDate`

### PATCH `/api/admin/user/modifyUserBlockStatus`
- **Body**: `spins, action`

### GET `/api/admin/user/fetchUserProfile`
- **Body**: `spins, action`

### PATCH `/api/admin/user/updateUserCoin`
- **Body**: `coin, action`

### PATCH `/api/admin/user/updateUserSpin`
- **Body**: `spins, action`

### POST `/api/admin/vipPlan/createVipPlan`
- **Body**: `validityType, productId, coin, price, validity`
- **Query**: `start, limit`

### PATCH `/api/admin/vipPlan/updateVipPlan`
- **Body**: `validity, productId, validityType, coin, price`
- **Query**: `start, limit`

### PATCH `/api/admin/vipPlan/toggleVipPlanStatus`
- **Query**: `start, limit`

### DELETE `/api/admin/vipPlan/deleteVipPlan`
- **Query**: `start, limit`

### GET `/api/admin/vipPlan/getVipPlans`
- **Query**: `start, limit`

### GET `/api/admin/vipPlanPrivilege/retrieveVipPrivilege`

### GET `/api/admin/withdrawalRequest/retrievePayoutRequests`
- **Query**: `person, start, limit, startDate, endDate`

### PATCH `/api/admin/withdrawalRequest/updateAgencyWithdrawalStatus`
- **Query**: `agencyId, type, reason`

### POST `/api/agency/loginAgency`
- **Body**: `name, email, commissionType, commission, password, mobileNumber, description, countryFlagImage, country`
- **Query**: `password`

### PATCH `/api/agency/modifyAgency`
- **Body**: `name, email, commissionType, commission, password, mobileNumber, description, countryFlagImage, country`

### GET `/api/agency/getAgencyProfile`

### GET `/api/agency/dashboard/retrieveDashboardStats`
- **Query**: `startDate, endDate`

### GET `/api/agency/dashboard/retrieveRecentHosts`
- **Query**: `startDate, endDate`

### GET `/api/agency/dashboard/listTopEarningHosts`
- **Query**: `startDate, endDate`

### GET `/api/agency/dashboard/getEarningsReport`
- **Query**: `startDate, endDate`

### GET `/api/agency/history/getCoinTransactions`
- **Query**: `hostId, start, limit, startDate, endDate`

### GET `/api/agency/history/getCallTransactions`
- **Query**: `hostId, start, limit, startDate, endDate`

### GET `/api/agency/history/getGiftTransactions`
- **Query**: `hostId, start, limit, startDate, endDate`

### GET `/api/agency/history/retrieveAgencyEarnings`
- **Query**: `start, limit, startDate, endDate`

### GET `/api/agency/host/fetchHostRequestsByAgency`
- **Query**: `requestId, userId, status, reason, start, limit`

### PATCH `/api/agency/host/manageHostRequest`
- **Query**: `requestId, userId, status, reason, start, limit`

### GET `/api/agency/host/retrieveAgencyHosts`
- **Query**: `hostId, start, limit`

### PATCH `/api/agency/host/modifyHostBlockStatus`
- **Query**: `hostId`

### GET `/api/agency/liveBroadcastHistory/getLiveSessionHistory`
- **Query**: `hostId, start, limit, startDate, endDate`

### GET `/api/agency/liveBroadcaster/getLiveHosts`
- **Query**: `start, limit`

### POST `/api/agency/notification/notifyHost`
- **Body**: `title, message`

### POST `/api/agency/notification/sendBulkHostNotifications`
- **Body**: `message`

### GET `/api/agency/paymentMethod/fetchPaymentMethods`

### PATCH `/api/agency/setting/modifySetting`
- **Body**: `generalRandomCallRate, femaleRandomCallRate, maleRandomCallRate, videoPrivateCallRate, audioPrivateCallRate, chatInteractionRate`
- **Query**: `settingId`

### GET `/api/agency/setting/retrieveSettings`

### GET `/api/agency/withdrawalRequest/fetchPayoutRequests`
- **Body**: `paymentGateway, paymentDetails, coin`
- **Query**: `status, person, start, limit, startDate, endDate`

### PATCH `/api/agency/withdrawalRequest/updateWithdrawalStatus`
- **Body**: `paymentGateway, paymentDetails, coin`
- **Query**: `hostId, type, reason`

### POST `/api/agency/withdrawalRequest/initiateWithdrawal`
- **Body**: `paymentGateway, paymentDetails, coin`

### POST `/api/client/block/blockHost`
- **Query**: `hostId, userId, start, limit`

### POST `/api/client/block/blockUser`
- **Query**: `hostId, userId, start, limit`

### GET `/api/client/block/getBlockedHostsForUser`
- **Query**: `start, limit, hostId`

### GET `/api/client/block/getBlockedUsersForHost`
- **Query**: `hostId, start, limit`

### GET `/api/client/chat/fetchChatHistory`
- **Body**: `senderId, chatTopicId, receiverId, messageType`
- **Query**: `receiverId, start, limit, senderId`

### GET `/api/client/chat/retrieveChatHistory`
- **Query**: `senderId, receiverId, start, limit`

### GET `/api/client/chatTopic/fetchChatList`
- **Query**: `start, limit, hostId`

### GET `/api/client/chatTopic/retrieveChatList`
- **Query**: `hostId, start, limit`

### GET `/api/client/coinPlan/getCoinPackage`
- **Query**: `coinPlanId, paymentGateway`

### POST `/api/client/coinPlan/recordCoinPlanPurchase`
- **Query**: `coinPlanId, paymentGateway`

### GET `/api/client/dailyRewardCoin/retrieveDailyCoins`
- **Query**: `dailyRewardCoin`

### POST `/api/client/dailyRewardCoin/processDailyCheckIn`
- **Query**: `dailyRewardCoin`

### POST `/api/client/followerFollowing/handleFollowUnfollow`
- **Query**: `followingId, hostId`

### GET `/api/client/followerFollowing/getFollowingList`
- **Query**: `hostId`

### GET `/api/client/followerFollowing/getFollowerList`
- **Query**: `hostId`

### GET `/api/client/gift/fetchGiftList`

### GET `/api/client/giftCategory/listGiftCategories`

### GET `/api/client/history/getCoinTransactionRecords`
- **Query**: `startDate, endDate, start, limit, hostId`

### GET `/api/client/history/retrieveHostCoinHistory`
- **Query**: `hostId, start, limit, startDate, endDate`

### POST `/api/client/history/handleCoinTransaction`

### GET `/api/client/host/getPersonalityImpressions`
- **Body**: `email, fcmToken, name, bio, dob, gender, countryFlagImage, country, language, impression, agencyCode, identityProofType`
- **Query**: `start, limit, country`

### GET `/api/client/host/validateAgencyCode`
- **Body**: `email, fcmToken, name, bio, dob, gender, countryFlagImage, country, language, impression, agencyCode, identityProofType`
- **Query**: `start, limit, country`

### GET `/api/client/host/verifyHostRequestStatus`
- **Query**: `start, limit, country`

### GET `/api/client/host/retrieveHosts`
- **Query**: `start, limit, country`

### GET `/api/client/host/retrieveHostDetails`
- **Body**: `name, bio, dob, gender, countryFlagImage, country, language, impression, email, randomCallRate, randomCallFemaleRate, randomCallMaleRate, privateCallRate, audioCallRate, chatRate, removePhotoGalleryIndex, removeProfileVideoIndex`
- **Query**: `gender, hostId`

### GET `/api/client/host/retrieveAvailableHost`
- **Body**: `name, bio, dob, gender, countryFlagImage, country, language, impression, email, randomCallRate, randomCallFemaleRate, randomCallMaleRate, privateCallRate, audioCallRate, chatRate, removePhotoGalleryIndex, removeProfileVideoIndex`
- **Query**: `gender`

### GET `/api/client/host/fetchHostInfo`
- **Body**: `name, bio, dob, gender, countryFlagImage, country, language, impression, email, randomCallRate, randomCallFemaleRate, randomCallMaleRate, privateCallRate, audioCallRate, chatRate, removePhotoGalleryIndex, removeProfileVideoIndex`
- **Query**: `gender, hostId`

### GET `/api/client/host/fetchHostsList`
- **Query**: `start, limit, hostId, country`

### GET `/api/client/host/leaderboards`
- **Query**: `start, limit, hostId, country`

### DELETE `/api/client/host/disableHostAccount`

### GET `/api/client/identityProof/fetchIdentityDocuments`

### POST `/api/client/liveBroadcaster/HostStreaming`
- **Body**: `liveHistoryId`
- **Query**: `channel, agoraUID`

### POST `/api/client/liveBroadcaster/endLive`
- **Body**: `liveHistoryId`

### GET `/api/client/paymentMethod/getActivePaymentMethods`

### GET `/api/client/setting/retrieveAppSettings`

### GET `/api/client/setting/getSystemConfiguration`

### GET `/api/client/spin/status`

### POST `/api/client/spin/play`

### POST `/api/client/user/send-otp`

### POST `/api/client/user/verify-otp`
- **Body**: `otp, fcmToken`

### POST `/api/client/user/quickUserVerification`
- **Body**: `loginType, fcmToken, email, name, image, dob`

### POST `/api/client/user/signInOrSignUpUser`
- **Body**: `loginType, fcmToken, email, name, image, dob`

### PATCH `/api/client/user/modifyUserProfile`
- **Body**: `name, selfIntro, gender, bio, dob, age, countryFlagImage, country`

### GET `/api/client/user/retrieveUserProfile`

### DELETE `/api/client/user/deactivateMyAccount`

### GET `/api/client/vipPlan/fetchVipPlans`
- **Query**: `vipPlanId, paymentGateway`

### POST `/api/client/vipPlan/purchaseVipPlan`
- **Query**: `vipPlanId, paymentGateway`

### GET `/api/client/vipPlanPrivilege/retrieveVipPrivilege`

### POST `/api/client/withdrawalRequest/submitWithdrawalRequest`
- **Body**: `paymentGateway, paymentDetails, coin`
- **Query**: `status, hostId, start, limit, startDate, endDate`

### GET `/api/client/withdrawalRequest/listPayoutRequests`
- **Query**: `status, hostId, start, limit, startDate, endDate`

### POST `/api/reseller/loginReseller`
- **Body**: `password`
- **Query**: `limit`

### PATCH `/api/reseller/modifyReseller`
- **Body**: `name, email, password, mobile, description, countryFlagImage, country`
- **Query**: `startDate, endDate`

### GET `/api/reseller/getResellerProfile`
- **Query**: `startDate, endDate`

