"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Plus,
  Search,
  Users,
  X,
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

type MentorTeam = {
  _id: string;
  name: string;
};

export default function MentorTasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [teams, setTeams] = useState<MentorTeam[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PENDING" | "IN_PROGRESS" | "COMPLETED"
  >("ALL");

  const [priorityFilter, setPriorityFilter] = useState<
    "ALL" | "LOW" | "MEDIUM" | "HIGH"
  >("ALL");

  const [showAddForm, setShowAddForm] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [teamId, setTeamId] = useState("");
  const [priority, setPriority] = useState<
    "LOW" | "MEDIUM" | "HIGH"
  >("MEDIUM");
  const [deadline, setDeadline] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      setLoading(true);
      setFormError("");

      const response = await fetch("/api/mentor/tasks", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load tasks."
        );
      }

      setTasks(data.tasks || []);
      setTeams(data.teams || []);
    } catch (error) {
      console.error("Failed to load tasks:", error);

      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to load tasks."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTask(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSubmitting(true);
    setFormError("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/mentor/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          teamId,
          priority,
          deadline,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create task."
        );
      }

      setSuccessMessage("Task created successfully.");

      setTitle("");
      setDescription("");
      setTeamId("");
      setPriority("MEDIUM");
      setDeadline("");

      setShowAddForm(false);

      await fetchTasks();
    } catch (error) {
      console.error("Failed to create task:", error);

      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to create task."
      );
    } finally {
      setSubmitting(false);
    }
  }

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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-violet-600">
              Tasks
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Team Tasks
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Create and track tasks assigned to your teams.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowAddForm(true);
              setFormError("");
              setSuccessMessage("");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            <Plus size={18} />
            Add Task
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {successMessage}
          </div>
        )}

        {/* Add Task Modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Add Task
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Create a practical task for one of your
                    teams.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormError("");
                  }}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close"
                >
                  <X size={19} />
                </button>
              </div>

              {/* Form */}
              <form
                onSubmit={handleAddTask}
                className="space-y-5 p-5 sm:p-6"
              >
                {/* Team */}
                <div>
                  <label
                    htmlFor="team"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Team
                  </label>

                  <select
                    id="team"
                    value={teamId}
                    onChange={(event) =>
                      setTeamId(event.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  >
                    <option value="">
                      Select a team
                    </option>

                    {teams.map((team) => (
                      <option
                        key={team._id}
                        value={team._id}
                      >
                        {team.name}
                      </option>
                    ))}
                  </select>

                  {teams.length === 0 && (
                    <p className="mt-2 text-xs text-amber-600">
                      No teams are currently available.
                    </p>
                  )}
                </div>

                {/* Task Title */}
                <div>
                  <label
                    htmlFor="title"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Task Title
                  </label>

                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(event) =>
                      setTitle(event.target.value)
                    }
                    required
                    placeholder="e.g. Build a responsive landing page"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Description
                  </label>

                  <textarea
                    id="description"
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    rows={5}
                    placeholder="Explain what the students need to complete..."
                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                {/* Priority + Deadline */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="priority"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Priority
                    </label>

                    <select
                      id="priority"
                      value={priority}
                      onChange={(event) =>
                        setPriority(
                          event.target.value as
                            | "LOW"
                            | "MEDIUM"
                            | "HIGH"
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">
                        Medium
                      </option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="deadline"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Deadline
                    </label>

                    <input
                      id="deadline"
                      type="datetime-local"
                      value={deadline}
                      onChange={(event) =>
                        setDeadline(event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />
                  </div>
                </div>

                {/* Error */}
                {formError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {formError}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormError("");
                    }}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      submitting || teams.length === 0
                    }
                    className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting
                      ? "Creating..."
                      : "Create Task"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Tasks */}
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

          {/* Pending */}
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

          {/* In Progress */}
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

          {/* Completed */}
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
                  onClick={() =>
                    setPriorityFilter(priority)
                  }
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
              There are no tasks matching your current
              search or filters.
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
                        ? `Overdue · ${formatDate(
                            task.deadline
                          )}`
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