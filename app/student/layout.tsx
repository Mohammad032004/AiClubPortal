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
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { useState } from "react";

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
  {
    name: "Settings",
    href: "/student/settings",
    icon: Settings,
  },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const studentName = session?.user?.name || "Student";
  const studentEmail =
    session?.user?.email || "Student Account";

  const studentInitial = studentName.charAt(0).toUpperCase();

  const handleNavigation = () => {
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/login",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:w-64 lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex min-w-0 items-center gap-3">
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

          {/* Mobile Close */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto space-y-1 p-4">
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
                onClick={handleNavigation}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-violet-50 text-violet-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={18} />

                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Bottom */}
        <div className="shrink-0 border-t border-slate-200 p-4">
          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="mb-3 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />

            <span>Logout</span>
          </button>

          {/* Profile */}
          <div className="flex min-w-0 items-center gap-3 rounded-xl bg-slate-50 p-3">
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

      {/* Main Area */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          {/* Left Side */}
          <div className="flex min-w-0 items-center gap-3">
            {/* Mobile Menu */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                Student Portal
              </p>

              <p className="hidden text-xs text-slate-400 sm:block">
                Learn, complete tasks and build projects.
              </p>
            </div>
          </div>

          {/* Header Right */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Notifications */}
            <Link
              href="/student/notifications"
              aria-label="Notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <Bell size={19} />

              {/* Unread indicator */}
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-violet-600" />
            </Link>

            {/* Profile */}
            <div className="hidden text-right sm:block">
              <p className="max-w-32 truncate text-sm font-semibold text-slate-800">
                {studentName}
              </p>

              <p className="text-xs text-slate-400">
                Student
              </p>
            </div>

            {/* Avatar */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
              {studentInitial}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-w-0 p-3 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}