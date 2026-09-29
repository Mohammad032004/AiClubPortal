"use client";

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
  deadline?: string;
  createdAt: string;
  team?: {
    _id: string;
    name: string;
  };
  createdBy?: {
    name: string;
    email: string;
  };
};

export default function StudentTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/student/tasks", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load tasks");
      }

      setTasks(result.tasks || []);
    } catch (error) {
      console.error("Tasks error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load tasks"
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredTasks = useMemo(() => {
    const query = search.toLowerCase().trim();

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

  const pendingCount = tasks.filter(
    (task) => task.status === "PENDING"
  ).length;

  const inProgressCount = tasks.filter(
    (task) => task.status === "IN_PROGRESS"
  ).length;

  const completedCount = tasks.filter(
    (task) => task.status === "COMPLETED"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-violet-600">
          Task Workspace
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          My Tasks
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Complete the practical tasks assigned to your team.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Tasks"
          value={tasks.length}
          icon={<ClipboardList size={20} />}
          iconClass="bg-violet-100 text-violet-700"
        />

        <StatCard
          title="Pending"
          value={pendingCount}
          icon={<CircleDot size={20} />}
          iconClass="bg-slate-100 text-slate-600"
        />

        <StatCard
          title="In Progress"
          value={inProgressCount}
          icon={<Clock3 size={20} />}
          iconClass="bg-amber-100 text-amber-700"
        />

        <StatCard
          title="Completed"
          value={completedCount}
          icon={<CheckCircle2 size={20} />}
          iconClass="bg-emerald-100 text-emerald-700"
        />
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="relative w-full sm:max-w-md">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>

          <button
            onClick={loadTasks}
            className="mt-2 text-xs font-semibold text-red-700 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <ClipboardList size={26} />
            </div>

            <h2 className="mt-4 text-base font-bold text-slate-800">
              {search ? "No tasks found" : "No tasks assigned"}
            </h2>

            <p className="mt-2 max-w-md text-sm text-slate-400">
              {search
                ? "Try searching with a different keyword."
                : "Tasks assigned to your team will appear here."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const isCompleted = task.status === "COMPLETED";
  const isInProgress = task.status === "IN_PROGRESS";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-violet-200 hover:shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        {/* Main */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              {task.title}
            </h2>

            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {task.description || "No description provided."}
          </p>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">
            {task.team && (
              <span>
                Team:{" "}
                <span className="font-medium text-slate-600">
                  {task.team.name}
                </span>
              </span>
            )}

            {task.createdBy && (
              <span>
                Assigned by:{" "}
                <span className="font-medium text-slate-600">
                  {task.createdBy.name}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Deadline */}
        <div className="shrink-0 lg:w-44">
          {task.deadline ? (
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <CalendarDays size={15} />

                <span className="text-xs font-medium">
                  Deadline
                </span>
              </div>

              <p className="mt-2 text-sm font-semibold text-slate-800">
                {formatDate(task.deadline)}
              </p>

              {!isCompleted && isOverdue(task.deadline) && (
                <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-600">
                  <AlertCircle size={13} />
                  Overdue
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-400">
                No deadline
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: Task["priority"];
}) {
  const styles = {
    LOW: "bg-slate-100 text-slate-600",
    MEDIUM: "bg-blue-50 text-blue-700",
    HIGH: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[priority]}`}
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
  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
        <CheckCircle2 size={12} />
        Completed
      </span>
    );
  }

  if (status === "IN_PROGRESS") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
        <Clock3 size={12} />
        In Progress
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
      <CircleDot size={12} />
      Pending
    </span>
  );
}

function StatCard({
  title,
  value,
  icon,
  iconClass,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isOverdue(date: string) {
  return new Date(date).getTime() < Date.now();
}