# Coin Recharge System Architecture

## Overview

This document describes the complete architecture for the coin recharge system where:
- **SuperAdmin** can add/deduct coins to/from Reseller wallets
- **Reseller** can recharge User with coins (coins deducted from Reseller, added to User)
- All transactions are tracked atomically with complete audit trail

---

## Architecture Flow

```
SuperAdmin
    ↓
CoinTransaction (Add/Deduct Coins)
    ↓
Reseller Wallet (coin balance)
    ↓
Reseller → Recharge User
    ↓
User Wallet (coin balance)
    ↓
History & Audit Trail
```

---

## Models

### 1. **CoinTransaction Model** (`d:/nexa/backend/models/CoinTransaction.model.js`)

Tracks all SuperAdmin coin operations on Reseller wallets.

**Fields:**
- `uniqueId` - Unique transaction identifier
- `performedBy` - Admin ID (SuperAdmin performing action)
- `resellerId` - Reseller being affected
- `type` - ADD (1) or DEDUCT (2)
- `amount` - Coins amount
- `balanceBefore` - Reseller's balance before transaction
- `balanceAfter` - Reseller's balance after transaction
- `reason` - Why coins were added/deducted
- `status` - completed/pending/failed
- `approvedBy` - Who approved the transaction
- `approvalDate` - When approved

**Indexes:**
- By resellerId + date
- By performedBy + date
- By status
- By type

### 2. **Enhanced Recharge Model** (`d:/nexa/backend/models/recharge.model.js`)

Tracks all coin recharges from Reseller to User.

**Fields:**
- `uniqueId` - Unique recharge identifier
- `userId` - User being recharged
- `resellerId` - Reseller doing the recharge
- `amount` - Coins recharged
- `status` - pending/completed/failed/cancelled
- `resellerBalanceBefore/After` - Reseller's balance change
- `userBalanceBefore/After` - User's balance change
- `historyId` - Reference to History record (audit trail)
- `completedAt` - Completion timestamp
- `failureReason` - If transaction failed

**Indexes:**
- By userId + date
- By resellerId + date
- By status + date

### 3. **User Model** (Updated)

User already has `coin` field for storing coin balance. Additionally:
- `rechargedCoins` - Total coins user has ever recharged (bought)
- `spentCoins` - Total coins user has spent

### 4. **Reseller Model** (Updated)

Reseller has `coin` field storing their wallet balance.

---

## Service Layer

### CoinTransactionService (`d:/nexa/backend/util/coinTransactionService.js`)

Handles all coin operations with **atomic transactions** using MongoDB sessions.

#### Methods:

##### 1. **addCoinsToReseller(resellerId, amount, adminId, reason)**
```javascript
// SuperAdmin adds coins to reseller
const result = await coinTransactionService.addCoinsToReseller(
  resellerId,
  1000,  // amount
  superAdminId,
  "Monthly credit allocation"
);

// Response:
{
  success: true,
  data: {
    transaction: { /* CoinTransaction record */ },
    reseller: { _id, coin, balanceBefore, balanceAfter }
  },
  message: "Successfully added 1000 coins to reseller"
}
```

##### 2. **deductCoinsFromReseller(resellerId, amount, adminId, reason)**
```javascript
// SuperAdmin deducts coins from reseller
const result = await coinTransactionService.deductCoinsFromReseller(
  resellerId,
  500,   // amount
  superAdminId,
  "Penalty for fraud"
);
```

##### 3. **resellerRechargeUser(resellerId, userId, amount, metadata)**
```javascript
// Reseller recharges user - ATOMIC OPERATION
const result = await coinTransactionService.resellerRechargeUser(
  resellerId,
  userId,
  100,   // amount
  {
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0...",
    notes: "User requested recharge"
  }
);

// Returns:
{
  success: true,
  data: {
    recharge: { /* Recharge record */ },
    history: { /* History audit trail */ },
    reseller: { _id, coin, balanceBefore, balanceAfter },
    user: { _id, coin, balanceBefore, balanceAfter }
  }
}
```

**ATOMIC OPERATIONS** - Uses MongoDB transactions:
1. Validates balances
2. Deducts from Reseller
3. Adds to User
4. Creates Recharge record
5. Creates History record
6. Either all succeed or all fail (no partial updates)

