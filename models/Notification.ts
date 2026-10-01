import mongoose, { Schema, models, model } from "mongoose";

const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "GENERAL",
        "LEARNING",
        "TASK",
        "PROJECT",
        "TEAM",
        "SYSTEM",
      ],
      default: "GENERAL",
    },

    read: {
      type: Boolean,
      default: false,
    },

    link: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Notification =
  models.Notification ||
  model("Notification", notificationSchema);

export default Notification;