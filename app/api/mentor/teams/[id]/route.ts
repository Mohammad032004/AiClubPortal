import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";

export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "MENTOR") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid team ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const team = await Team.findOne({
      _id: id,
      mentor: session.user.id,
    })
      .populate("mentor", "name email role")
      .populate("students", "name email role")
      .lean();

    if (!team) {
      return NextResponse.json(
        { message: "Team not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      team,
    });
  } catch (error) {
    console.error("Mentor team details error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load team",
      },
      { status: 500 }
    );
  }
}