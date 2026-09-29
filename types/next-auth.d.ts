import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "MENTOR" | "STUDENT";
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMIN" | "MENTOR" | "STUDENT";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "MENTOR" | "STUDENT";
  }
}