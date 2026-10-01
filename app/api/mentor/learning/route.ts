import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";

import Team from "@/models/Team";
import Learning from "@/models/Learning";

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

    const teams = await Team.find({
      mentor: session.user.id,
    })
      .select("_id name")
      .lean();

    const teamIds = teams.map((team) => team._id);

    const learning = await Learning.find({
      team: { $in: teamIds },
    })
      .populate("team", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      learning,
      total: learning.length,
    });
  } catch (error) {
    console.error("Mentor learning error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load learning resources.",
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
    const youtubeUrl = String(body.youtubeUrl || "").trim();
    const notes = String(body.notes || "").trim();
    const teamId = String(body.teamId || "").trim();

    if (!title || !youtubeUrl || !teamId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Title, YouTube URL and team are required.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Make sure this team belongs to the logged-in mentor.
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
            "You are not authorized to add resources to this team.",
        },
        { status: 403 }
      );
    }

    const learning = await Learning.create({
      title,
      youtubeUrl,
      notes,
      team: team._id,
      createdBy: session.user.id,
      status: "ACTIVE",
    });

    const createdLearning = await Learning.findById(
      learning._id
    )
      .populate("team", "name")
      .populate("createdBy", "name email")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Learning resource added successfully.",
        learning: createdLearning,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Create mentor learning resource error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add learning resource.",
      },
      { status: 500 }
    );
  }
}