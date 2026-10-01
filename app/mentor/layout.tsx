"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  UsersRound,
  BookOpenCheck,
  BookOpen,
  CheckSquare,
  FolderKanban,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  {
    name: "Dashboard",
    href: "/mentor/dashboard",
    icon: LayoutDashboard,
  },
  {
  name: "Learning Updates",
  href: "/mentor/learning-updates",
  icon: BookOpenCheck,
},
  {
    name: "Members",
    href: "/mentor/members",
    icon: UsersRound,
  },
  {
    name: "Learning",
    href: "/mentor/learning",
    icon: BookOpen,
  },
  {
    name: "Tasks",
    href: "/mentor/tasks",
    icon: CheckSquare,
  },
  {
    name: "Projects",
    href: "/mentor/projects",
    icon: FolderKanban,
  },
];

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const memberName = session?.user?.name || "Member";
  const memberEmail = session?.user?.email || "Member Account";
  const memberInitial = memberName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-sm">
              <UsersRound size={21} />
            </div>

            <div>
              <h1 className="text-base font-bold tracking-tight">
                AI CLUB
              </h1>

              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Workspace
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              const isActive =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
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
        </div>

        {/* Account */}
        <div className="border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={async () => {
              await signOut({ redirect: false });
              window.location.href = "/login";
            }}
            className="mb-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>

          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
              {memberInitial}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">
                {memberName}
              </p>

              <p className="truncate text-xs text-slate-400">
                {memberEmail}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={21} />
            </button>

            <div>
              <p className="text-xs font-medium text-slate-400">
                AI Club
              </p>

              <h2 className="text-lg font-semibold">
                Workspace
              </h2>
            </div>
          </div>

          {/* Profile */}
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {memberName}
              </p>

              <p className="text-xs text-slate-400">
                Account
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
              {memberInitial}
            </div>
          </div>
        </header>

        {/* Page */}
        <main>{children}</main>
      </div>
    </div>
  );
}