
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

type MentorAction = "suspend" | "activate";

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return false;
  }

  return true;
}

function normalizeEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validMentorId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET /api/admin/mentors
// List mentor accounts without exposing password hashes.
export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return jsonError("Unauthorized.", 401);
    }

    await connectDB();

    const mentors = await User.find({ role: "MENTOR" })
      .select("_id name email role createdAt updatedAt isSuspended")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      mentors: mentors.map((mentor) => ({
        id: mentor._id.toString(),
        name: mentor.name,
        email: mentor.email,
        role: mentor.role,
        createdAt: mentor.createdAt,
        updatedAt: mentor.updatedAt,
        isSuspended: Boolean(mentor.isSuspended),
      })),
    });
  } catch (error) {
    console.error("GET mentors error:", error);
    return jsonError("Failed to fetch mentors.", 500);
  }
}

// POST /api/admin/mentors
// Create a mentor account.
export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return jsonError("Unauthorized.", 401);
    }

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON request body.", 400);
    }

    const name = String(body.name ?? "").trim();
    const email = normalizeEmail(body.email);
    const password = String(body.password ?? "");

    if (!name || !email || !password) {
      return jsonError(
        "Name, email and password are required.",
        400
      );
    }

    if (name.length > 100) {
      return jsonError(
        "Name cannot exceed 100 characters.",
        400
      );
    }

    if (!validEmail(email) || email.length > 254) {
      return jsonError("Enter a valid email address.", 400);
    }

    if (password.length < 6 || password.length > 128) {
      return jsonError(
        "Password must contain 6–128 characters.",
        400
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email })
      .select("_id")
      .lean();

    if (existingUser) {
      return jsonError(
        "A user with this email already exists.",
        409
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const mentor = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "MENTOR",
      isSuspended: false,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Mentor created successfully.",
        mentor: {
          id: mentor._id.toString(),
          name: mentor.name,
          email: mentor.email,
          role: mentor.role,
          createdAt: mentor.createdAt,
          isSuspended: Boolean(mentor.isSuspended),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // Also handles concurrent requests for a unique email.
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      return jsonError(
        "A user with this email already exists.",
        409
      );
    }

    console.error("POST mentor error:", error);
    return jsonError("Failed to create mentor.", 500);
  }
}

// PATCH /api/admin/mentors
// Edit a mentor or suspend/activate the account.
//
// Edit body:
// { memberId, name, email, password? }
//
// Status body:
// { memberId, action: "suspend" | "activate" }
export async function PATCH(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return jsonError("Unauthorized.", 401);
    }

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON request body.", 400);
    }

    const memberId = String(body.memberId ?? "").trim();

    if (!memberId || !validMentorId(memberId)) {
      return jsonError("A valid mentor ID is required.", 400);
    }

    await connectDB();

    const mentor = await User.findOne({
      _id: memberId,
      role: "MENTOR",
    });

    if (!mentor) {
      return jsonError("Mentor not found.", 404);
    }

    const action = String(body.action ?? "");

    if (action === "suspend" || action === "activate") {
      mentor.set(
        "isSuspended",
        action === "suspend"
      );

      await mentor.save();

      return NextResponse.json({
        success: true,
        message:
          action === "suspend"
            ? "Mentor suspended successfully."
            : "Mentor activated successfully.",
        mentor: {
          id: mentor._id.toString(),
          name: mentor.name,
          email: mentor.email,
          role: mentor.role,
          isSuspended: Boolean(mentor.get("isSuspended")),
        },
      });
    }

    // Edit mentor details.
    const name = String(body.name ?? "").trim();
    const email = normalizeEmail(body.email);
    const password = String(body.password ?? "");

    if (!name || !email) {
      return jsonError(
        "Name and email are required.",
        400
      );
    }

    if (name.length > 100) {
      return jsonError(
        "Name cannot exceed 100 characters.",
        400
      );
    }

    if (!validEmail(email) || email.length > 254) {
      return jsonError("Enter a valid email address.", 400);
    }

    if (password && (password.length < 6 || password.length > 128)) {
      return jsonError(
        "Password must contain 6–128 characters.",
        400
      );
    }

    const existingUser = await User.findOne({
      email,
      _id: { $ne: mentor._id },
    })
      .select("_id")
      .lean();

    if (existingUser) {
      return jsonError(
        "A user with this email already exists.",
        409
      );
    }

    mentor.name = name;
    mentor.email = email;

    if (password) {
      mentor.password = await bcrypt.hash(password, 12);
    }

    await mentor.save();

    return NextResponse.json({
      success: true,
      message: "Mentor updated successfully.",
      mentor: {
        id: mentor._id.toString(),
        name: mentor.name,
        email: mentor.email,
        role: mentor.role,
        createdAt: mentor.createdAt,
        updatedAt: mentor.updatedAt,
        isSuspended: Boolean(mentor.get("isSuspended")),
      },
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      return jsonError(
        "A user with this email already exists.",
        409
      );
    }

    console.error("PATCH mentor error:", error);
    return jsonError("Failed to update mentor.", 500);
  }
}

// DELETE /api/admin/mentors
// Permanently delete a mentor account.
export async function DELETE(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return jsonError("Unauthorized.", 401);
    }

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON request body.", 400);
    }

    const memberId = String(body.memberId ?? "").trim();

    if (!memberId || !validMentorId(memberId)) {
      return jsonError("A valid mentor ID is required.", 400);
    }

    await connectDB();

    const result = await User.deleteOne({
      _id: memberId,
      role: "MENTOR",
    });

    if (result.deletedCount === 0) {
      return jsonError("Mentor not found.", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Mentor account deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE mentor error:", error);
    return jsonError("Failed to delete mentor.", 500);
  }
}
