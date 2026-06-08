import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rental",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    issueType: {
      type: String,
      enum: ["repair", "replacement", "general_service", "damage"],
      required: true,
    },
    disputeType: {
      type: String,
      enum: ["damage_claim", "billing_dispute", "delivery_dispute", "other"],
      default: "other",
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    scheduledDate: Date,
    resolvedDate: Date,
    adminNotes: String,
  },
  { timestamps: true },
);

export default mongoose.model("Maintenance", maintenanceSchema);
