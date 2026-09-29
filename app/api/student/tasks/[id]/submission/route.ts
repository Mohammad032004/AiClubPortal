import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";
import Task from "@/models/Task";
import TaskSubmission from "@/models/TaskSubmission";

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
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    await connectDB();

    const task = await Task.findById(id).lean();

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    const team = await Team.findOne({
      _id: task.team,
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

    const submission = await TaskSubmission.findOne({
      task: id,
      student: session.user.id,
    }).lean();

    return NextResponse.json({
      success: true,
      submission: submission || null,
    });
  } catch (error) {
    console.error("Get task submission error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch task submission",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "STUDENT") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    const description = body.description?.trim() || "";
    const demoUrl = body.demoUrl?.trim() || "";

    const screenshots = Array.isArray(body.screenshots)
      ? body.screenshots.filter(
          (item: unknown) =>
            typeof item === "string" && item.trim()
        )
      : [];

    if (
      !description &&
      !demoUrl &&
      screenshots.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please provide a description, demo URL, or screenshot",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const task = await Task.findById(id).lean();

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    const team = await Team.findOne({
      _id: task.team,
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

    const submission =
      await TaskSubmission.findOneAndUpdate(
        {
          task: id,
          student: session.user.id,
        },
        {
          $set: {
            description,
            demoUrl,
            screenshots,
            status: "SUBMITTED",
            mentorComment: "",
            reviewedAt: null,
          },
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      )
        .populate("task", "title")
        .populate("student", "name email")
        .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Task submitted successfully",
        submission,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Submit task error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit task",
      },
      { status: 500 }
    );
  }
}