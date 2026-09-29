import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";
import Task from "@/models/Task";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "STUDENT") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const studentId = session.user.id;

    // Find the team assigned to this student.
    const team = await Team.findOne({
      $or: [
        { students: studentId },
        { members: studentId },
      ],
    }).lean();

    if (!team) {
      return NextResponse.json({
        success: true,
        tasks: [],
        team: null,
      });
    }

    // Only return tasks belonging to the student's team.
    const tasks = await Task.find({
      team: team._id,
    })
      .populate("team", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      tasks,
      team: {
        _id: team._id,
        name: team.name,
      },
    });
  } catch (error) {
    console.error("Student tasks error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch tasks",
      },
      { status: 500 }
    );
  }
}