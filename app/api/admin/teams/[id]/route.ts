import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

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