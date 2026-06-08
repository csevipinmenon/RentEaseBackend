import mongoose from "mongoose";

const serviceAreaSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

export default mongoose.model("ServiceArea", serviceAreaSchema);
