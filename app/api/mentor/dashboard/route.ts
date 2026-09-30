import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";
import Learning from "@/models/Learning";
import Task from "@/models/Task";
import Project from "@/models/Project";

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

    const mentorId = session.user.id;

    const teams = await Team.find({
      mentor: mentorId,
    }).lean();

    const teamIds = teams.map((team) => team._id);

    const [
      totalStudents,
      totalLearning,
      activeLearning,
      totalTasks,
      pendingTasks,
      completedTasks,
      totalProjects,
      activeProjects,
    ] = await Promise.all([
      Team.aggregate([
        { $match: { mentor: session.user.id } },
        { $unwind: "$students" },
        { $count: "count" },
      ]),

      Learning.countDocuments({
        team: { $in: teamIds },
      }),

      Learning.countDocuments({
        team: { $in: teamIds },
        status: "ACTIVE",
      }),

      Task.countDocuments({
        team: { $in: teamIds },
      }),

      Task.countDocuments({
        team: { $in: teamIds },
        status: { $in: ["PENDING", "IN_PROGRESS"] },
      }),

      Task.countDocuments({
        team: { $in: teamIds },
        status: "COMPLETED",
      }),

      Project.countDocuments({
        team: { $in: teamIds },
      }),

      Project.countDocuments({
        team: { $in: teamIds },
        status: { $in: ["PLANNING", "IN_PROGRESS"] },
      }),
    ]);

    return NextResponse.json({
      success: true,
      mentor: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
      stats: {
        teams: teams.length,
        students: totalStudents[0]?.count || 0,
        learning: totalLearning,
        activeLearning,
        tasks: totalTasks,
        pendingTasks,
        completedTasks,
        projects: totalProjects,
        activeProjects,
      },
      teams,
    });
  } catch (error) {
    console.error("Mentor dashboard error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load mentor dashboard",
      },
      { status: 500 }
    );
  }
}