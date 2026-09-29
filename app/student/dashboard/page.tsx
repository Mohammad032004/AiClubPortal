"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ClipboardList,
  FolderKanban,
  Users,
  ArrowRight,
  CheckCircle2,
  UserRound,
} from "lucide-react";

type Student = {
  name: string;
  email: string;
  role: string;
};

type Mentor = {
  name: string;
  email: string;
};

type TeamMember = {
  _id: string;
  name: string;
  email: string;
};

type Team = {
  _id: string;
  name: string;
  status: string;
  mentor?: Mentor;
  students?: TeamMember[];
};

type Project = {
  title: string;
  description: string;
  status: string;
  progress: number;
  demoUrl?: string;
  documentationUrl?: string;
};

type DashboardData = {
  student: Student;
  team: Team | null;
  stats: {
    learningCount: number;
    activeLearningCount: number;
    pendingTasks: number;
    completedTasks: number;
    totalTasks: number;
    projectCount: number;
  };
  currentProject: Project | null;
};

export default function StudentDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/student/dashboard", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load dashboard");
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-8 w-64 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-4 w-80 animate-pulse rounded bg-slate-200" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white xl:col-span-2" />
          <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
            !
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-900">
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-500">{error}</p>

          <button
            onClick={loadDashboard}
            className="mt-5 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { student, team, stats, currentProject } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-violet-600">
          Welcome back 👋
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          {student.name}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Continue learning, complete your tasks and work with your team.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Learning Resources"
          value={String(stats.learningCount)}
          subtitle="Assigned to your team"
          icon={<BookOpen size={20} />}
          iconClass="bg-violet-100 text-violet-700"
        />

        <StatCard
          title="Pending Tasks"
          value={String(stats.pendingTasks)}
          subtitle="Need your attention"
          icon={<ClipboardList size={20} />}
          iconClass="bg-amber-100 text-amber-700"
        />

        <StatCard
          title="Completed Tasks"
          value={String(stats.completedTasks)}
          subtitle={`Of ${stats.totalTasks} total tasks`}
          icon={<CheckCircle2 size={20} />}
          iconClass="bg-emerald-100 text-emerald-700"
        />

        <StatCard
          title="My Team"
          value={team?.name || "—"}
          subtitle={
            team
              ? `${team.students?.length || 0} members`
              : "No team assigned"
          }
          icon={<Users size={20} />}
          iconClass="bg-blue-100 text-blue-700"
        />
      </div>

      {/* Learning + Team */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Learning */}
        <section className="rounded-2xl border border-slate-200 bg-white xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Continue Learning
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Resources assigned to your team.
              </p>
            </div>

            <Link
              href="/student/learning"
              className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 transition hover:text-violet-700"
            >
              View All
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="p-6">
            {stats.learningCount > 0 ? (
              <div className="rounded-xl bg-violet-50 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-violet-600">
                    <BookOpen size={22} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {stats.learningCount} learning resource
                      {stats.learningCount !== 1 ? "s" : ""}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {stats.activeLearningCount} currently active
                    </p>
                  </div>
                </div>

                <Link
                  href="/student/learning"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-700"
                >
                  Start Learning
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <EmptyState
                icon={<BookOpen size={22} />}
                title="No learning resources yet"
                description="Your mentor will assign learning resources to your team."
              />
            )}
          </div>
        </section>

        {/* Team */}
        <section className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-base font-bold text-slate-900">
              My Team
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Your current team information.
            </p>
          </div>

          <div className="p-6">
            {team ? (
              <div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                    <Users size={22} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {team.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {team.students?.length || 0} team members
                    </p>
                  </div>
                </div>

                {team.mentor && (
                  <div className="mt-5 rounded-xl bg-slate-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Mentor
                    </p>

                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                        <UserRound size={16} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {team.mentor.name}
                        </p>

                        <p className="truncate text-xs text-slate-400">
                          {team.mentor.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Link
                  href="/student/team"
                  className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-violet-600 hover:text-violet-700"
                >
                  View Team
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <EmptyState
                icon={<Users size={22} />}
                title="No team assigned"
                description="Your team information will appear here once you are assigned."
              />
            )}
          </div>
        </section>
      </div>

      {/* Tasks */}
      <section className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              My Tasks
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Tasks assigned to your team.
            </p>
          </div>

          <Link
            href="/student/tasks"
            className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 transition hover:text-violet-700"
          >
            View All
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="p-6">
          {stats.totalTasks > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <TaskSummary
                label="Total Tasks"
                value={stats.totalTasks}
              />

              <TaskSummary
                label="Pending / In Progress"
                value={stats.pendingTasks}
              />

              <TaskSummary
                label="Completed"
                value={stats.completedTasks}
              />
            </div>
          ) : (
            <EmptyState
              icon={<ClipboardList size={22} />}
              title="No tasks assigned"
              description="Tasks assigned to your team will appear here."
            />
          )}
        </div>
      </section>

      {/* Current Project */}
      <section className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Current Project
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Your team's active project.
            </p>
          </div>

          <Link
            href="/student/projects"
            className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 transition hover:text-violet-700"
          >
            View Projects
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="p-6">
          {currentProject ? (
            <div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {currentProject.title}
                  </h3>

                  <p className="mt-1 max-w-2xl text-sm text-slate-500">
                    {currentProject.description || "No project description."}
                  </p>
                </div>

                <span className="w-fit rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
                  {currentProject.status.replace("_", " ")}
                </span>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    Progress
                  </span>

                  <span className="text-xs font-bold text-slate-700">
                    {currentProject.progress}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-violet-600 transition-all"
                    style={{
                      width: `${currentProject.progress}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<FolderKanban size={22} />}
              title="No active project"
              description="Your team's project will appear here once it is assigned."
            />
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconClass,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 truncate text-2xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-1 truncate text-xs text-slate-400">
            {subtitle}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function TaskSummary({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        {icon}
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-700">
        {title}
      </p>

      <p className="mt-1 max-w-md text-xs leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
}