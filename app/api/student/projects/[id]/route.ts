import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";
import Project from "@/models/Project";

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

    const project = await Project.findById(id)
      .populate("team", "name")
      .populate("createdBy", "name email")
      .lean();

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          message: "Project not found",
        },
        { status: 404 }
      );
    }

    const teamId =
      typeof project.team === "object" && project.team
        ? project.team._id
        : project.team;

    const team = await Team.findOne({
      _id: teamId,
      $or: [
        { students: session.user.id },
        { members: session.user.id },
      ],
    }).lean();

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have access to this project",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Student project details error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch project",
      },
      { status: 500 }
    );
  }
}