import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";

export default async function PortalPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  if (session.user.role === "MENTOR") {
    redirect("/mentor/dashboard");
  }

  if (session.user.role === "STUDENT") {
    redirect("/student/dashboard");
  }

  redirect("/login");
}