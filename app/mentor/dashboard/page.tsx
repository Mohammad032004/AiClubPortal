"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckSquare,
  FolderKanban,
  Users,
  UsersRound,
  ArrowRight,
  Clock3,
  CheckCircle2,
} from "lucide-react";

type Team = {
  _id: string;
  name: string;
  status: "ACTIVE" | "COMPLETED" | "PENDING";
  students?: string[];
};

type DashboardData = {
  mentor: {
    id: string;
    name: string;
    email: string;
  };
  stats: {
    teams: number;
    students: number;
    learning: number;
    activeLearning: number;
    tasks: number;
    pendingTasks: number;
    completedTasks: number;
    projects: number;
    activeProjects: number;
  };
  teams: Team[];
};

export default function MentorDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch("/api/mentor/dashboard");

        if (!response.ok) {
          throw new Error("Failed to load dashboard");
        }

        const result = await response.json();

        if (result.success) {
          setData(result);
        }
      } catch (error) {
        console.error("Mentor dashboard error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-sm text-slate-500">
          Loading mentor dashboard...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
          Failed to load mentor dashboard.
        </div>
      </div>
    );
  }

  const { stats, teams, mentor } = data;

  const statCards = [
    {
      title: "My Teams",
      value: stats.teams,
      description: "Assigned teams",
      icon: UsersRound,
      iconClass: "bg-violet-50 text-violet-600",
    },
    {
      title: "Students",
      value: stats.students,
      description: "Students under you",
      icon: Users,
      iconClass: "bg-cyan-50 text-cyan-600",
    },
    {
      title: "Learning",
      value: stats.activeLearning,
      description: `${stats.learning} total learning items`,
      icon: BookOpen,
      iconClass: "bg-blue-50 text-blue-600",
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasks,
      description: `${stats.completedTasks} completed`,
      icon: CheckSquare,
      iconClass: "bg-amber-50 text-amber-600",
    },
    {
      title: "Active Projects",
      value: stats.activeProjects,
      description: `${stats.projects} total projects`,
      icon: FolderKanban,
      iconClass: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div>
          <p className="text-sm font-medium text-violet-600">
            Mentor Workspace
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Welcome, {mentor.name?.split(" ")[0] || "Mentor"} 👋
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your teams, review student progress and guide projects.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {card.title}
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {card.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconClass}`}
                  >
                    <Icon size={19} />
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-400">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Teams */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    My Teams
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Teams assigned to you
                  </p>
                </div>

                <Link
                  href="/mentor/teams"
                  className="flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-700"
                >
                  View all
                  <ArrowRight size={15} />
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {teams.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <UsersRound
                      size={30}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-medium text-slate-600">
                      No teams assigned
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Teams assigned to you will appear here.
                    </p>
                  </div>
                ) : (
                  teams.slice(0, 5).map((team) => (
                    <Link
                      key={team._id}
                      href={`/mentor/teams/${team._id}`}
                      className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50 sm:px-6"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                          <UsersRound size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {team.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {team.students?.length || 0} students
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            team.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-600"
                              : team.status === "COMPLETED"
                                ? "bg-blue-50 text-blue-600"
                                : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {team.status}
                        </span>

                        <ArrowRight
                          size={16}
                          className="text-slate-300"
                        />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Review Overview */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-slate-900">
                Review Overview
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Items that need your attention
              </p>
            </div>

            <div className="space-y-3 p-5">
              <Link
                href="/mentor/tasks"
                className="flex items-center justify-between rounded-xl border border-slate-100 p-4 transition hover:border-violet-200 hover:bg-violet-50/40"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <Clock3 size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Pending Tasks
                    </p>

                    <p className="text-xs text-slate-400">
                      Review student submissions
                    </p>
                  </div>
                </div>

                <span className="text-lg font-bold text-slate-900">
                  {stats.pendingTasks}
                </span>
              </Link>

              <Link
                href="/mentor/learning"
                className="flex items-center justify-between rounded-xl border border-slate-100 p-4 transition hover:border-violet-200 hover:bg-violet-50/40"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <BookOpen size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Active Learning
                    </p>

                    <p className="text-xs text-slate-400">
                      Learning items assigned
                    </p>
                  </div>
                </div>

                <span className="text-lg font-bold text-slate-900">
                  {stats.activeLearning}
                </span>
              </Link>

              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Completed Tasks
                    </p>

                    <p className="text-xs text-slate-400">
                      Successfully completed
                    </p>
                  </div>
                </div>

                <span className="text-lg font-bold text-slate-900">
                  {stats.completedTasks}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Quick Actions
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/mentor/teams"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-violet-200 hover:shadow-md"
            >
              <UsersRound
                size={20}
                className="text-violet-600"
              />

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                View Teams
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Manage your assigned teams
              </p>

              <ArrowRight
                size={16}
                className="mt-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-violet-600"
              />
            </Link>

            <Link
              href="/mentor/tasks"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-violet-200 hover:shadow-md"
            >
              <CheckSquare
                size={20}
                className="text-amber-600"
              />

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                Review Tasks
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Check student submissions
              </p>

              <ArrowRight
                size={16}
                className="mt-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-violet-600"
              />
            </Link>

            <Link
              href="/mentor/learning"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-violet-200 hover:shadow-md"
            >
              <BookOpen
                size={20}
                className="text-blue-600"
              />

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                Learning Progress
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Track student learning
              </p>

              <ArrowRight
                size={16}
                className="mt-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-violet-600"
              />
            </Link>

            <Link
              href="/mentor/projects"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-violet-200 hover:shadow-md"
            >
              <FolderKanban
                size={20}
                className="text-emerald-600"
              />

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                Projects
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Track team projects
              </p>

              <ArrowRight
                size={16}
                className="mt-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-violet-600"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}