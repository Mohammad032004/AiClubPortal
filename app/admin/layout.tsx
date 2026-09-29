"use client";

import {
  Bell,
  BookOpen,
  CheckSquare,
  ChevronDown,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  UserRoundCog,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const navigation = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
  },
  {
    name: "Members",
    icon: Users,
    href: "/admin/members",
  },
  {
    name: "Mentors",
    icon: UserRoundCog,
    href: "/admin/mentors",
  },
  {
    name: "Teams",
    icon: Users,
    href: "/admin/teams",
  },
  {
    name: "Learning",
    icon: BookOpen,
    href: "/admin/learning",
  },
  {
    name: "Tasks",
    icon: CheckSquare,
    href: "/admin/tasks",
  },
  {
    name: "Projects",
    icon: FolderKanban,
    href: "/admin/projects",
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-sm">
              <ShieldCheck size={21} />
            </div>

            <div>
              <h1 className="text-base font-bold tracking-tight">
                AI CLUB
              </h1>

              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Management Portal
              </p>
            </div>
          </div>

          <button
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

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <p className="mb-3 mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
            System
          </p>

          <Link
            href="/admin/settings"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <Settings size={18} />
            Settings
          </Link>
        </div>

        {/* Admin Profile */}
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-xl p-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
              AC
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                AI Club Admin
              </p>

              <p className="truncate text-xs text-slate-400">
                Administrator
              </p>
            </div>

            <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <div className="lg:pl-64">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={21} />
            </button>

            <div>
              <p className="text-xs font-medium text-slate-400">
                AI Club Management
              </p>

              <h2 className="text-lg font-semibold">
                Admin Portal
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900">
              <Bell size={19} />

              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-violet-600" />
            </button>

            {/* Profile */}
            <button className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 transition hover:bg-slate-50 sm:flex">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                AC
              </div>

              <span className="text-sm font-medium">
                Admin
              </span>

              <ChevronDown
                size={15}
                className="text-slate-400"
              />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main>{children}</main>
      </div>
    </div>
  );
}