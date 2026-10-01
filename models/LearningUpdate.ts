import mongoose, { Schema, models, model } from "mongoose";

const learningUpdateSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    learningResource: {
      type: Schema.Types.ObjectId,
      ref: "Learning",
      required: true,
    },

    learned: {
      type: String,
      required: true,
      trim: true,
    },

    practiced: {
      type: String,
      required: true,
      trim: true,
    },

    doubts: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REVISION_REQUIRED"],
      default: "PENDING",
    },

    mentorFeedback: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const LearningUpdate =
  models.LearningUpdate ||
  model("LearningUpdate", learningUpdateSchema);

export default LearningUpdate;