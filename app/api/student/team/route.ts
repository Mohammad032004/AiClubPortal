import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";

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
    })
      .populate("mentor", "name email")
      .populate("students", "name email role")
      .lean();

    if (!team) {
      return NextResponse.json({
        success: true,
        team: null,
      });
    }

    // Support older team documents that use `members`
    let members = team.students || [];

    if (
      (!members || members.length === 0) &&
      Array.isArray(team.members)
    ) {
      const User = (await import("@/models/User")).default;

      members = await User.find({
        _id: { $in: team.members },
      })
        .select("name email role")
        .lean();
    }

    return NextResponse.json({
      success: true,
      team: {
        _id: team._id,
        name: team.name,
        status: team.status || "ACTIVE",
        mentor: team.mentor || null,
        students: members,
        createdAt: team.createdAt,
      },
    });
  } catch (error) {
    console.error("Student team error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch team",
      },
      { status: 500 }
    );
  }
}