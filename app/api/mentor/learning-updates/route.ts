import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import LearningUpdate from "@/models/LearningUpdate";
import Team from "@/models/Team";

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

    // Find teams assigned to this mentor
    const teams = await Team.find({
      mentor: session.user.id,
    })
      .select("_id students")
      .lean();

    const studentIds = teams.flatMap((team) => team.students);

    // Get learning updates only from those students
    const updates = await LearningUpdate.find({
      student: { $in: studentIds },
    })
      .populate("student", "name email")
      .populate("learningResource", "title")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      updates,
    });
  } catch (error) {
    console.error(
      "Mentor learning updates error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load learning updates.",
      },
      { status: 500 }
    );
  }
}