##### 4. **getResellerCoinHistory(resellerId, page, limit)**
```javascript
// Get all SuperAdmin operations on reseller
const result = await coinTransactionService.getResellerCoinHistory(
  resellerId,
  1,    // page
  20    // items per page
);

// Returns paginated CoinTransaction records
```

##### 5. **getResellerRechargeHistory(resellerId, page, limit)**
```javascript
// Get all recharges made by this reseller
const result = await coinTransactionService.getResellerRechargeHistory(
  resellerId,
  1,    // page
  20
);

// Returns paginated Recharge records + statistics
```

---

## API Endpoints

### SuperAdmin Coin Management

#### 1. **Add Coins to Reseller**
```
POST /admin/reseller/:resellerId/addCoins
Headers:
  - Content-Type: application/json
  - Authorization: Bearer <admin_token>

Body:
{
  "amount": 1000,
  "reason": "Monthly credit allocation" // optional
}

Response:
{
  "status": true,
  "message": "Successfully added 1000 coins to reseller",
  "data": {
    "transaction": { /* CoinTransaction */ },
    "reseller": { _id, coin, balanceBefore, balanceAfter }
  }
}
```

#### 2. **Deduct Coins from Reseller**
```
POST /admin/reseller/:resellerId/deductCoins
Headers:
  - Content-Type: application/json
  - Authorization: Bearer <admin_token>

Body:
{
  "amount": 500,
  "reason": "Fraud penalties" // optional
}

Response: Same as above
```

#### 3. **Get Coin Transactions for Reseller**
```
GET /admin/reseller/:resellerId/coinTransactions?page=1&limit=20
Headers:
  - Authorization: Bearer <admin_token>

Response:
{
  "status": true,
  "data": {
    "transactions": [
      {
        "_id": "...",
        "uniqueId": "CT_xxx",
        "resellerId": "...",
        "type": 1,  // 1=ADD, 2=DEDUCT
        "amount": 1000,
        "balanceBefore": 5000,
        "balanceAfter": 6000,
        "reason": "...",
        "status": "completed",
        "performedBy": { _id, name, email },
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "current": 1,
      "total": 5,
      "count": 20,
      "total_items": 95
    }
  }
}
```

---

### Reseller Recharge Operations

#### 1. **Find User by ID**
```
POST /admin/reseller/findUser
Headers:
  - Content-Type: application/json
  - Authorization: Bearer <reseller_token>

Body:
{
  "userId": "user_unique_id"
}

Response:
{
  "status": true,
  "user": {
    "_id": "...",
    "name": "John Doe",
    "uniqueId": "user_123",
    "coin": 500,
    "rechargedCoins": 2000
  }
}
```

#### 2. **Recharge User**
```
POST /admin/reseller/recharge
Headers:
  - Content-Type: application/json
  - Authorization: Bearer <reseller_token>

Body:
{
  "userId": "user_unique_id",
  "amount": 100,
  "notes": "User requested top-up" // optional
}

Response:
{
  "status": true,
  "message": "Successfully recharged user with 100 coins",
  "data": {
    "recharge": {
      "_id": "...",
      "uniqueId": "RCH_xxx",
      "userId": "...",
      "resellerId": "...",
      "amount": 100,
      "status": "completed",
      "resellerBalanceBefore": 1000,
      "resellerBalanceAfter": 900,
      "userBalanceBefore": 500,
      "userBalanceAfter": 600,
      "completedAt": "2024-01-15T10:30:00Z"
    },
    "history": { /* History audit record */ },
    "reseller": { _id, coin: 900, balanceBefore, balanceAfter },
    "user": { _id, coin: 600, balanceBefore, balanceAfter }
  }
}
```

#### 3. **Get Recharge History**
```
GET /admin/reseller/rechargeHistory?page=1&limit=20
Headers:
  - Authorization: Bearer <reseller_token>

Response:
{
  "status": true,
  "data": {
    "recharges": [
      {
        "_id": "...",
        "uniqueId": "RCH_xxx",
        "userId": { _id, name, uniqueId, coin },
        "resellerId": { _id, name, coin },
        "amount": 100,
        "status": "completed",
        "resellerBalanceBefore": 1000,
        "resellerBalanceAfter": 900,
        "userBalanceBefore": 500,
        "userBalanceAfter": 600,
        "completedAt": "2024-01-15T10:30:00Z",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "stats": [
      {
        "_id": "completed",
        "totalAmount": 5000,
        "count": 50
      }
    ],
    "pagination": { current, total, count, total_items }
  }
}
```

