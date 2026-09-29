import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";
import Task from "@/models/Task";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "STUDENT") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    await connectDB();

    const task = await Task.findById(id)
      .populate("team", "name")
      .populate("createdBy", "name email")
      .lean();

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          message: "Task not found",
        },
        { status: 404 }
      );
    }

    // Security check:
    // The logged-in student must belong to this task's team.
    const team = await Team.findOne({
      _id: task.team?._id || task.team,
      $or: [
        { students: session.user.id },
        { members: session.user.id },
      ],
    }).lean();

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have access to this task",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("Student task details error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch task",
      },
      { status: 500 }
    );
  }
}