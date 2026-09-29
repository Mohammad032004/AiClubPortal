"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Play,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock3,
  FileText,
  Circle,
} from "lucide-react";

type ProgressStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED";

type LearningResource = {
  _id: string;
  title: string;
  youtubeUrl: string;
  notes: string;
  status: "ACTIVE" | "COMPLETED";
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

type ProgressMap = Record<
  string,
  {
    status: ProgressStatus;
    completedAt: string | null;
  }
>;

export default function StudentLearningPage() {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadLearning();
  }, []);

  async function loadLearning() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/student/learning", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to load learning resources"
        );
      }

      const learningResources = result.learning || [];

      setResources(learningResources);

      const progressEntries = await Promise.all(
        learningResources.map(async (resource: LearningResource) => {
          try {
            const progressResponse = await fetch(
              `/api/student/learning/${resource._id}/progress`,
              {
                cache: "no-store",
              }
            );

            const progressResult = await progressResponse.json();

            if (!progressResponse.ok) {
              return [
                resource._id,
                {
                  status: "NOT_STARTED" as ProgressStatus,
                  completedAt: null,
                },
              ] as const;
            }

            return [
              resource._id,
              {
                status:
                  progressResult.progress?.status ||
                  "NOT_STARTED",
                completedAt:
                  progressResult.progress?.completedAt || null,
              },
            ] as const;
          } catch {
            return [
              resource._id,
              {
                status: "NOT_STARTED" as ProgressStatus,
                completedAt: null,
              },
            ] as const;
          }
        })
      );

      setProgress(Object.fromEntries(progressEntries));
    } catch (error) {
      console.error("Learning error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load learning resources"
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateProgress(
    learningId: string,
    status: ProgressStatus
  ) {
    try {
      setProgress((current) => ({
        ...current,
        [learningId]: {
          status,
          completedAt:
            status === "COMPLETED"
              ? new Date().toISOString()
              : current[learningId]?.completedAt || null,
        },
      }));

      const response = await fetch(
        `/api/student/learning/${learningId}/progress`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to update progress"
        );
      }

      setProgress((current) => ({
        ...current,
        [learningId]: {
          status: result.progress.status,
          completedAt: result.progress.completedAt,
        },
      }));
    } catch (error) {
      console.error("Progress update error:", error);

      await loadLearning();

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update progress"
      );
    }
  }

  const filteredResources = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return resources;

    return resources.filter((resource) => {
      return (
        resource.title.toLowerCase().includes(query) ||
        resource.notes.toLowerCase().includes(query)
      );
    });
  }, [resources, search]);

  const notStartedCount = resources.filter(
    (resource) =>
      (progress[resource._id]?.status || "NOT_STARTED") ===
      "NOT_STARTED"
  ).length;

  const inProgressCount = resources.filter(
    (resource) =>
      progress[resource._id]?.status === "IN_PROGRESS"
  ).length;

  const completedCount = resources.filter(
    (resource) =>
      progress[resource._id]?.status === "COMPLETED"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-violet-600">
          Learning Workspace
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Learning Resources
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Learn from the resources assigned to your team.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Resources"
          value={resources.length}
          icon={<BookOpen size={20} />}
          iconClass="bg-violet-100 text-violet-700"
        />

        <StatCard
          title="Not Started"
          value={notStartedCount}
          icon={<Circle size={20} />}
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
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search learning resources..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
          />
        </div>

        <div className="text-xs text-slate-400">
          {filteredResources.length} resource
          {filteredResources.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>

          <button
            onClick={loadLearning}
            className="mt-2 text-xs font-semibold text-red-700 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <BookOpen size={26} />
            </div>

            <h2 className="mt-4 text-base font-bold text-slate-800">
              {search
                ? "No resources found"
                : "No learning resources yet"}
            </h2>

            <p className="mt-2 max-w-md text-sm text-slate-400">
              {search
                ? "Try searching with a different keyword."
                : "Your mentor will assign learning resources to your team."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {filteredResources.map((resource) => (
            <LearningCard
              key={resource._id}
              resource={resource}
              progress={
                progress[resource._id]?.status ||
                "NOT_STARTED"
              }
              onProgressChange={updateProgress}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LearningCard({
  resource,
  progress,
  onProgressChange,
}: {
  resource: LearningResource;
  progress: ProgressStatus;
  onProgressChange: (
    learningId: string,
    status: ProgressStatus
  ) => void;
}) {
  const isCompleted = progress === "COMPLETED";
  const isInProgress = progress === "IN_PROGRESS";

  const progressPercentage = isCompleted
    ? 100
    : isInProgress
      ? 50
      : 0;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-violet-200 hover:shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <BookOpen size={20} />
            </div>

            <div className="min-w-0">
              <h2 className="line-clamp-2 text-sm font-bold text-slate-900">
                {resource.title}
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {resource.team?.name || "Team Resource"}
              </p>
            </div>
          </div>

          <ProgressBadge status={progress} />
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {resource.notes ? (
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <FileText
                size={15}
                className="text-slate-500"
              />

              <p className="text-xs font-semibold text-slate-600">
                Notes
              </p>
            </div>

            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-500">
              {resource.notes}
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            No notes provided for this resource.
          </p>
        )}

        {/* Progress */}
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Learning Progress
            </span>

            <span className="text-xs font-semibold text-violet-600">
              {progressPercentage}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-violet-600 transition-all duration-300"
              style={{
                width: `${progressPercentage}%`,
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href={resource.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (progress === "NOT_STARTED") {
                onProgressChange(
                  resource._id,
                  "IN_PROGRESS"
                );
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-700"
          >
            <Play size={14} />
            {isCompleted ? "Watch Again" : "Watch Video"}
          </a>

          <a
            href={resource.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <ExternalLink size={14} />
            Open
          </a>

          {!isCompleted && (
            <>
              {isInProgress && (
                <span className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-700">
                  <Clock3 size={14} />
                  In Progress
                </span>
              )}

              <button
                type="button"
                onClick={() =>
                  onProgressChange(
                    resource._id,
                    "COMPLETED"
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-4 py-2.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
              >
                <CheckCircle2 size={14} />
                Mark Completed
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function ProgressBadge({
  status,
}: {
  status: ProgressStatus;
}) {
  if (status === "COMPLETED") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
        <CheckCircle2 size={12} />
        Completed
      </span>
    );
  }

  if (status === "IN_PROGRESS") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
        <Clock3 size={12} />
        In Progress
      </span>
    );
  }

  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
      <Circle size={12} />
      Not Started
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