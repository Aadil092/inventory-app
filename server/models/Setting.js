import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    settingKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    settingValue: {
      type: String,
      required: true,
    },
    settingType: {
      type: String,
      enum: ["text", "number", "textarea", "email", "url"],
      default: "text",
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Setting = mongoose.model("Setting", settingSchema);

export default Setting;
