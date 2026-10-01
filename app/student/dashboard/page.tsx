"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  GraduationCap,
  Users,
} from "lucide-react";

type DashboardData = {
  student: {
    name: string;
    email: string;
  };
  team: {
    _id: string;
    name: string;
    status: string;
    mentor: {
      _id: string;
      name: string;
      email: string;
    } | null;
  } | null;
  stats: {
    learning: number;
    activeLearning: number;
    tasks: number;
    pendingTasks: number;
    completedTasks: number;
    projects: number;
  };
  currentProject: {
    _id: string;
    title: string;
    status: string;
    progress: number;
  } | null;
};

export default function StudentDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch("/api/student/dashboard");
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to load dashboard"
          );
        }

        setData(result);
      } catch (error) {
        console.error("Dashboard error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-40 animate-pulse rounded-2xl bg-white" />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl bg-white"
            />
          ))}
        </div>

        <div className="h-64 animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const firstName = data.student.name.split(" ")[0];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Welcome */}
      <section className="relative isolate overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {/* Animated Background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-24 h-64 w-64 animate-[pulse_5s_ease-in-out_infinite] rounded-full bg-violet-200/60 blur-3xl" />

          <div className="absolute -right-20 -top-16 h-64 w-64 animate-[pulse_6s_ease-in-out_infinite] rounded-full bg-cyan-200/60 blur-3xl" />

          <div className="absolute -bottom-32 left-1/3 h-64 w-64 animate-[pulse_7s_ease-in-out_infinite] rounded-full bg-fuchsia-100/60 blur-3xl" />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.08),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(6,182,212,0.08),transparent_35%)]" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-5 sm:p-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
            <GraduationCap size={14} />
            Student Workspace
          </div>

          <h1 className="max-w-3xl text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
              {firstName}
            </span>{" "}
            👋
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Keep learning, complete your assigned tasks, and make
            progress with your team.
          </p>

          {/* Decorative line */}
          <div className="mt-5 h-1 w-20 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-1/2 animate-[pulse_2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-violet-600 to-cyan-500" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BookOpen}
          label="Learning Resources"
          value={data.stats.learning}
          description={`${data.stats.activeLearning} active`}
        />

        <StatCard
          icon={ClipboardList}
          label="Total Tasks"
          value={data.stats.tasks}
          description={`${data.stats.pendingTasks} pending`}
        />

        <StatCard
          icon={CheckCircle2}
          label="Completed Tasks"
          value={data.stats.completedTasks}
          description="Tasks completed"
        />

        <StatCard
          icon={FolderKanban}
          label="Projects"
          value={data.stats.projects}
          description="Team projects"
        />
      </section>

      {/* Team + Project */}
      <section className="grid gap-5 lg:grid-cols-2">
        {/* Team */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Users size={19} />
              </div>

              <div className="min-w-0">
                <h2 className="text-base font-semibold text-slate-900">
                  My Team
                </h2>

                <p className="text-xs text-slate-400">
                  Your current team
                </p>
              </div>
            </div>

            <Link
              href="/student/team"
              className="shrink-0 text-xs font-semibold text-violet-600 hover:text-violet-700"
            >
              View Team
            </Link>
          </div>

          {data.team ? (
            <div className="mt-6 rounded-xl bg-slate-50 p-4">
              <p className="break-words text-lg font-bold text-slate-900">
                {data.team.name}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  {data.team.status}
                </span>

                {data.team.mentor && (
                  <span className="max-w-full rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-medium text-cyan-700">
                    Mentor: {data.team.mentor.name}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
              You have not been assigned to a team yet.
            </div>
          )}
        </div>

        {/* Current Project */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <FolderKanban size={19} />
              </div>

              <div className="min-w-0">
                <h2 className="text-base font-semibold text-slate-900">
                  Current Project
                </h2>

                <p className="text-xs text-slate-400">
                  Your team's active project
                </p>
              </div>
            </div>

            <Link
              href="/student/projects"
              className="shrink-0 text-xs font-semibold text-violet-600 hover:text-violet-700"
            >
              View Projects
            </Link>
          </div>

          {data.currentProject ? (
            <Link
              href={`/student/projects/${data.currentProject._id}`}
              className="mt-6 block rounded-xl bg-slate-50 p-4 transition hover:bg-violet-50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="break-words font-semibold text-slate-900">
                    {data.currentProject.title}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {data.currentProject.status.replace("_", " ")}
                  </p>
                </div>

                <ArrowRight
                  size={17}
                  className="mt-0.5 shrink-0 text-slate-400"
                />
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    Progress
                  </span>

                  <span className="text-xs font-semibold text-violet-600">
                    {data.currentProject.progress}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        Math.max(data.currentProject.progress, 0),
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </Link>
          ) : (
            <div className="mt-6 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
              No active project has been assigned yet.
            </div>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900">
            Quick Access
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Continue your work from here.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <QuickAction
            href="/student/learning"
            icon={BookOpen}
            title="Continue Learning"
            description="View your learning resources"
          />

          <QuickAction
            href="/student/tasks"
            icon={ClipboardList}
            title="View Tasks"
            description="Check your assigned tasks"
          />

          <QuickAction
            href="/student/projects"
            icon={FolderKanban}
            title="View Projects"
            description="Track your team projects"
          />
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof BookOpen;
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          <Icon size={19} />
        </div>

        <span className="text-2xl font-bold text-slate-900">
          {value}
        </span>
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-800">
        {label}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof BookOpen;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-violet-200 hover:shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          <Icon size={19} />
        </div>

        <ArrowRight
          size={17}
          className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-violet-600"
        />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </Link>
  );
}