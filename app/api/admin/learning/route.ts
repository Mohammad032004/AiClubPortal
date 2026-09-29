import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Learning from "@/models/Learning";
import Team from "@/models/Team";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const learning = await Learning.find()
      .populate("team", "name status")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      learning,
    });
  } catch (error) {
    console.error("Get learning error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch learning resources.",
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
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const title = String(body.title || "").trim();
    const youtubeUrl = String(body.youtubeUrl || "").trim();
    const notes = String(body.notes || "").trim();
    const teamId = String(body.teamId || "").trim();

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message: "Learning title is required.",
        },
        { status: 400 }
      );
    }

    if (!youtubeUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "YouTube URL is required.",
        },
        { status: 400 }
      );
    }

    if (!teamId) {
      return NextResponse.json(
        {
          success: false,
          message: "Team is required.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const team = await Team.findById(teamId).lean();

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected team was not found.",
        },
        { status: 400 }
      );
    }

    const learning = await Learning.create({
      title,
      youtubeUrl,
      notes,
      team: teamId,
      createdBy: session.user.id,
      status: "ACTIVE",
    });

    const populatedLearning = await Learning.findById(
      learning._id
    )
      .populate("team", "name status")
      .populate("createdBy", "name email")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Learning resource created successfully.",
        learning: populatedLearning,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create learning error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create learning resource.",
      },
      { status: 500 }
    );
  }
}