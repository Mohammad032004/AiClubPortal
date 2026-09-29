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
      .lean();

    if (!team) {
      return NextResponse.json({
        success: true,
        student: {
          name: session.user.name || "Student",
          email: session.user.email || "",
        },
        team: null,
        stats: {
          learning: 0,
          activeLearning: 0,
          tasks: 0,
          pendingTasks: 0,
          completedTasks: 0,
          projects: 0,
        },
        currentProject: null,
      });
    }

    const teamId = team._id;

    const [
      learningCount,
      activeLearningCount,
      taskCount,
      pendingTaskCount,
      completedTaskCount,
      projectCount,
      currentProject,
    ] = await Promise.all([
      Learning.countDocuments({ team: teamId }),

      Learning.countDocuments({
        team: teamId,
        status: "ACTIVE",
      }),

      Task.countDocuments({ team: teamId }),

      Task.countDocuments({
        team: teamId,
        status: {
          $in: ["PENDING", "IN_PROGRESS"],
        },
      }),

      Task.countDocuments({
        team: teamId,
        status: "COMPLETED",
      }),

      Project.countDocuments({ team: teamId }),

      Project.findOne({
        team: teamId,
        status: {
          $in: ["PLANNING", "IN_PROGRESS"],
        },
      })
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    return NextResponse.json({
      success: true,

      student: {
        name: session.user.name || "Student",
        email: session.user.email || "",
      },

      team: {
        _id: team._id,
        name: team.name,
        status: team.status || "ACTIVE",
        mentor: team.mentor || null,
      },

      stats: {
        learning: learningCount,
        activeLearning: activeLearningCount,
        tasks: taskCount,
        pendingTasks: pendingTaskCount,
        completedTasks: completedTaskCount,
        projects: projectCount,
      },

      currentProject: currentProject
        ? {
            _id: currentProject._id,
            title: currentProject.title,
            status: currentProject.status,
            progress: currentProject.progress || 0,
          }
        : null,
    });
  } catch (error) {
    console.error("Student dashboard error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard",
      },
      { status: 500 }
    );
  }
}