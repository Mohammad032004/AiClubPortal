import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";
import Task from "@/models/Task";
import TaskSubmission from "@/models/TaskSubmission";

export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "MENTOR") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid task ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const task = await Task.findById(id)
      .populate("team", "name students")
      .populate("createdBy", "name email")
      .lean();

    if (!task) {
      return NextResponse.json(
        { message: "Task not found" },
        { status: 404 }
      );
    }

    const team = await Team.findOne({
      _id: task.team?._id,
      mentor: session.user.id,
    })
      .select("_id name students mentor")
      .lean();

    if (!team) {
      return NextResponse.json(
        { message: "You do not have access to this task" },
        { status: 403 }
      );
    }

    const submissions = await TaskSubmission.find({
      task: id,
    })
      .populate("student", "name email role")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      task,
      team,
      submissions,
    });
  } catch (error) {
    console.error("Mentor task details error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load task details",
      },
      { status: 500 }
    );
  }
}