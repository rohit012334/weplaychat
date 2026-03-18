const mongoose = require("mongoose");
const { COIN_TRANSACTION_TYPE } = require("../types/constant");

const coinTransactionSchema = new mongoose.Schema(
  {
    // Transaction identifier
    uniqueId: { type: String, unique: true, trim: true, default: "" },
    
    // Who is performing the action
    performedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Admin",
      required: true // Only SuperAdmin can perform these actions
    },
    
    // Which reseller is affected
    resellerId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Reseller",
      required: true
    },
    
    // Coin details
    type: { 
      type: Number, 
      enum: COIN_TRANSACTION_TYPE,
      required: true // 1 = ADD, 2 = DEDUCT
    },
    amount: { 
      type: Number, 
      required: true,
      min: 0
    },
    
    // Balance tracking
    balanceBefore: { type: Number, default: 0 },
    balanceAfter: { type: Number, default: 0 },
    
    // Reason/Notes
    reason: { type: String, default: "" },
    notes: { type: String, default: "" },
    
    // Status tracking
    status: { 
      type: String, 
      enum: ["completed", "pending", "failed"],
      default: "completed"
    },
    
    // Reference to approval if needed
    approvedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Admin",
      default: null
    },
    approvalDate: { type: Date, default: null },
    
    refundTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoinTransaction",
      default: null // If this was a refund, reference the original
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for fast queries
coinTransactionSchema.index({ resellerId: 1, createdAt: -1 });
coinTransactionSchema.index({ performedBy: 1, createdAt: -1 });
coinTransactionSchema.index({ status: 1 });
coinTransactionSchema.index({ type: 1 });

module.exports = mongoose.model("CoinTransaction", coinTransactionSchema);
