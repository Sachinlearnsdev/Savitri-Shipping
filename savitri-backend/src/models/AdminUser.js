const mongoose = require("mongoose");

const adminUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      sparse: true,
    },
    avatar: {
      type: String,
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "LOCKED", "DELETED"],
      default: "ACTIVE",
    },
    failedAttempts: {
      type: Number,
      default: 0,
    },
    lockedUntil: {
      type: Date,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

adminUserSchema.index({ status: 1 });
adminUserSchema.index({ roleId: 1 });

module.exports = mongoose.model("AdminUser", adminUserSchema);
