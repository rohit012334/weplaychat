# WePlayChat User App API Guide

This guide explains why these APIs are included, what they are used for, and which headers must be sent for each type of request.

## Why this collection is created

- It contains only `user app` APIs from `/api/client/...`.
- It excludes admin panel, agency panel, and reseller APIs.
- It helps mobile/frontend developers test real user app flows quickly in Postman with correct headers.

## Base URL

- `http://localhost:8000/api`

## Mandatory headers logic

Every endpoint in this backend checks access with a secret key middleware:

- `key: <your_secret_key>`

If this `key` is missing or wrong, API returns access error.

Some endpoints also require Firebase token verification:

- `Authorization: Bearer <firebase_id_token>`

Some endpoints additionally require user-to-db mapping check:

- `x-user-uid: <firebase_uid_saved_in_mongodb>`

## Header groups you should use

- `Public Client Header`  
  `key`

- `Firebase Auth Header`  
  `key` + `Authorization`

- `User Protected Header`  
  `key` + `Authorization` + `x-user-uid`

## Which APIs use which header group

### 1) User Auth and Profile

- `/client/user/send-otp` -> `Firebase Auth Header`
- `/client/user/verify-otp` -> `Firebase Auth Header`
- `/client/user/quickUserVerification` -> `Public Client Header`
- `/client/user/signInOrSignUpUser` -> `Firebase Auth Header`
- `/client/user/modifyUserProfile` -> `User Protected Header`
- `/client/user/retrieveUserProfile` -> `User Protected Header`
- `/client/user/deactivateMyAccount` -> `User Protected Header`

### 2) Host / Discovery / Become Host

- `/client/host/getPersonalityImpressions` -> `Public Client Header`
- `/client/host/validateAgencyCode` -> `Public Client Header`
- `/client/host/initiateHostRequest` -> `User Protected Header`
- `/client/host/verifyHostRequestStatus` -> `User Protected Header`
- `/client/host/retrieveHosts` -> `User Protected Header`
- `/client/host/retrieveHostDetails` -> `User Protected Header`
- `/client/host/retrieveAvailableHost` -> `User Protected Header`
- `/client/host/fetchHostInfo` -> `Public Client Header`
- `/client/host/modifyHostDetails` -> `Public Client Header`
- `/client/host/fetchHostsList` -> `Public Client Header`
- `/client/host/leaderboards` -> `Public Client Header`
- `/client/host/disableHostAccount` -> `Public Client Header`

### 3) Social / Follow / Block / Chat

- `/client/followerFollowing/handleFollowUnfollow` -> `User Protected Header`
- `/client/followerFollowing/getFollowingList` -> `User Protected Header`
- `/client/followerFollowing/getFollowerList` -> `Public Client Header`
- `/client/block/blockHost` -> `User Protected Header`
- `/client/block/blockUser` -> `Public Client Header`
- `/client/block/getBlockedHostsForUser` -> `User Protected Header`
- `/client/block/getBlockedUsersForHost` -> `Public Client Header`
- `/client/chatTopic/fetchChatList` -> `User Protected Header`
- `/client/chatTopic/retrieveChatList` -> `Public Client Header`
- `/client/chat/pushChatMessage` -> `User Protected Header`
- `/client/chat/fetchChatHistory` -> `User Protected Header`
- `/client/chat/submitChatMessage` -> `Public Client Header`
- `/client/chat/retrieveChatHistory` -> `Public Client Header`

### 4) Wallet / Plans / Rewards / Settings

- `/client/giftCategory/listGiftCategories` -> `Public Client Header`
- `/client/gift/fetchGiftList` -> `User Protected Header`
- `/client/coinPlan/getCoinPackage` -> `User Protected Header`
- `/client/coinPlan/recordCoinPlanPurchase` -> `User Protected Header`
- `/client/vipPlan/fetchVipPlans` -> `User Protected Header`
- `/client/vipPlan/purchaseVipPlan` -> `User Protected Header`
- `/client/vipPlanPrivilege/retrieveVipPrivilege` -> `Public Client Header`
- `/client/dailyRewardCoin/retrieveDailyCoins` -> `User Protected Header`
- `/client/dailyRewardCoin/processDailyCheckIn` -> `User Protected Header`
- `/client/paymentMethod/getActivePaymentMethods` -> `Public Client Header`
- `/client/setting/retrieveAppSettings` -> `User Protected Header`
- `/client/setting/getSystemConfiguration` -> `Public Client Header`
- `/client/history/getCoinTransactionRecords` -> `User Protected Header`
- `/client/history/retrieveHostCoinHistory` -> `Public Client Header`
- `/client/history/handleCoinTransaction` -> `Public Client Header`
- `/client/identityProof/fetchIdentityDocuments` -> `Public Client Header`
- `/client/withdrawalRequest/submitWithdrawalRequest` -> `Public Client Header`
- `/client/withdrawalRequest/listPayoutRequests` -> `Public Client Header`
- `/client/banner/fetchBannerList` -> `User Protected Header`
- `/client/banner/getBanner` -> `User Protected Header`
- `/client/spin/status` -> `User Protected Header`
- `/client/spin/play` -> `User Protected Header`
- `/client/liveBroadcaster/HostStreaming` -> `Public Client Header`
- `/client/liveBroadcaster/endLive` -> `Public Client Header`

## Why each API bucket is needed in app

- `User Auth and Profile`: login/signup, OTP, and personal profile management.
- `Host/Discovery`: host browsing, host details, and user-to-host onboarding flow.
- `Social & Chat`: follow/block/chat features used in interaction layer.
- `Wallet/Plans/Rewards`: coin/vip purchase, daily rewards, wallet history, payment and settings.
- `Banners/Spin/Live`: home promotion content, gamification, and live lifecycle support.

## Postman setup steps

1. Import `WePlayChat_User_App_Postman_Collection.json` in Postman.
2. Set collection variables:
   - `apiKey`
   - `firebaseIdToken`
   - `userUid`
   - ids like `hostId`, `userId`, `vipPlanId` as needed.
3. Run requests according to flow:
   - first auth/login requests
   - then user-protected requests
   - then feature APIs.

## Important note

Some `/client` routes are host-side or mixed-role routes (same mobile app role switching). They are kept because they belong to the client app route namespace and are commonly needed for end-to-end testing.
