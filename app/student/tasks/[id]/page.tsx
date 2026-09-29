"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  Loader2,
  Send,
  UserRound,
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

type Submission = {
  _id: string;
  description: string;
  demoUrl: string;
  screenshots: string[];
  status: "SUBMITTED" | "APPROVED" | "CHANGES_REQUESTED";
  mentorComment: string;
  createdAt: string;
  updatedAt: string;
};

export default function StudentTaskDetailsPage() {
  const params = useParams();

  const taskId = String(params.id);

  const [task, setTask] = useState<Task | null>(null);
  const [submission, setSubmission] =
    useState<Submission | null>(null);

  const [description, setDescription] = useState("");
  const [demoUrl, setDemoUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadTask();
  }, [taskId]);

  async function loadTask() {
    try {
      setLoading(true);
      setError("");

      const [taskResponse, submissionResponse] =
        await Promise.all([
          fetch(`/api/student/tasks/${taskId}`, {
            cache: "no-store",
          }),
          fetch(
            `/api/student/tasks/${taskId}/submission`,
            {
              cache: "no-store",
            }
          ),
        ]);

      const taskResult = await taskResponse.json();
      const submissionResult =
        await submissionResponse.json();

      if (!taskResponse.ok) {
        throw new Error(
          taskResult.message || "Failed to load task"
        );
      }

      setTask(taskResult.task);

      if (submissionResponse.ok) {
        const existingSubmission =
          submissionResult.submission || null;

        setSubmission(existingSubmission);

        if (existingSubmission) {
          setDescription(
            existingSubmission.description || ""
          );

          setDemoUrl(
            existingSubmission.demoUrl || ""
          );
        }
      }
    } catch (error) {
      console.error("Task details error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load task"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      if (!description.trim() && !demoUrl.trim()) {
        setError(
          "Please provide a work description or demo URL."
        );
        return;
      }

      const response = await fetch(
        `/api/student/tasks/${taskId}/submission`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description,
            demoUrl,
            screenshots: [],
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to submit task"
        );
      }

      setSubmission(result.submission);

      setSuccess(
        "Your task submission has been submitted successfully."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Submission error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to submit task"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-28 animate-pulse rounded bg-slate-200" />

        <div className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white" />

        <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      </div>
    );
  }

  if (error && !task) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center">
          <p className="text-sm font-semibold text-red-700">
            {error}
          </p>

          <Link
            href="/student/tasks"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <ArrowLeft size={15} />
            Back to Tasks
          </Link>
        </div>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Back */}
      <Link
        href="/student/tasks"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-violet-600"
      >
        <ArrowLeft size={16} />
        Back to Tasks
      </Link>

      {/* Alerts */}
      {success && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2
            size={18}
            className="text-emerald-600"
          />

          <p className="text-sm font-medium text-emerald-700">
            {success}
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* Task Header */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} />
            </div>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
              {task.title}
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {task.description ||
                "No description provided."}
            </p>
          </div>

          <div className="shrink-0 rounded-xl bg-slate-50 p-4 lg:w-48">
            <div className="flex items-center gap-2 text-slate-500">
              <CalendarDays size={16} />

              <span className="text-xs font-medium">
                Deadline
              </span>
            </div>

            <p className="mt-2 text-sm font-semibold text-slate-800">
              {task.deadline
                ? formatDate(task.deadline)
                : "No deadline"}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
          <InfoItem
            icon={<ClipboardList size={16} />}
            label="Team"
            value={task.team?.name || "—"}
          />

          <InfoItem
            icon={<UserRound size={16} />}
            label="Assigned By"
            value={task.createdBy?.name || "—"}
          />
        </div>
      </section>

      {/* Existing Submission */}
      {submission && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Your Submission
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Last updated{" "}
                {formatDate(submission.updatedAt)}
              </p>
            </div>

            <SubmissionStatus
              status={submission.status}
            />
          </div>

          {submission.mentorComment && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold text-amber-700">
                Mentor Feedback
              </p>

              <p className="mt-2 text-sm leading-6 text-amber-800">
                {submission.mentorComment}
              </p>
            </div>
          )}
        </section>
      )}

      {/* Submission Form */}
      <section className="rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-base font-bold text-slate-900">
            {submission
              ? "Update Your Submission"
              : "Submit Your Work"}
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Provide the details of the work you completed
            for this task.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          {/* Work Description */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Work Description
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows={6}
              placeholder="Explain what you completed, what you learned, and how your solution works..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
            />
          </div>

          {/* Live Demo */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Live Demo URL
            </label>

            <div className="relative">
              <ExternalLink
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="url"
                value={demoUrl}
                onChange={(event) =>
                  setDemoUrl(event.target.value)
                }
                placeholder="https://your-project.vercel.app"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
              />
            </div>
          </div>

          {/* Screenshots */}
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-700">
              Screenshots
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Screenshot uploads will be added separately.
            </p>
          </div>

          {/* Submit */}
          <div className="flex justify-end border-t border-slate-100 pt-5">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={16} />
                  {submission
                    ? "Update Submission"
                    : "Submit Work"}
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
      <div className="text-slate-400">{icon}</div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-medium text-slate-700">
          {value}
        </p>
      </div>
    </div>
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
  const styles = {
    PENDING: "bg-slate-100 text-slate-600",
    IN_PROGRESS: "bg-amber-50 text-amber-700",
    COMPLETED: "bg-emerald-50 text-emerald-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function SubmissionStatus({
  status,
}: {
  status: Submission["status"];
}) {
  const config = {
    SUBMITTED: {
      label: "Submitted",
      className: "bg-blue-50 text-blue-700",
    },
    APPROVED: {
      label: "Approved",
      className: "bg-emerald-50 text-emerald-700",
    },
    CHANGES_REQUESTED: {
      label: "Changes Requested",
      className: "bg-amber-50 text-amber-700",
    },
  };

  const current = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${current.className}`}
    >
      {status === "APPROVED" && (
        <CheckCircle2 size={13} />
      )}

      {current.label}
    </span>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}