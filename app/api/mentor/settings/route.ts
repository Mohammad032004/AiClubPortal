import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function PATCH(request: Request) {
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

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const currentPassword =
      typeof body.currentPassword === "string"
        ? body.currentPassword
        : "";

    const newPassword =
      typeof body.newPassword === "string"
        ? body.newPassword
        : "";

    await connectDB();

    const user = await User.findById(session.user.id);

    if (!user || user.role !== "MENTOR") {
      return NextResponse.json(
        {
          success: false,
          message: "Mentor account not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Password update
     */
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Current password is required.",
          },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          {
            success: false,
            message:
              "New password must be at least 6 characters.",
          },
          { status: 400 }
        );
      }

      const passwordMatch = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!passwordMatch) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Current password is incorrect.",
          },
          { status: 400 }
        );
      }

      user.password = await bcrypt.hash(
        newPassword,
        12
      );
    }

    /*
     * Profile update
     */
    if (body.name !== undefined) {
      if (!name) {
        return NextResponse.json(
          {
            success: false,
            message: "Name is required.",
          },
          { status: 400 }
        );
      }

      user.name = name;
    }

    if (body.email !== undefined) {
      if (!email) {
        return NextResponse.json(
          {
            success: false,
            message: "Email is required.",
          },
          { status: 400 }
        );
      }

      const existingUser = await User.findOne({
        email,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            message:
              "This email address is already in use.",
          },
          { status: 400 }
        );
      }

      user.email = email;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully.",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "Mentor settings error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update mentor settings.",
      },
      { status: 500 }
    );
  }
}