"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  Search,
  CalendarDays,
  Clock3,
  CheckCircle2,
  CircleDot,
  AlertCircle,
} from "lucide-react";

type Task = {
  _id: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  deadline?: string | null;
  createdAt: string;
  team?: {
    _id: string;
    name: string;
  };
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
};

function PriorityBadge({
  priority,
}: {
  priority: Task["priority"];
}) {
  const styles = {
    LOW: "bg-slate-100 text-slate-600",
    MEDIUM: "bg-amber-50 text-amber-700",
    HIGH: "bg-red-50 text-red-600",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: Task["status"];
}) {
  const styles = {
    PENDING: "bg-slate-100 text-slate-600",
    IN_PROGRESS: "bg-violet-50 text-violet-700",
    COMPLETED: "bg-emerald-50 text-emerald-700",
  };

  const labels = {
    PENDING: "Pending",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function formatDate(date?: string | null) {
  if (!date) return "No deadline";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isOverdue(task: Task) {
  if (!task.deadline || task.status === "COMPLETED") return false;

  return new Date(task.deadline).getTime() < Date.now();
}

export default function StudentTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTasks() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/student/tasks");

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load tasks");
        }

        setTasks(data.tasks || []);
      } catch (error) {
        console.error("Student tasks error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load tasks"
        );
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return tasks;

    return tasks.filter((task) => {
      return (
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.priority.toLowerCase().includes(query) ||
        task.status.toLowerCase().includes(query)
      );
    });
  }, [tasks, search]);

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter((task) => task.status === "PENDING").length,
      inProgress: tasks.filter(
        (task) => task.status === "IN_PROGRESS"
      ).length,
      completed: tasks.filter(
        (task) => task.status === "COMPLETED"
      ).length,
    };
  }, [tasks]);

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
        {/* Header */}
        <div>
          <p className="text-sm font-medium text-violet-600">
            Student Portal
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Tasks
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Complete your assigned practical tasks and keep track of
            your progress.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Tasks"
            value={stats.total}
            icon={<ClipboardList size={20} />}
          />

          <StatCard
            label="Pending"
            value={stats.pending}
            icon={<CircleDot size={20} />}
          />

          <StatCard
            label="In Progress"
            value={stats.inProgress}
            icon={<Clock3 size={20} />}
          />

          <StatCard
            label="Completed"
            value={stats.completed}
            icon={<CheckCircle2 size={20} />}
          />
        </div>

        {/* Search */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tasks..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-violet-600" />

            <p className="mt-4 text-sm text-slate-500">
              Loading tasks...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={20}
                className="mt-0.5 text-red-600"
              />

              <div>
                <h2 className="text-sm font-semibold text-red-800">
                  Unable to load tasks
                </h2>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredTasks.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <ClipboardList size={24} />
            </div>

            <h2 className="mt-4 text-base font-semibold text-slate-900">
              {search ? "No tasks found" : "No tasks assigned"}
            </h2>

            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
              {search
                ? "Try changing your search term."
                : "Your mentor will assign practical tasks here."}
            </p>
          </div>
        )}

        {/* Tasks */}
        {!loading && !error && filteredTasks.length > 0 && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {filteredTasks.map((task) => {
              const overdue = isOverdue(task);

              return (
                <Link
                  key={task._id}
                  href={`/student/tasks/${task._id}`}
                  className="block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-violet-200 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <PriorityBadge priority={task.priority} />
                        <StatusBadge status={task.status} />
                      </div>

                      <h2 className="mt-3 text-base font-semibold text-slate-900">
                        {task.title}
                      </h2>
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <ClipboardList size={19} />
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                    {task.description || "No description provided."}
                  </p>

                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs font-medium text-slate-400">
                        Team
                      </p>

                      <p className="mt-1 truncate text-sm font-medium text-slate-700">
                        {task.team?.name || "No team"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs font-medium text-slate-400">
                        Assigned By
                      </p>

                      <p className="mt-1 truncate text-sm font-medium text-slate-700">
                        {task.createdBy?.name || "Mentor"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div
                      className={`flex items-center gap-2 text-xs font-medium ${
                        overdue ? "text-red-600" : "text-slate-500"
                      }`}
                    >
                      <CalendarDays size={15} />

                      <span>
                        {overdue
                          ? `Overdue · ${formatDate(task.deadline)}`
                          : formatDate(task.deadline)}
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-violet-600">
                      View Task →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}