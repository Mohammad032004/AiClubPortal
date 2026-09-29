import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";
import Project from "@/models/Project";

export async function GET() {
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

    await connectDB();

    const studentId = session.user.id;

    const team = await Team.findOne({
      $or: [
        { students: studentId },
        { members: studentId },
      ],
    }).lean();

    if (!team) {
      return NextResponse.json({
        success: true,
        projects: [],
        team: null,
      });
    }

    const projects = await Project.find({
      team: team._id,
    })
      .populate("team", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      projects,
      team: {
        _id: team._id,
        name: team.name,
      },
    });
  } catch (error) {
    console.error("Student projects error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch projects",
      },
      { status: 500 }
    );
  }
}