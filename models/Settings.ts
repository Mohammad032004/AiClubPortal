import mongoose, { Schema, models, model } from "mongoose";

const settingsSchema = new Schema(
  {
    clubName: {
      type: String,
      required: true,
      trim: true,
      default: "AI Club",
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    notifications: {
      type: Boolean,
      default: true,
    },

    emailNotifications: {
      type: Boolean,
      default: true,
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Settings =
  models.Settings || model("Settings", settingsSchema);

export default Settings;