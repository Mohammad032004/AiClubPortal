import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

import { connectDB } from "@/lib/mongodb";

import Team from "@/models/Team";

import Project from "@/models/Project";

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

    // Get all teams assigned to this mentor.
    // This includes teams that don't have a project yet.
    const teams = await Team.find({
      mentor: session.user.id,
    })
      .select("_id name")
      .sort({ name: 1 })
      .lean();

    const teamIds = teams.map((team) => team._id);

    // Get projects belonging only to the mentor's teams.
    const projects = await Project.find({
      team: { $in: teamIds },
    })
      .populate("team", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      teams,
      projects,
      total: projects.length,
    });
  } catch (error) {
    console.error("Mentor projects error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load projects.",
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
    const description = String(
      body.description || ""
    ).trim();
    const teamId = String(body.teamId || "").trim();
    const demoUrl = String(body.demoUrl || "").trim();
    const documentationUrl = String(
      body.documentationUrl || ""
    ).trim();

    const status = String(
      body.status || "PLANNING"
    ).trim();

    if (!title || !teamId) {
      return NextResponse.json(
        {
          success: false,
          message: "Project title and team are required.",
        },
        { status: 400 }
      );
    }

    if (
      !["PLANNING", "IN_PROGRESS", "COMPLETED"].includes(
        status
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid project status.",
        },
        { status: 400 }
      );
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
            "You are not authorized to create a project for this team.",
        },
        { status: 403 }
      );
    }

    const project = await Project.create({
      title,
      description,
      team: team._id,
      createdBy: session.user.id,
      demoUrl,
      documentationUrl,
      status,
      progress: status === "COMPLETED" ? 100 : 0,
    });

    const createdProject = await Project.findById(
      project._id
    )
      .populate("team", "name")
      .populate("createdBy", "name email")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Project created successfully.",
        project: createdProject,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Create mentor project error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create project.",
      },
      { status: 500 }
    );
  }
}