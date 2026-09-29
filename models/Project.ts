import mongoose, { Schema, models, model } from "mongoose";

const projectSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
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

    documentationUrl: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["PLANNING", "IN_PROGRESS", "COMPLETED"],
      default: "PLANNING",
    },

    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  { timestamps: true }
);

const Project =
  models.Project || model("Project", projectSchema);

export default Project;