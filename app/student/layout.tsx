"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  FolderKanban,
  Users,
  LogOut,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/student/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Learning",
    href: "/student/learning",
    icon: BookOpen,
  },
  {
    name: "Tasks",
    href: "/student/tasks",
    icon: ClipboardList,
  },
  {
    name: "Projects",
    href: "/student/projects",
    icon: FolderKanban,
  },
  {
    name: "My Team",
    href: "/student/team",
    icon: Users,
  },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const studentName = session?.user?.name || "Student";
  const studentEmail =
    session?.user?.email || "Student Account";
  const studentInitial = studentName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        {/* AI Club Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center">
            <Image
              src="/ai-club-logo.png"
              alt="AI Club Logo"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
              priority
            />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900">
              AI Club
            </p>

            <p className="text-xs text-slate-400">
              Student Portal
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-violet-50 text-violet-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Sidebar */}
        <div className="border-t border-slate-200 p-4">
          {/* Logout */}
          <button
            type="button"
            onClick={() =>
              signOut({
                callbackUrl: "/login",
              })
            }
            className="mb-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>

          {/* Student Profile */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
              {studentInitial}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">
                {studentName}
              </p>

              <p className="truncate text-xs text-slate-400">
                {studentEmail}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Student Portal
            </p>

            <p className="hidden text-xs text-slate-400 sm:block">
              Learn, complete tasks and build projects.
            </p>
          </div>

          {/* Student Profile */}
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {studentName}
              </p>

              <p className="text-xs text-slate-400">
                Student
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
              {studentInitial}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}