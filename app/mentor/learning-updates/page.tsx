"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  MessageCircleQuestion,
  Search,
} from "lucide-react";

type UpdateStatus =
  | "PENDING"
  | "APPROVED"
  | "REVISION_REQUIRED";

type LearningUpdate = {
  _id: string;
  learned: string;
  practiced: string;
  doubts: string;
  status: UpdateStatus;
  mentorFeedback: string;
  createdAt: string;
  student?: {
    _id: string;
    name: string;
    email: string;
  };
  learningResource?: {
    _id: string;
    title: string;
  };
};

type FilterType = "ALL" | UpdateStatus;

export default function MentorLearningUpdatesPage() {
  const [updates, setUpdates] = useState<LearningUpdate[]>([]);
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadUpdates();
  }, []);

  async function loadUpdates() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/mentor/learning-updates",
        {
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to load learning updates."
        );
      }

      setUpdates(result.updates || []);
    } catch (error) {
      console.error(
        "Mentor learning updates error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load learning updates."
      );
    } finally {
      setLoading(false);
    }
  }

  const counts = useMemo(
    () => ({
      all: updates.length,
      pending: updates.filter(
        (update) => update.status === "PENDING"
      ).length,
      approved: updates.filter(
        (update) => update.status === "APPROVED"
      ).length,
      revision: updates.filter(
        (update) => update.status === "REVISION_REQUIRED"
      ).length,
    }),
    [updates]
  );

  const filteredUpdates = useMemo(() => {
    const query = search.toLowerCase().trim();

    return updates.filter((update) => {
      const matchesFilter =
        filter === "ALL" || update.status === filter;

      if (!matchesFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        update.student?.name
          .toLowerCase()
          .includes(query) ||
        update.learningResource?.title
          .toLowerCase()
          .includes(query) ||
        update.learned.toLowerCase().includes(query) ||
        update.practiced.toLowerCase().includes(query)
      );
    });
  }, [updates, filter, search]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 animate-pulse rounded-2xl bg-white" />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-2xl bg-white"
            />
          ))}
        </div>

        <div className="h-72 animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-violet-600">
          Student Learning
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Learning Updates
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Review what your students are learning and practicing.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={loadUpdates}
            className="mt-2 text-xs font-semibold text-red-700 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="All Updates"
          value={counts.all}
          icon={<BookOpen size={20} />}
          className="bg-violet-100 text-violet-700"
        />

        <StatCard
          title="Pending Review"
          value={counts.pending}
          icon={<Clock3 size={20} />}
          className="bg-amber-100 text-amber-700"
        />

        <StatCard
          title="Approved"
          value={counts.approved}
          icon={<CheckCircle2 size={20} />}
          className="bg-emerald-100 text-emerald-700"
        />

        <StatCard
          title="Revision Required"
          value={counts.revision}
          icon={<MessageCircleQuestion size={20} />}
          className="bg-red-100 text-red-700"
        />
      </div>

      {/* Search + Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-4">
          <div className="relative w-full">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search students or learning resources..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={filter === "ALL"}
              onClick={() => setFilter("ALL")}
              label={`All (${counts.all})`}
            />

            <FilterButton
              active={filter === "PENDING"}
              onClick={() => setFilter("PENDING")}
              label={`Pending (${counts.pending})`}
            />

            <FilterButton
              active={filter === "APPROVED"}
              onClick={() => setFilter("APPROVED")}
              label={`Approved (${counts.approved})`}
            />

            <FilterButton
              active={filter === "REVISION_REQUIRED"}
              onClick={() =>
                setFilter("REVISION_REQUIRED")
              }
              label={`Revision (${counts.revision})`}
            />
          </div>
        </div>
      </div>

      {/* Updates */}
      {filteredUpdates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <BookOpen size={26} />
          </div>

          <h2 className="mt-4 text-base font-bold text-slate-800">
            No learning updates found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
            Student learning submissions matching your
            filters will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUpdates.map((update) => (
            <LearningUpdateCard
              key={update._id}
              update={update}
              onUpdated={loadUpdates}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LearningUpdateCard({
  update,
  onUpdated,
}: {
  update: LearningUpdate;
  onUpdated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const statusConfig = {
    PENDING: {
      label: "Pending Review",
      className:
        "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock3,
    },

    APPROVED: {
      label: "Approved",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
    },

    REVISION_REQUIRED: {
      label: "Revision Required",
      className:
        "bg-red-50 text-red-700 border-red-200",
      icon: MessageCircleQuestion,
    },
  };

  const config =
    statusConfig[update.status] ||
    statusConfig.PENDING;

  const StatusIcon = config.icon;

  async function handleReview(
    status: "APPROVED" | "REVISION_REQUIRED"
  ) {
    if (
      status === "REVISION_REQUIRED" &&
      !feedback.trim()
    ) {
      setReviewError(
        "Please provide feedback before requesting a revision."
      );

      return;
    }

    try {
      setReviewing(true);
      setReviewError("");

      const response = await fetch(
        `/api/mentor/learning-updates/${update._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            mentorFeedback: feedback.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to review update."
        );
      }

      setFeedback("");
      setOpen(false);

      await onUpdated();
    } catch (error) {
      console.error("Review update error:", error);

      setReviewError(
        error instanceof Error
          ? error.message
          : "Failed to review update."
      );
    } finally {
      setReviewing(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {/* Summary */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {/* Student */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                {update.student?.name
                  ?.charAt(0)
                  .toUpperCase() || "S"}
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold text-slate-900">
                  {update.student?.name ||
                    "Unknown Student"}
                </h2>

                <p className="truncate text-xs text-slate-400">
                  {update.student?.email || ""}
                </p>
              </div>
            </div>

            {/* Resource */}
            <div className="mt-4">
              <p className="text-xs font-medium text-violet-600">
                Learning Resource
              </p>

              <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                {update.learningResource?.title ||
                  "Learning Resource"}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {new Date(
                  update.createdAt
                ).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}
            >
              <StatusIcon size={13} />
              {config.label}
            </span>

            <button
              type="button"
              onClick={() => {
                setOpen((value) => !value);
                setReviewError("");
              }}
              className="text-xs font-semibold text-violet-600 hover:text-violet-800"
            >
              {open ? "Hide Details" : "Review Update"}
            </button>
          </div>
        </div>
      </div>

      {/* Details */}
      {open && (
        <div className="border-t border-slate-100 bg-slate-50/60 p-5 sm:p-6">
          {/* Student Learning Information */}
          <div className="grid gap-4 lg:grid-cols-3">
            <InfoBlock
              title="What the student learned"
              content={update.learned}
            />

            <InfoBlock
              title="What the student practiced"
              content={update.practiced}
            />

            <InfoBlock
              title="Student's doubts"
              content={
                update.doubts ||
                "No doubts mentioned."
              }
            />
          </div>

          {/* Previous Feedback */}
          {update.mentorFeedback && (
            <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
                Previous Feedback
              </p>

              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                {update.mentorFeedback}
              </p>
            </div>
          )}

          {/* Review */}
          {update.status === "PENDING" && (
            <div className="mt-5 border-t border-slate-200 pt-5">
              <label
                htmlFor={`feedback-${update._id}`}
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Mentor Feedback
              </label>

              <textarea
                id={`feedback-${update._id}`}
                value={feedback}
                onChange={(event) =>
                  setFeedback(event.target.value)
                }
                rows={4}
                placeholder="Write feedback for the student..."
                className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />

              {reviewError && (
                <p className="mt-2 text-xs font-medium text-red-600">
                  {reviewError}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                {/* Approve */}
                <button
                  type="button"
                  disabled={reviewing}
                  onClick={() =>
                    handleReview("APPROVED")
                  }
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {reviewing
                    ? "Updating..."
                    : "Approve Update"}
                </button>

                {/* Request Revision */}
                <button
                  type="button"
                  disabled={reviewing}
                  onClick={() =>
                    handleReview("REVISION_REQUIRED")
                  }
                  className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {reviewing
                    ? "Updating..."
                    : "Request Revision"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function InfoBlock({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <div className="rounded-xl bg-white p-4">
      <p className="text-xs font-semibold text-slate-600">
        {title}
      </p>

      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-500">
        {content}
      </p>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
        active
          ? "bg-violet-600 text-white"
          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}

function StatCard({
  title,
  value,
  icon,
  className,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  className: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${className}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}