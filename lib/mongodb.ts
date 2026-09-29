import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (typeof MONGODB_URI !== "string" || MONGODB_URI.length === 0) {
  throw new Error("Please define MONGODB_URI in your .env.local file");
}

export async function connectDB() {
  try {
    const connection = await mongoose.connect(MONGODB_URI);

    console.log("MongoDB connected successfully");

    return connection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw new Error("Failed to connect to MongoDB");
  }
}