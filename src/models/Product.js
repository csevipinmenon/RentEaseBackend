import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Furniture", "Appliances"],
      required: true,
    },
    subCategory: {
      type: String,
      required: true,
      // e.g., Bed, Sofa, Table, Fridge, Washing Machine, TV
    },
    images: [
      {
        type: String,
      },
    ],
    monthlyRent: {
      type: Number,
      required: true,
    },
    securityDeposit: {
      type: Number,
      required: true,
    },
    tenureOptions: [
      {
        months: { type: Number, required: true },
        discount: { type: Number, default: 0 }, // percentage discount
      },
    ],
    availableQty: {
      type: Number,
      default: 0,
      alias: "availableQuantity",
    },
    totalQty: {
      type: Number,
      default: 0,
    },
    brand: String,
    specifications: [
      {
        key: String,
        value: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    cities: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Product", productSchema);
