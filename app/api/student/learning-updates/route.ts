import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import LearningUpdate from "@/models/LearningUpdate";
import Learning from "@/models/Learning";

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

    const updates = await LearningUpdate.find({
      student: session.user.id,
    })
      .populate("learningResource", "title")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      updates,
    });
  } catch (error) {
    console.error("Get learning updates error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load learning updates.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();

    const learningResource = String(
      body.learningResource || ""
    ).trim();

    const learned = String(body.learned || "").trim();
    const practiced = String(body.practiced || "").trim();
    const doubts = String(body.doubts || "").trim();

    if (!learningResource || !learned || !practiced) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Learning resource, what you learned, and what you practiced are required.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const resource = await Learning.findById(learningResource).lean();

    if (!resource) {
      return NextResponse.json(
        {
          success: false,
          message: "Learning resource not found.",
        },
        { status: 404 }
      );
    }

    const update = await LearningUpdate.create({
      student: session.user.id,
      learningResource,
      learned,
      practiced,
      doubts,
      status: "PENDING",
      mentorFeedback: "",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Learning update submitted successfully.",
        update,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create learning update error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit learning update.",
      },
      { status: 500 }
    );
  }
}