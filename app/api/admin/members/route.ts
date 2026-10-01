import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const members = await User.find({
      role: { $in: ["MENTOR", "STUDENT"] },
    })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      members,
    });
  } catch (error) {
    console.error("Get members error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch members",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const role = String(body.role || "");

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email, password and role are required.",
        },
        { status: 400 }
      );
    }

    if (role !== "MENTOR" && role !== "STUDENT") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid role.",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "A user with this email already exists.",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const member = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Member created successfully.",
        member: {
          id: member._id.toString(),
          name: member.name,
          email: member.email,
          role: member.role,
          createdAt: member.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create member error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create member",
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
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const memberId = String(body.memberId || "").trim();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!memberId || !name || !email) {
      return NextResponse.json(
        {
          success: false,
          message: "Member ID, name and email are required.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const member = await User.findById(memberId);

    if (!member) {
      return NextResponse.json(
        {
          success: false,
          message: "Member not found.",
        },
        { status: 404 }
      );
    }

    if (member.role !== "MENTOR" && member.role !== "STUDENT") {
      return NextResponse.json(
        {
          success: false,
          message: "This account cannot be edited here.",
        },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({
      email,
      _id: { $ne: memberId },
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

    member.name = name;
    member.email = email;

    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          {
            success: false,
            message: "Password must be at least 6 characters.",
          },
          { status: 400 }
        );
      }

      member.password = await bcrypt.hash(password, 12);
    }

    await member.save();

    return NextResponse.json({
      success: true,
      message: "Member updated successfully.",
      member: {
        id: member._id.toString(),
        name: member.name,
        email: member.email,
        role: member.role,
        createdAt: member.createdAt,
      },
    });
  } catch (error) {
    console.error("Update member error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update member",
      },
      { status: 500 }
    );
  }
}