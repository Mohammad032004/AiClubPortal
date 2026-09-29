import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";
import Learning from "@/models/Learning";
import LearningProgress from "@/models/LearningProgress";

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

    const learning = await Learning.findById(id).lean();

    if (!learning) {
      return NextResponse.json(
        { success: false, message: "Learning resource not found" },
        { status: 404 }
      );
    }

    // Make sure this resource belongs to the student's team.
    const team = await Team.findOne({
      _id: learning.team,
      $or: [
        { students: session.user.id },
        { members: session.user.id },
      ],
    }).lean();

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have access to this resource",
        },
        { status: 403 }
      );
    }

    const progress = await LearningProgress.findOne({
      student: session.user.id,
      learning: id,
    }).lean();

    return NextResponse.json({
      success: true,
      progress: progress || {
        status: "NOT_STARTED",
        completedAt: null,
      },
    });
  } catch (error) {
    console.error("Get learning progress error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch learning progress",
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

    if (!session?.user || session.user.role !== "STUDENT") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    const status = body.status;

    if (
      !["NOT_STARTED", "IN_PROGRESS", "COMPLETED"].includes(status)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid progress status" },
        { status: 400 }
      );
    }

    await connectDB();

    const learning = await Learning.findById(id).lean();

    if (!learning) {
      return NextResponse.json(
        { success: false, message: "Learning resource not found" },
        { status: 404 }
      );
    }

    // Security check: student must belong to the resource's team.
    const team = await Team.findOne({
      _id: learning.team,
      $or: [
        { students: session.user.id },
        { members: session.user.id },
      ],
    }).lean();

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have access to this resource",
        },
        { status: 403 }
      );
    }

    const completedAt =
      status === "COMPLETED" ? new Date() : null;

    const progress = await LearningProgress.findOneAndUpdate(
      {
        student: session.user.id,
        learning: id,
      },
      {
        $set: {
          status,
          completedAt,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    ).lean();

    return NextResponse.json({
      success: true,
      message: "Learning progress updated",
      progress,
    });
  } catch (error) {
    console.error("Update learning progress error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update learning progress",
      },
      { status: 500 }
    );
  }
}