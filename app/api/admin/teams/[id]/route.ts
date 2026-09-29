import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";
import User from "@/models/User";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: Request,
  context: RouteContext
) {
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

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Team ID is required.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const team = await Team.findById(id)
      .populate("mentor", "name email role")
      .populate("students", "name email role")
      .lean();

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          message: "Team not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      team,
    });
  } catch (error) {
    console.error("Get team details error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch team details.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
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

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Team ID is required.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const name =
      body.name !== undefined
        ? String(body.name).trim()
        : undefined;

    const mentorId =
      body.mentorId !== undefined
        ? String(body.mentorId).trim()
        : undefined;

    const studentIds =
      body.studentIds !== undefined
        ? Array.isArray(body.studentIds)
          ? body.studentIds.map((id: unknown) => String(id))
          : null
        : undefined;

    const status =
      body.status !== undefined
        ? String(body.status)
        : undefined;

    if (name !== undefined && !name) {
      return NextResponse.json(
        {
          success: false,
          message: "Team name cannot be empty.",
        },
        { status: 400 }
      );
    }

    if (
      status !== undefined &&
      !["ACTIVE", "COMPLETED", "PENDING"].includes(status)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid team status.",
        },
        { status: 400 }
      );
    }

    if (studentIds === null) {
      return NextResponse.json(
        {
          success: false,
          message: "studentIds must be an array.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const existingTeam = await Team.findById(id);

    if (!existingTeam) {
      return NextResponse.json(
        {
          success: false,
          message: "Team not found.",
        },
        { status: 404 }
      );
    }

    if (mentorId !== undefined) {
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
    }

    if (studentIds !== undefined) {
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
    }

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    if (mentorId !== undefined) {
      updateData.mentor = mentorId;
    }

    if (studentIds !== undefined) {
      updateData.students = studentIds;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    const updatedTeam = await Team.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("mentor", "name email role")
      .populate("students", "name email role")
      .lean();

    return NextResponse.json({
      success: true,
      message: "Team updated successfully.",
      team: updatedTeam,
    });
  } catch (error) {
    console.error("Update team error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update team.",
      },
      { status: 500 }
    );
  }
}