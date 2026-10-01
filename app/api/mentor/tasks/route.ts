import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";
import Task from "@/models/Task";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "MENTOR") {
      return NextResponse.json(
        { message: "Unauthorized" },
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

    const tasks = await Task.find({
      team: { $in: teamIds },
    })
      .populate("team", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      tasks,
      total: tasks.length,
    });
  } catch (error) {
    console.error("Mentor tasks error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load tasks",
      },
      { status: 500 }
    );
  }
}