
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "MENTOR" | "STUDENT";
      isSuspended: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "ADMIN" | "MENTOR" | "STUDENT";
    isSuspended?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "ADMIN" | "MENTOR" | "STUDENT";
    isSuspended?: boolean;
  }
}
