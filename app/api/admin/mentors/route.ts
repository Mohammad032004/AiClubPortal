
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

type MentorAction = "suspend" | "activate";

type MentorRequestBody = Record<string, unknown>;

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);

  return Boolean(
    session?.user && session.user.role === "ADMIN"
  );
}

function normalizeEmail(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validMentorId(id: string): boolean {
  return mongoose.isValidObjectId(id);
}

function isDuplicateKeyError(
  error: unknown
): error is { code: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

// GET /api/admin/mentors
// Return mentors with both _id and id for frontend compatibility.
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
        _id: mentor._id.toString(),
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

    let body: MentorRequestBody;

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

    const mentorId = mentor._id.toString();

    return NextResponse.json(
      {
        success: true,
        message: "Mentor created successfully.",
        mentor: {
          _id: mentorId,
          id: mentorId,
          name: mentor.name,
          email: mentor.email,
          role: mentor.role,
          createdAt: mentor.createdAt,
          updatedAt: mentor.updatedAt,
          isSuspended: Boolean(mentor.isSuspended),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (isDuplicateKeyError(error)) {
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

    let body: MentorRequestBody;

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

    if (
      action === "suspend" ||
      action === "activate"
    ) {
      const mentorAction = action as MentorAction;

      mentor.set(
        "isSuspended",
        mentorAction === "suspend"
      );

      await mentor.save();

      return NextResponse.json({
        success: true,
        message:
          mentorAction === "suspend"
            ? "Mentor suspended successfully."
            : "Mentor activated successfully.",
        mentor: {
          _id: mentor._id.toString(),
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

    if (
      password &&
      (password.length < 6 || password.length > 128)
    ) {
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
        _id: mentor._id.toString(),
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
    if (isDuplicateKeyError(error)) {
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

    let body: MentorRequestBody;

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
