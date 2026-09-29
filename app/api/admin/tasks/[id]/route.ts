import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Task from "@/models/Task";
import Team from "@/models/Team";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    await connectDB();

    const task = await Task.findById(id)
      .populate("team", "name")
      .populate("createdBy", "name email role")
      .lean();

    if (!task) {
      return NextResponse.json(
        { message: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("Get task error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch task",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const body = await request.json();

    const {
      title,
      description,
      teamId,
      priority,
      status,
      deadline,
    } = body;

    await connectDB();

    const existingTask = await Task.findById(id);

    if (!existingTask) {
      return NextResponse.json(
        { message: "Task not found" },
        { status: 404 }
      );
    }

    if (title !== undefined && !String(title).trim()) {
      return NextResponse.json(
        { message: "Task title cannot be empty" },
        { status: 400 }
      );
    }

    if (teamId !== undefined) {
      const team = await Team.findById(teamId);

      if (!team) {
        return NextResponse.json(
          { message: "Selected team not found" },
          { status: 404 }
        );
      }
    }

    if (
      priority !== undefined &&
      !["LOW", "MEDIUM", "HIGH"].includes(priority)
    ) {
      return NextResponse.json(
        { message: "Invalid priority" },
        { status: 400 }
      );
    }

    if (
      status !== undefined &&
      !["PENDING", "IN_PROGRESS", "COMPLETED"].includes(status)
    ) {
      return NextResponse.json(
        { message: "Invalid status" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (title !== undefined) {
      updateData.title = String(title).trim();
    }

    if (description !== undefined) {
      updateData.description = String(description).trim();
    }

    if (teamId !== undefined) {
      updateData.team = teamId;
    }

    if (priority !== undefined) {
      updateData.priority = priority;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (deadline !== undefined) {
      updateData.deadline = deadline
        ? new Date(deadline)
        : undefined;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("team", "name")
      .populate("createdBy", "name email role")
      .lean();

    return NextResponse.json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Update task error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update task",
      },
      { status: 500 }
    );
  }
}