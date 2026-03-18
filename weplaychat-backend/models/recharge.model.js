const mongoose = require("mongoose");
const { RECHARGE_STATUS } = require("../types/constant");
const { Schema } = mongoose;

const rechargeSchema = new Schema(
  {
    // Unique identifier for this recharge transaction
    uniqueId: { type: String, unique: true, trim: true, default: "" },

    // Parties involved
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    resellerId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Reseller', 
      required: true 
    },

    // Transaction details
    amount: { 
      type: Number, 
      required: true,
      min: 0
    },
    
    // Status of the recharge
    status: { 
      type: String, 
      enum: Object.values(RECHARGE_STATUS),
      default: RECHARGE_STATUS.PENDING 
    },

    // Balance tracking
    resellerBalanceBefore: { type: Number, default: 0 },
    resellerBalanceAfter: { type: Number, default: 0 },
    userBalanceBefore: { type: Number, default: 0 },
    userBalanceAfter: { type: Number, default: 0 },

    // Reference IDs
    historyId: { 
      type: Schema.Types.ObjectId, 
      ref: 'History',
      default: null 
    },

    // Notes/Reason
    notes: { type: String, default: "" },
    reason: { type: String, default: "User Recharge" },

    // Completion tracking
    completedAt: { type: Date, default: null },
    failureReason: { type: String, default: "" },

    // Metadata
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for efficient queries
rechargeSchema.index({ userId: 1, createdAt: -1 });
rechargeSchema.index({ resellerId: 1, createdAt: -1 });
rechargeSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Recharge", rechargeSchema);