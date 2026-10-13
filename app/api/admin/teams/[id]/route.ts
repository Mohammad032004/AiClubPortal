import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";
import User from "@/models/User";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const VALID_STATUSES = [
  "ACTIVE",
  "COMPLETED",
  "PENDING",
] as const;

type ValidStatus = (typeof VALID_STATUSES)[number];

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected server error occurred.";
}

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);

  return Boolean(
    session?.user && session.user.role === "ADMIN"
  );
}

// GET /api/admin/teams/[id]
// Fetch a team with its mentor and students.
export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    if (!(await requireAdmin())) {
      return jsonError("Unauthorized.", 401);
    }

    const { id } = await context.params;

    if (!mongoose.isValidObjectId(id)) {
      return jsonError("Invalid team ID.", 400);
    }

    await connectDB();

    const team = await Team.findById(id)
      .populate(
        "mentor",
        "name email role isSuspended"
      )
      .populate(
        "students",
        "name email role isSuspended"
      )
      .lean();

    if (!team) {
      return jsonError("Team not found.", 404);
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
        ...(process.env.NODE_ENV === "development"
          ? { details: errorMessage(error) }
          : {}),
      },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/teams/[id]
// Update team name, mentor, students, or status.
export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    if (!(await requireAdmin())) {
      return jsonError("Unauthorized.", 401);
    }

    const { id } = await context.params;

    if (!mongoose.isValidObjectId(id)) {
      return jsonError("Invalid team ID.", 400);
    }

    let body: {
      name?: unknown;
      mentorId?: unknown;
      studentIds?: unknown;
      status?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return jsonError(
        "Invalid JSON request body.",
        400
      );
    }

    const name =
      body.name !== undefined
        ? String(body.name).trim()
        : undefined;

    const mentorId =
      body.mentorId !== undefined
        ? String(body.mentorId).trim()
        : undefined;

    const status =
      body.status !== undefined
        ? String(body.status)
        : undefined;

    let studentIds: string[] | undefined;

    // Validate student IDs.
    if (body.studentIds !== undefined) {
      if (
        !Array.isArray(body.studentIds) ||
        !body.studentIds.every(
          (value: unknown) => typeof value === "string"
        )
      ) {
        return jsonError(
          "studentIds must be an array of ID strings.",
          400
        );
      }

      studentIds = body.studentIds.map(
        (value: string) => value.trim()
      );

      if (studentIds.some((studentId) => !studentId)) {
        return jsonError(
          "Student IDs cannot be empty.",
          400
        );
      }

      if (new Set(studentIds).size !== studentIds.length) {
        return jsonError(
          "Duplicate student IDs are not allowed.",
          400
        );
      }

      if (
        studentIds.some(
          (studentId) =>
            !mongoose.isValidObjectId(studentId)
        )
      ) {
        return jsonError(
          "One or more student IDs are invalid.",
          400
        );
      }
    }

    // Validate team name.
    if (name !== undefined) {
      if (!name) {
        return jsonError(
          "Team name cannot be empty.",
          400
        );
      }

      if (name.length > 100) {
        return jsonError(
          "Team name cannot exceed 100 characters.",
          400
        );
      }
    }

    // Validate team status.
    if (
      status !== undefined &&
      !VALID_STATUSES.includes(status as ValidStatus)
    ) {
      return jsonError(
        "Invalid team status.",
        400
      );
    }

    // Validate mentor ID format.
    if (
      mentorId !== undefined &&
      !mongoose.isValidObjectId(mentorId)
    ) {
      return jsonError(
        "Invalid mentor ID.",
        400
      );
    }

    await connectDB();

    const existingTeam = await Team.findById(id).lean();

    if (!existingTeam) {
      return jsonError("Team not found.", 404);
    }

    // Validate the selected mentor.
    // A suspended mentor may remain assigned to the same team,
    // but cannot be newly assigned.
    if (mentorId !== undefined) {
      const mentor = await User.findOne({
        _id: mentorId,
        role: "MENTOR",
      })
        .select("_id name email role isSuspended")
        .lean();

      if (!mentor) {
        return jsonError(
          "Selected mentor was not found or is not a mentor.",
          400
        );
      }

      const currentMentorId = String(
        existingTeam.mentor
      );

      const isCurrentMentor =
        currentMentorId === mentorId;

      if (mentor.isSuspended && !isCurrentMentor) {
        return jsonError(
          "You cannot assign a suspended mentor.",
          400
        );
      }
    }

    // Validate selected students.
    // Existing suspended students can remain assigned.
    // New assignments must use active students.
    if (studentIds !== undefined) {
      const students = await User.find({
        _id: { $in: studentIds },
        role: "STUDENT",
      })
        .select("_id name email role isSuspended")
        .lean();

      if (students.length !== studentIds.length) {
        return jsonError(
          "One or more selected students were not found or are not students.",
          400
        );
      }

      const existingStudentIds = new Set(
        (existingTeam.students || []).map(
          (studentId: unknown) => String(studentId)
        )
      );

      const suspendedNewAssignments = students.filter(
        (student) =>
          Boolean(student.isSuspended) &&
          !existingStudentIds.has(
            String(student._id)
          )
      );

      if (suspendedNewAssignments.length > 0) {
        return jsonError(
          "You cannot assign suspended students to a team.",
          400
        );
      }
    }

    // Build update fields.
    const updateData: {
      name?: string;
      mentor?: string;
      students?: string[];
      status?: ValidStatus;
    } = {};

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
      updateData.status = status as ValidStatus;
    }

    if (Object.keys(updateData).length === 0) {
      return jsonError(
        "No valid fields were provided to update.",
        400
      );
    }

    // Update and populate the team.
    const updatedTeam = await Team.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate(
        "mentor",
        "name email role isSuspended"
      )
      .populate(
        "students",
        "name email role isSuspended"
      )
      .lean();

    if (!updatedTeam) {
      return jsonError(
        "Team could not be found after updating.",
        404
      );
    }

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
        message:
          process.env.NODE_ENV === "development"
            ? errorMessage(error)
            : "Failed to update team.",
      },
      { status: 500 }
    );
  }
}