import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";
import User from "@/models/User";
import Notification from "@/models/Notification";

const notificationTypes = [
  "GENERAL",
  "LEARNING",
  "TASK",
  "PROJECT",
  "TEAM",
  "SYSTEM",
] as const;

export async function GET() {
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

    await connectDB();

    const teams = await Team.find({
      mentor: session.user.id,
    })
      .select("_id name students")
      .populate("students", "name email")
      .lean();

    const studentIds = teams.flatMap((team) =>
      (team.students || []).map((student) => student._id)
    );

    const notifications = await Notification.find({
      recipient: { $in: studentIds },
    })
      .populate("recipient", "name email")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({
      success: true,
      students: teams.flatMap((team) =>
        (team.students || []).map((student) => ({
          _id: student._id,
          name: student.name,
          email: student.email,
          team: {
            _id: team._id,
            name: team.name,
          },
        }))
      ),
      notifications,
    });
  } catch (error) {
    console.error(
      "Mentor notifications GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load notifications.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();

    const recipientIds = Array.isArray(body.recipientIds)
      ? body.recipientIds
      : [];

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    const type =
      typeof body.type === "string"
        ? body.type.trim()
        : "GENERAL";

    const link =
      typeof body.link === "string"
        ? body.link.trim()
        : "";

    if (recipientIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please select at least one student.",
        },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification title is required.",
        },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification message is required.",
        },
        { status: 400 }
      );
    }

    if (
      !notificationTypes.includes(
        type as (typeof notificationTypes)[number]
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid notification type.",
        },
        { status: 400 }
      );
    }

    const uniqueRecipientIds = [
      ...new Set(
        recipientIds.map((id: unknown) => String(id))
      ),
    ];

    const invalidId = uniqueRecipientIds.some(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );

    if (invalidId) {
      return NextResponse.json(
        {
          success: false,
          message: "One or more student IDs are invalid.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    /*
     * Find all students belonging to teams
     * assigned to this mentor.
     */
    const teams = await Team.find({
      mentor: session.user.id,
    })
      .select("students")
      .lean();

    const mentorStudentIds = new Set(
      teams.flatMap((team) =>
        (team.students || []).map((studentId) =>
          studentId.toString()
        )
      )
    );

    /*
     * Make sure the mentor can only send
     * notifications to their own students.
     */
    const unauthorizedRecipient =
      uniqueRecipientIds.some(
        (studentId) =>
          !mentorStudentIds.has(studentId)
      );

    if (unauthorizedRecipient) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You can only send notifications to students in your assigned teams.",
        },
        { status: 403 }
      );
    }

    /*
     * Verify that all recipients are students.
     */
    const students = await User.find({
      _id: {
        $in: uniqueRecipientIds,
      },
      role: "STUDENT",
    })
      .select("_id name email")
      .lean();

    if (students.length !== uniqueRecipientIds.length) {
      return NextResponse.json(
        {
          success: false,
          message:
            "One or more selected recipients are invalid.",
        },
        { status: 400 }
      );
    }

    const notifications = await Notification.insertMany(
      uniqueRecipientIds.map((recipientId) => ({
        recipient: recipientId,
        title,
        message,
        type,
        read: false,
        link,
      }))
    );

    return NextResponse.json(
      {
        success: true,
        message:
          uniqueRecipientIds.length === 1
            ? "Notification sent successfully."
            : `Notification sent to ${uniqueRecipientIds.length} students.`,
        count: notifications.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Mentor notification POST error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send notification.",
      },
      { status: 500 }
    );
  }
}