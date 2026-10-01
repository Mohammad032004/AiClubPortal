import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

import { connectDB } from "@/lib/mongodb";

import Team from "@/models/Team";

import Task from "@/models/Task";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "MENTOR") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectDB();

    // Get ALL teams assigned to this mentor.
    // This includes teams that have no tasks yet.
    const teams = await Team.find({
      mentor: session.user.id,
    })
      .select("_id name")
      .sort({ name: 1 })
      .lean();

    const teamIds = teams.map((team) => team._id);

    // Get tasks belonging only to the mentor's teams.
    const tasks = await Task.find({
      team: { $in: teamIds },
    })
      .populate("team", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      teams,
      tasks,
      total: tasks.length,
    });
  } catch (error) {
    console.error("Mentor tasks error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load tasks",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "MENTOR") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    const teamId = String(body.teamId || "").trim();
    const priority = String(body.priority || "MEDIUM").trim();
    const deadlineValue = String(body.deadline || "").trim();

    if (!title || !teamId) {
      return NextResponse.json(
        {
          success: false,
          message: "Task title and team are required.",
        },
        { status: 400 }
      );
    }

    if (!["LOW", "MEDIUM", "HIGH"].includes(priority)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid task priority.",
        },
        { status: 400 }
      );
    }

    let deadline: Date | undefined;

    if (deadlineValue) {
      const parsedDeadline = new Date(deadlineValue);

      if (Number.isNaN(parsedDeadline.getTime())) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid deadline.",
          },
          { status: 400 }
        );
      }

      deadline = parsedDeadline;
    }

    await connectDB();

    // Make sure the selected team belongs to this mentor.
    const team = await Team.findOne({
      _id: teamId,
      mentor: session.user.id,
    })
      .select("_id name")
      .lean();

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You are not authorized to create a task for this team.",
        },
        { status: 403 }
      );
    }

    const task = await Task.create({
      title,
      description,
      team: team._id,
      createdBy: session.user.id,
      priority,
      status: "PENDING",
      deadline,
    });

    const createdTask = await Task.findById(task._id)
      .populate("team", "name")
      .populate("createdBy", "name email")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Task created successfully.",
        task: createdTask,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create mentor task error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create task.",
      },
      { status: 500 }
    );
  }
}