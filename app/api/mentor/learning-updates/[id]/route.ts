import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import LearningUpdate from "@/models/LearningUpdate";
import Team from "@/models/Team";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: RouteContext
) {
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

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid learning update ID.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const status = String(body.status || "").trim();

    const mentorFeedback = String(
      body.mentorFeedback || ""
    ).trim();

    if (
      status !== "APPROVED" &&
      status !== "REVISION_REQUIRED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid review status.",
        },
        { status: 400 }
      );
    }

    if (status === "REVISION_REQUIRED" && !mentorFeedback) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Feedback is required when requesting a revision.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const update = await LearningUpdate.findById(id).lean();

    if (!update) {
      return NextResponse.json(
        {
          success: false,
          message: "Learning update not found.",
        },
        { status: 404 }
      );
    }

    // Make sure this student's update belongs
    // to a team assigned to the logged-in mentor.
    const mentorTeam = await Team.findOne({
      mentor: session.user.id,
      students: update.student,
    })
      .select("_id")
      .lean();

    if (!mentorTeam) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You are not authorized to review this update.",
        },
        { status: 403 }
      );
    }

    const updated = await LearningUpdate.findByIdAndUpdate(
      id,
      {
        $set: {
          status,
          mentorFeedback,
        },
      },
      {
        new: true,
      }
    )
      .populate("student", "name email")
      .populate("learningResource", "title")
      .lean();

    return NextResponse.json({
      success: true,
      message:
        status === "APPROVED"
          ? "Learning update approved successfully."
          : "Revision requested successfully.",
      update: updated,
    });
  } catch (error) {
    console.error(
      "Review learning update error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to review learning update.",
      },
      { status: 500 }
    );
  }
}