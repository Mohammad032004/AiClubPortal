import mongoose, { Schema, models, model } from "mongoose";

const teamSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    mentor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED", "PENDING"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

const Team = models.Team || model("Team", teamSchema);

export default Team;