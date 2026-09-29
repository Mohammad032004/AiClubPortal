import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Settings from "@/models/Settings";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    let settings = await Settings.findOne().lean();

    if (!settings) {
      const createdSettings = await Settings.create({
        clubName: "AI Club",
        description:
          "Learning, building and growing together with Artificial Intelligence.",
        notifications: true,
        emailNotifications: true,
        updatedBy: session.user.id,
      });

      settings = createdSettings.toObject();
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Get settings error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch settings",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      clubName,
      description,
      notifications,
      emailNotifications,
    } = body;

    if (clubName !== undefined && !String(clubName).trim()) {
      return NextResponse.json(
        { message: "Club name cannot be empty" },
        { status: 400 }
      );
    }

    if (
      notifications !== undefined &&
      typeof notifications !== "boolean"
    ) {
      return NextResponse.json(
        { message: "Invalid notifications value" },
        { status: 400 }
      );
    }

    if (
      emailNotifications !== undefined &&
      typeof emailNotifications !== "boolean"
    ) {
      return NextResponse.json(
        { message: "Invalid email notifications value" },
        { status: 400 }
      );
    }

    await connectDB();

    const updateData: Record<string, unknown> = {
      updatedBy: session.user.id,
    };

    if (clubName !== undefined) {
      updateData.clubName = String(clubName).trim();
    }

    if (description !== undefined) {
      updateData.description = String(description).trim();
    }

    if (notifications !== undefined) {
      updateData.notifications = notifications;
    }

    if (emailNotifications !== undefined) {
      updateData.emailNotifications = emailNotifications;
    }

    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: updateData },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).lean();

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Update settings error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update settings",
      },
      { status: 500 }
    );
  }
}