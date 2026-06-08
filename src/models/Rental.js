import mongoose from "mongoose";

const rentalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, default: 1 },
        monthlyRent: Number,
        securityDeposit: Number,
        tenureMonths: Number,
        startDate: Date,
        endDate: Date,
      },
    ],
    totalMonthlyRent: {
      type: Number,
      required: true,
    },
    totalSecurityDeposit: {
      type: Number,
      required: true,
    },
    tenureMonths: {
      type: Number,
      required: true,
    },
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    deliveryDate: {
      type: Date,
      required: true,
    },
    returnDate: Date,
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "delivered",
        "active",
        "return_requested",
        "returned",
        "cancelled",
      ],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    notes: String,
  },
  { timestamps: true },
);

export default mongoose.model("Rental", rentalSchema);
