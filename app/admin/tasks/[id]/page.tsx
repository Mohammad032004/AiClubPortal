"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ListTodo,
  Mail,
  Save,
  UserRound,
  Users,
  X,
} from "lucide-react";

type User = {
  _id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MENTOR" | "STUDENT";
};

type Team = {
  _id: string;
  name: string;
};

type Task = {
  _id: string;
  title: string;
  description: string;
  team: Team;
  createdBy: User;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  deadline?: string;
  createdAt: string;
  updatedAt: string;
};

export default function TaskDetailsPage() {
  const params = useParams();
  const taskId = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [teamId, setTeamId] = useState("");
  const [priority, setPriority] = useState<
    "LOW" | "MEDIUM" | "HIGH"
  >("MEDIUM");
  const [status, setStatus] = useState<
    "PENDING" | "IN_PROGRESS" | "COMPLETED"
  >("PENDING");
  const [deadline, setDeadline] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadTask = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/admin/tasks/${taskId}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load task.");
        return;
      }

      setTask(data.task);
    } catch (error) {
      console.error("Load task error:", error);
      setError("Failed to load task.");
    } finally {
      setLoading(false);
    }
  };

  const loadTeams = async () => {
    try {
      const response = await fetch("/api/admin/teams");
      const data = await response.json();

      if (response.ok) {
        setTeams(data.teams || []);
      }
    } catch (error) {
      console.error("Load teams error:", error);
    }
  };

  useEffect(() => {
    if (!taskId) return;

    loadTask();
    loadTeams();
  }, [taskId]);

  const openEditModal = () => {
    if (!task) return;

    setTitle(task.title);
    setDescription(task.description || "");
    setTeamId(task.team?._id || "");
    setPriority(task.priority);
    setStatus(task.status);

    if (task.deadline) {
      const date = new Date(task.deadline);
      setDeadline(date.toISOString().split("T")[0]);
    } else {
      setDeadline("");
    }

    setError("");
    setSuccess("");
    setShowEditModal(true);
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    if (!teamId) {
      setError("Please select a team.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`/api/admin/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          teamId,
          priority,
          status,
          deadline: deadline || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update task.");
        return;
      }

      setTask(data.task);
      setSuccess("Task updated successfully.");

      setTimeout(() => {
        setShowEditModal(false);
        setSuccess("");
      }, 700);
    } catch (error) {
      console.error("Update task error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-slate-500">
            Loading task details...
          </p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-full bg-slate-50 p-6">
        <Link
          href="/admin/tasks"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-violet-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tasks
        </Link>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-sm font-medium text-red-600">
            {error || "Task not found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 p-6">
      {/* Back */}
      <Link
        href="/admin/tasks"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-violet-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tasks
      </Link>

      {/* Header */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <ListTodo className="h-6 w-6" />
            </div>

            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">
                  {task.title}
                </h1>

                <PriorityBadge priority={task.priority} />
              </div>

              <p className="text-sm text-slate-500">
                Created on{" "}
                {new Date(task.createdAt).toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </p>
            </div>
          </div>

          <button
            onClick={openEditModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            <Save className="h-4 w-4" />
            Edit Task
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Description */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-base font-semibold text-slate-900">
                Task Description
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Instructions and requirements for this task.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              {task.description ? (
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                  {task.description}
                </p>
              ) : (
                <p className="text-sm italic text-slate-400">
                  No description has been added for this task.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status */}
        <div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-base font-semibold text-slate-900">
              Task Overview
            </h2>

            <div className="space-y-5">
              {/* Status */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </p>

                <StatusBadge status={task.status} />
              </div>

              {/* Team */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Assigned Team
                </p>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                    <Users className="h-4 w-4" />
                  </div>

                  <span className="text-sm font-semibold text-slate-700">
                    {task.team?.name || "No Team"}
                  </span>
                </div>
              </div>

              {/* Deadline */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Deadline
                </p>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <CalendarDays className="h-4 w-4" />
                  </div>

                  <span className="text-sm font-semibold text-slate-700">
                    {task.deadline
                      ? new Date(
                          task.deadline
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "No deadline"}
                  </span>
                </div>
              </div>

              {/* Created By */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Created By
                </p>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                    <UserRound className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-700">
                      {task.createdBy?.name || "Unknown"}
                    </p>

                    {task.createdBy?.email && (
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-slate-400" />

                        <p className="truncate text-xs text-slate-400">
                          {task.createdBy.email}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Edit Task
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update task details and status.
                </p>
              </div>

              <button
                onClick={() => setShowEditModal(false)}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTask}>
              <div className="space-y-5 p-6">
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
                    {success}
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Task Title
                  </label>

                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Description
                  </label>

                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                {/* Team */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Assigned Team
                  </label>

                  <select
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  >
                    <option value="">Select a team</option>

                    {teams.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority + Status */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Priority
                    </label>

                    <select
                      value={priority}
                      onChange={(e) =>
                        setPriority(
                          e.target.value as
                            | "LOW"
                            | "MEDIUM"
                            | "HIGH"
                        )
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Status
                    </label>

                    <select
                      value={status}
                      onChange={(e) =>
                        setStatus(
                          e.target.value as
                            | "PENDING"
                            | "IN_PROGRESS"
                            | "COMPLETED"
                        )
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">
                        In Progress
                      </option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Deadline */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Deadline
                  </label>

                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50/50 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: "LOW" | "MEDIUM" | "HIGH";
}) {
  if (priority === "HIGH") {
    return (
      <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
        High Priority
      </span>
    );
  }

  if (priority === "LOW") {
    return (
      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
        Low Priority
      </span>
    );
  }

  return (
    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
      Medium Priority
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
}) {
  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Completed
      </span>
    );
  }

  if (status === "IN_PROGRESS") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">
        <Clock3 className="h-3.5 w-3.5" />
        In Progress
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
      <Clock3 className="h-3.5 w-3.5" />
      Pending
    </span>
  );
}