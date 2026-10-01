import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";
import User from "@/models/User";

type MentorTeam = {
  _id: unknown;
  name: string;
  students?: unknown[];
};

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

    const teams = (await Team.find({
      mentor: session.user.id,
    })
      .select("_id name students")
      .lean()) as MentorTeam[];

    const studentIds: string[] = [];

    for (const team of teams) {
      if (!team.students) {
        continue;
      }

      for (const student of team.students) {
        studentIds.push(String(student));
      }
    }

    const uniqueStudentIds = [...new Set(studentIds)];

    const students = await User.find({
      _id: { $in: uniqueStudentIds },
      role: "STUDENT",
    })
      .select("_id name email role")
      .sort({ name: 1 })
      .lean();

    const members = students.map((student) => {
      const studentId = String(student._id);

      const team = teams.find((team) => {
        if (!team.students) {
          return false;
        }

        return team.students.some(
          (teamStudent) => String(teamStudent) === studentId
        );
      });

      return {
        ...student,
        team: team
          ? {
              _id: team._id,
              name: team.name,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      members,
      total: members.length,
    });
  } catch (error) {
    console.error("Mentor members error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load members",
      },
      { status: 500 }
    );
  }
}