import mongoose, { Schema, models, model } from "mongoose";

const taskSubmissionSchema = new Schema(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },

    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    githubUrl: {
      type: String,
      default: "",
      trim: true,
    },

    demoUrl: {
      type: String,
      default: "",
      trim: true,
    },

    screenshots: [
      {
        type: String,
        trim: true,
      },
    ],

    status: {
      type: String,
      enum: ["SUBMITTED", "APPROVED", "CHANGES_REQUESTED"],
      default: "SUBMITTED",
    },

    mentorComment: {
      type: String,
      default: "",
      trim: true,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

taskSubmissionSchema.index(
  { task: 1, student: 1 },
  { unique: true }
);

const TaskSubmission =
  models.TaskSubmission ||
  model("TaskSubmission", taskSubmissionSchema);

export default TaskSubmission;