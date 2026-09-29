import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Task from "@/models/Task";
import Team from "@/models/Team";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const tasks = await Task.find()
      .populate("team", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch tasks",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      title,
      description,
      teamId,
      priority,
      deadline,
    } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { message: "Task title is required" },
        { status: 400 }
      );
    }

    if (!teamId) {
      return NextResponse.json(
        { message: "Team is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const team = await Team.findById(teamId);

    if (!team) {
      return NextResponse.json(
        { message: "Team not found" },
        { status: 404 }
      );
    }

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || "",
      team: teamId,
      createdBy: session.user.id,
      priority: priority || "MEDIUM",
      deadline: deadline ? new Date(deadline) : undefined,
      status: "PENDING",
    });

    const populatedTask = await Task.findById(task._id)
      .populate("team", "name")
      .populate("createdBy", "name email")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Task created successfully",
        task: populatedTask,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create task error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create task",
      },
      { status: 500 }
    );
  }
}