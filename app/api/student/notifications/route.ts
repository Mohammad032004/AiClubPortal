import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";

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

    const notifications = await Notification.find({
      recipient: session.user.id,
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error(
      "Student notifications GET error:",
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

export async function PATCH(request: Request) {
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

    await connectDB();

    if (body.all === true) {
      await Notification.updateMany(
        {
          recipient: session.user.id,
          read: false,
        },
        {
          $set: {
            read: true,
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read.",
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid notification update.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error(
      "Student notifications PATCH error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update notifications.",
      },
      { status: 500 }
    );
  }
}