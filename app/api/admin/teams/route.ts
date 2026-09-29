import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";
import User from "@/models/User";

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

    const teams = await Team.find()
      .populate("mentor", "name email")
      .populate("students", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      teams,
    });
  } catch (error) {
    console.error("Get teams error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch teams",
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

    const name = String(body.name || "").trim();
    const mentorId = String(body.mentorId || "").trim();

    const studentIds = Array.isArray(body.studentIds)
      ? body.studentIds.map((id: unknown) => String(id))
      : [];

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Team name is required.",
        },
        { status: 400 }
      );
    }

    if (!mentorId) {
      return NextResponse.json(
        {
          success: false,
          message: "Mentor is required.",
        },
        { status: 400 }
      );
    }

    if (studentIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one student is required.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the selected mentor
    const mentor = await User.findOne({
      _id: mentorId,
      role: "MENTOR",
    }).lean();

    if (!mentor) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected mentor was not found.",
        },
        { status: 400 }
      );
    }

    // Find selected students
    const students = await User.find({
      _id: {
        $in: studentIds,
      },
      role: "STUDENT",
    }).select("_id");

    if (students.length !== studentIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: "One or more selected students are invalid.",
        },
        { status: 400 }
      );
    }

    // Create team
    const team = await Team.create({
      name,
      mentor: mentorId,
      students: studentIds,
      status: "ACTIVE",
    });

    // Get populated team
    const populatedTeam = await Team.findById(team._id)
      .populate("mentor", "name email role")
      .populate("students", "name email role")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Team created successfully.",
        team: populatedTeam,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create team error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create team.",
      },
      { status: 500 }
    );
  }
}