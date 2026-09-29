import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
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

    const projects = await Project.find()
      .populate("team", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("Get projects error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch projects",
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
      githubUrl,
      demoUrl,
      documentationUrl,
      status,
      progress,
    } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { message: "Project title is required" },
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

    const project = await Project.create({
      title: title.trim(),
      description: description?.trim() || "",
      team: teamId,
      createdBy: session.user.id,
      githubUrl: githubUrl?.trim() || "",
      demoUrl: demoUrl?.trim() || "",
      documentationUrl: documentationUrl?.trim() || "",
      status: status || "PLANNING",
      progress:
        progress !== undefined ? Number(progress) : 0,
    });

    const populatedProject = await Project.findById(project._id)
      .populate("team", "name")
      .populate("createdBy", "name email")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Project created successfully",
        project: populatedProject,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create project error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create project",
      },
      { status: 500 }
    );
  }
}