#### 4. **Get Coin Transaction History (Reseller View)**
```
GET /admin/reseller/coinTransactionHistory?page=1&limit=20
Headers:
  - Authorization: Bearer <reseller_token>

Response:
{
  "status": true,
  "data": {
    "transactions": [
      {
        "_id": "...",
        "uniqueId": "CT_xxx",
        "type": 1,      // 1=ADD, 2=DEDUCT
        "amount": 1000,
        "balanceBefore": 5000,
        "balanceAfter": 6000,
        "reason": "Monthly allocation",
        "status": "completed",
        "performedBy": { _id, name, email },
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": { current, total, count, total_items }
  }
}
```

---

## Transaction Constants

Update in `d:/nexa/backend/types/constant.js`:

```javascript
exports.COIN_TRANSACTION_TYPE = {
  ADD: 1,
  DEDUCT: 2,
};

exports.RECHARGE_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
};

exports.HISTORY_TYPE = {
  // ... existing types ...
  RESELLER_RECHARGE_USER: 16, // When reseller recharged user
};
```

---

## Key Features

### 1. **Atomic Transactions**
- Uses MongoDB sessions
- All-or-nothing operations
- No partial updates

### 2. **Balance Tracking**
- Records balance before and after each transaction
- Easy to audit
- Reconciliation friendly

### 3. **Complete Audit Trail**
- Every operation logged in CoinTransaction
- History records link Recharge to User impact
- Timestamps on all operations

### 4. **Validation**
- Sufficient balance checks
- Input validation
- Error handling with meaningful messages

### 5. **Security**
- SuperAdmin-only operations
- Reseller can only affect their own transactions
- IP tracking and user agent logging

---

## Error Handling

### Common Errors:

```javascript
// Insufficient balance
{
  "success": false,
  "message": "Insufficient coins. Available: 500, Requested: 1000"
}

// User not found
{
  "success": false,
  "message": "User not found"
}

// Reseller not found
{
  "success": false,
  "message": "Reseller not found"
}

// Invalid amount
{
  "success": false,
  "message": "Amount must be greater than 0"
}

// Unauthorized
{
  "status": false,
  "message": "Only SuperAdmin can perform this action"
}
```

---

## Data Consistency Guarantees

When a **Reseller recharges User**:

1. ✅ Reseller coin balance decreases
2. ✅ User coin balance increases
3. ✅ User rechargedCoins counter increases
4. ✅ Recharge record created with all details
5. ✅ History record created for audit
6. ✅ All happen atomically - no partial states

If any step fails, ALL changes are rolled back.

---

## Testing Guide

### Test 1: SuperAdmin Adds Coins
```bash
curl -X POST http://localhost:5000/admin/reseller/[RESELLER_ID]/addCoins \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -d '{
    "amount": 1000,
    "reason": "Test allocation"
  }'
```

### Test 2: Reseller Recharges User
```bash
curl -X POST http://localhost:5000/admin/reseller/recharge \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [RESELLER_TOKEN]" \
  -d '{
    "userId": "user_unique_id",
    "amount": 100,
    "notes": "Test recharge"
  }'
```

### Test 3: Verify Recharge History
```bash
curl -X GET http://localhost:5000/admin/reseller/rechargeHistory \
  -H "Authorization: Bearer [RESELLER_TOKEN]"
```

---

## Database Indexes

The system automatically creates indexes for:
- Fast lookup by reseller
- Fast lookup by date
- Fast lookup by status
- Fast lookup by transaction type

This ensures queries remain fast even with millions of transactions.

---

## Migration Notes

If upgrading from old system:
1. Run CoinTransaction model creation
2. Run enhanced Recharge model migration
3. Backfill transaction records if needed
4. Update any existing code using old recharge endpoints

---

## Future Enhancements

1. **Approval Workflows** - Require approval for deductions above threshold
2. **Scheduled Transfers** - Automatic monthly allocations
3. **Ledger Reports** - Advanced financial reporting
4. **Rate Limiting** - Prevent abuse
5. **Batch Operations** - Recharge multiple users at once
6. **Webhooks** - Notify on transaction events

---

## Support

For issues or questions:
1. Check error messages for details
2. Review transaction history for debugging
3. Check audit trail in History model
4. Review CoinTransaction records
