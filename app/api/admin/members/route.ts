
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return !!session?.user && session.user.role === "ADMIN";
}

// GET: Fetch students only
export async function GET() {
  try {
    if (!(await isAdmin())) {
      return jsonError("Unauthorized", 401);
    }

    await connectDB();

    const members = await User.find({ role: "STUDENT" })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      members,
    });
  } catch (error) {
    console.error("Get students error:", error);
    return jsonError("Failed to fetch students", 500);
  }
}

// POST: Create a student only
export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return jsonError("Unauthorized", 401);
    }

    const body = await request.json();

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!name || !email || !password) {
      return jsonError(
        "Name, email and password are required.",
        400
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonError("Please enter a valid email address.", 400);
    }

    if (password.length < 6) {
      return jsonError(
        "Password must be at least 6 characters.",
        400
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return jsonError(
        "A user with this email already exists.",
        409
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Role is always STUDENT; the client cannot create a mentor here.
    const member = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "STUDENT",
      isSuspended: false,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Student created successfully.",
        member: {
          id: member._id.toString(),
          _id: member._id.toString(),
          name: member.name,
          email: member.email,
          role: member.role,
          isSuspended: member.isSuspended,
          createdAt: member.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create student error:", error);
    return jsonError("Failed to create student", 500);
  }
}

// PATCH: Edit, suspend, or activate a student
export async function PATCH(request: Request) {
  try {
    if (!(await isAdmin())) {
      return jsonError("Unauthorized", 401);
    }

    const body = await request.json();
    const memberId = String(body.memberId || "").trim();

    if (!memberId || !mongoose.isValidObjectId(memberId)) {
      return jsonError("A valid student ID is required.", 400);
    }

    await connectDB();

    // Never allow this endpoint to modify mentors or administrators.
    const member = await User.findOne({
      _id: memberId,
      role: "STUDENT",
    });

    if (!member) {
      return jsonError("Student not found.", 404);
    }

    // Suspend or activate
    if (body.action === "suspend" || body.action === "activate") {
      member.isSuspended = body.action === "suspend";
      await member.save();

      return NextResponse.json({
        success: true,
        message:
          body.action === "suspend"
            ? "Student suspended successfully."
            : "Student activated successfully.",
        member: {
          id: member._id.toString(),
          _id: member._id.toString(),
          name: member.name,
          email: member.email,
          role: member.role,
          isSuspended: member.isSuspended,
          createdAt: member.createdAt,
        },
      });
    }

    // Edit student details
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!name || !email) {
      return jsonError(
        "Student name and email are required.",
        400
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonError("Please enter a valid email address.", 400);
    }

    if (password && password.length < 6) {
      return jsonError(
        "Password must be at least 6 characters.",
        400
      );
    }

    const existingUser = await User.findOne({
      email,
      _id: { $ne: member._id },
    });

    if (existingUser) {
      return jsonError(
        "A user with this email already exists.",
        409
      );
    }

    member.name = name;
    member.email = email;

    if (password) {
      member.password = await bcrypt.hash(password, 12);
    }

    await member.save();

    return NextResponse.json({
      success: true,
      message: "Student updated successfully.",
      member: {
        id: member._id.toString(),
        _id: member._id.toString(),
        name: member.name,
        email: member.email,
        role: member.role,
        isSuspended: member.isSuspended,
        createdAt: member.createdAt,
      },
    });
  } catch (error) {
    console.error("Update student error:", error);
    return jsonError("Failed to update student", 500);
  }
}

// DELETE: Delete a student only
export async function DELETE(request: Request) {
  try {
    if (!(await isAdmin())) {
      return jsonError("Unauthorized", 401);
    }

    const body = await request.json();
    const memberId = String(body.memberId || "").trim();

    if (!memberId || !mongoose.isValidObjectId(memberId)) {
      return jsonError("A valid student ID is required.", 400);
    }

    await connectDB();

    const deletedMember = await User.findOneAndDelete({
      _id: memberId,
      role: "STUDENT",
    });

    if (!deletedMember) {
      return jsonError("Student not found.", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Student deleted successfully.",
      memberId,
    });
  } catch (error) {
    console.error("Delete student error:", error);
    return jsonError("Failed to delete student", 500);
  }
}
