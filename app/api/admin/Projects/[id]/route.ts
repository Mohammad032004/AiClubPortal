import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
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

    const project = await Project.findById(id)
      .populate("team", "name")
      .populate("createdBy", "name email role")
      .lean();

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Get project error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch project",
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
      demoUrl,
      documentationUrl,
      status,
      progress,
    } = body;

    await connectDB();

    const existingProject = await Project.findById(id);

    if (!existingProject) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    if (title !== undefined && !String(title).trim()) {
      return NextResponse.json(
        { message: "Project title cannot be empty" },
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
      status !== undefined &&
      !["PLANNING", "IN_PROGRESS", "COMPLETED"].includes(status)
    ) {
      return NextResponse.json(
        { message: "Invalid project status" },
        { status: 400 }
      );
    }

    if (progress !== undefined) {
      const numericProgress = Number(progress);

      if (
        Number.isNaN(numericProgress) ||
        numericProgress < 0 ||
        numericProgress > 100
      ) {
        return NextResponse.json(
          { message: "Progress must be between 0 and 100" },
          { status: 400 }
        );
      }
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

    if (demoUrl !== undefined) {
      updateData.demoUrl = String(demoUrl).trim();
    }

    if (documentationUrl !== undefined) {
      updateData.documentationUrl =
        String(documentationUrl).trim();
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (progress !== undefined) {
      updateData.progress = Number(progress);
    }

    const updatedProject = await Project.findByIdAndUpdate(
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
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Update project error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update project",
      },
      { status: 500 }
    );
  }
}