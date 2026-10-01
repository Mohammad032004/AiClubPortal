"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Search,
  Users,
} from "lucide-react";

type TaskItem = {
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

export default function MentorTasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PENDING" | "IN_PROGRESS" | "COMPLETED"
  >("ALL");

  const [priorityFilter, setPriorityFilter] = useState<
    "ALL" | "LOW" | "MEDIUM" | "HIGH"
  >("ALL");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/mentor/tasks");
        const data = await response.json();

        if (response.ok) {
          setTasks(data.tasks || []);
        }
      } catch (error) {
        console.error("Failed to load tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        !query ||
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.team?.name.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" ||
        task.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  const pendingCount = tasks.filter(
    (task) => task.status === "PENDING"
  ).length;

  const inProgressCount = tasks.filter(
    (task) => task.status === "IN_PROGRESS"
  ).length;

  const completedCount = tasks.filter(
    (task) => task.status === "COMPLETED"
  ).length;

  const formatDate = (date?: string) => {
    if (!date) return "No deadline";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isOverdue = (task: TaskItem) => {
    if (!task.deadline || task.status === "COMPLETED") {
      return false;
    }

    return new Date(task.deadline).getTime() < Date.now();
  };

  const priorityClasses = {
    LOW: "bg-slate-100 text-slate-600",
    MEDIUM: "bg-amber-50 text-amber-700",
    HIGH: "bg-red-50 text-red-700",
  };

  const statusClasses = {
    PENDING: "bg-slate-100 text-slate-600",
    IN_PROGRESS: "bg-violet-50 text-violet-700",
    COMPLETED: "bg-emerald-50 text-emerald-700",
  };

  return (
    <div className="bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <p className="text-sm font-medium text-violet-600">
            Tasks
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Team Tasks
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View and track tasks assigned to your teams.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Total Tasks
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {tasks.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <ClipboardList size={21} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Pending
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {pendingCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock3 size={21} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  In Progress
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {inProgressCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <ClipboardList size={21} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Completed
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {completedCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={21} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            {/* Search */}
            <div className="relative w-full xl:max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search tasks, teams..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Status */}
              {(
                [
                  "ALL",
                  "PENDING",
                  "IN_PROGRESS",
                  "COMPLETED",
                ] as const
              ).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-xl px-3 py-2 text-xs font-medium transition ${
                    statusFilter === status
                      ? "bg-violet-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {status === "ALL"
                    ? "All"
                    : status === "IN_PROGRESS"
                      ? "In Progress"
                      : status.charAt(0) +
                        status.slice(1).toLowerCase()}
                </button>
              ))}

              {/* Priority */}
              {(
                ["ALL", "LOW", "MEDIUM", "HIGH"] as const
              ).map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setPriorityFilter(priority)}
                  className={`rounded-xl px-3 py-2 text-xs font-medium transition ${
                    priorityFilter === priority
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {priority === "ALL"
                    ? "All Priority"
                    : priority}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tasks */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-violet-600" />

            <p className="mt-4 text-sm text-slate-500">
              Loading tasks...
            </p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <ClipboardList size={25} />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No tasks found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              There are no tasks matching your current search
              or filters.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredTasks.map((task) => {
              const overdue = isOverdue(task);

              return (
                <div
                  key={task._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-sm"
                >
                  {/* Top */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <ClipboardList size={21} />
                    </div>

                    <div className="flex flex-wrap justify-end gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityClasses[task.priority]}`}
                      >
                        {task.priority}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[task.status]}`}
                      >
                        {task.status === "IN_PROGRESS"
                          ? "In Progress"
                          : task.status === "COMPLETED"
                            ? "Completed"
                            : "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="mt-5 line-clamp-2 text-base font-bold text-slate-900">
                    {task.title}
                  </h2>

                  {/* Description */}
                  {task.description && (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                      {task.description}
                    </p>
                  )}

                  {/* Team */}
                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                    <Users size={15} />

                    <span className="truncate">
                      {task.team?.name || "Team"}
                    </span>
                  </div>

                  {/* Deadline */}
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <CalendarDays
                      size={15}
                      className={
                        overdue
                          ? "text-red-500"
                          : "text-slate-400"
                      }
                    />

                    <span
                      className={
                        overdue
                          ? "font-medium text-red-600"
                          : "text-slate-500"
                      }
                    >
                      {overdue
                        ? `Overdue · ${formatDate(task.deadline)}`
                        : formatDate(task.deadline)}
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <p className="text-xs text-slate-400">
                      Created by
                    </p>

                    <p className="mt-1 truncate text-sm font-medium text-slate-700">
                      {task.createdBy?.name || "AI Club"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}