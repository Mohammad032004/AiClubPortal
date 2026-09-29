import mongoose, { Schema, models, model } from "mongoose";

const learningSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    youtubeUrl: {
      type: String,
      required: true,
      trim: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

const Learning =
  models.Learning || model("Learning", learningSchema);

export default Learning;