import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Team from "@/models/Team";
import Learning from "@/models/Learning";
import Task from "@/models/Task";
import Project from "@/models/Project";

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

    const student = await User.findById(studentId)
      .select("name email role")
      .lean();

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    // Find the student's team.
    // The second condition also supports older team records
    // that used the "members" field.
    const team = await Team.findOne({
      $or: [
        { students: studentId },
        { members: studentId },
      ],
    })
      .populate("mentor", "name email")
      .populate("students", "name email")
      .lean();

    const teamId = team?._id;

    let learningCount = 0;
    let activeLearningCount = 0;
    let pendingTasks = 0;
    let completedTasks = 0;
    let totalTasks = 0;
    let projectCount = 0;
    let currentProject = null;

    if (teamId) {
      learningCount = await Learning.countDocuments({
        team: teamId,
      });

      activeLearningCount = await Learning.countDocuments({
        team: teamId,
        status: "ACTIVE",
      });

      pendingTasks = await Task.countDocuments({
        team: teamId,
        status: { $in: ["PENDING", "IN_PROGRESS"] },
      });

      completedTasks = await Task.countDocuments({
        team: teamId,
        status: "COMPLETED",
      });

      totalTasks = await Task.countDocuments({
        team: teamId,
      });

      projectCount = await Project.countDocuments({
        team: teamId,
      });

      currentProject = await Project.findOne({
        team: teamId,
        status: { $in: ["PLANNING", "IN_PROGRESS"] },
      })
        .sort({ createdAt: -1 })
        .select(
          "title description status progress demoUrl documentationUrl createdAt"
        )
        .lean();
    }

    return NextResponse.json({
      success: true,
      student,
      team: team || null,
      stats: {
        learningCount,
        activeLearningCount,
        pendingTasks,
        completedTasks,
        totalTasks,
        projectCount,
      },
      currentProject,
    });
  } catch (error) {
    console.error("Student dashboard error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load student dashboard",
      },
      { status: 500 }
    );
  }
}