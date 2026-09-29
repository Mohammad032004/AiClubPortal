import mongoose, { Schema, models, model } from "mongoose";

const learningProgressSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    learning: {
      type: Schema.Types.ObjectId,
      ref: "Learning",
      required: true,
    },

    status: {
      type: String,
      enum: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"],
      default: "NOT_STARTED",
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

learningProgressSchema.index(
  { student: 1, learning: 1 },
  { unique: true }
);

const LearningProgress =
  models.LearningProgress ||
  model("LearningProgress", learningProgressSchema);

export default LearningProgress;