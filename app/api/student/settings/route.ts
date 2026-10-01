import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

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

    const student = await User.findById(session.user.id)
      .select("name email role")
      .lean();

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          message: "Student not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      student,
    });
  } catch (error) {
    console.error("Get student settings error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load settings.",
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

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();

    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");
    const confirmPassword = String(body.confirmPassword || "");

    if (!name || !email) {
      return NextResponse.json(
        {
          success: false,
          message: "Name and email are required.",
        },
        { status: 400 }
      );
    }

    if (newPassword && newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "New password must be at least 6 characters.",
        },
        { status: 400 }
      );
    }

    if (newPassword && !currentPassword) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Current password is required to change your password.",
        },
        { status: 400 }
      );
    }

    if (newPassword && newPassword !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "New password and confirm password do not match.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const student = await User.findById(session.user.id);

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          message: "Student not found.",
        },
        { status: 404 }
      );
    }

    if (student.role !== "STUDENT") {
      return NextResponse.json(
        {
          success: false,
          message: "This account cannot be edited here.",
        },
        { status: 403 }
      );
    }

    const existingUser = await User.findOne({
      email,
      _id: { $ne: session.user.id },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "A user with this email already exists.",
        },
        { status: 409 }
      );
    }

    if (newPassword) {
      const passwordMatch = await bcrypt.compare(
        currentPassword,
        student.password
      );

      if (!passwordMatch) {
        return NextResponse.json(
          {
            success: false,
            message: "Current password is incorrect.",
          },
          { status: 400 }
        );
      }

      student.password = await bcrypt.hash(newPassword, 12);
    }

    student.name = name;
    student.email = email;

    await student.save();

    return NextResponse.json({
      success: true,
      message: newPassword
        ? "Profile and password updated successfully."
        : "Profile updated successfully.",
      student: {
        id: student._id.toString(),
        name: student.name,
        email: student.email,
        role: student.role,
      },
    });
  } catch (error) {
    console.error("Update student settings error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update settings.",
      },
      { status: 500 }
    );
  }
}