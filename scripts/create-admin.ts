import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "../lib/mongodb";
import User from "../models/User";

async function createAdmin() {
  try {
    await connectDB();

    const email = "admin@aiclub.com";
    const password = "Admin@123";

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Admin account already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name: "AI Club Admin",
      email,
      password: hashedPassword,
      role: "ADMIN",
    });

    console.log("Admin account created successfully.");
    console.log("Email:", email);
    console.log("Password:", password);

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin();