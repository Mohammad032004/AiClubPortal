import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";

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
      .populate("mentor", "name email role")
      .populate("students", "name email role")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      teams,
    });
  } catch (error) {
    console.error("Mentor teams error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load teams",
      },
      { status: 500 }
    );
  }
}