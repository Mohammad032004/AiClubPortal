import mongoose, { Schema, models, model } from "mongoose";

export type UserRole = "ADMIN" | "MENTOR" | "STUDENT";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

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

    role: {
      type: String,
      enum: ["ADMIN", "MENTOR", "STUDENT"],
      default: "STUDENT",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = models.User || model("User", userSchema);

export default User;