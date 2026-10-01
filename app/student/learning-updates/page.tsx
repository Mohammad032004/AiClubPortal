"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  Send,
  MessageCircleQuestion,
} from "lucide-react";

type LearningResource = {
  _id: string;
  title: string;
};

type LearningUpdate = {
  _id: string;
  learned: string;
  practiced: string;
  doubts: string;
  status: "PENDING" | "APPROVED" | "REVISION_REQUIRED";
  mentorFeedback: string;
  createdAt: string;
  learningResource?: {
    title: string;
  };
};

export default function StudentLearningUpdatesPage() {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [updates, setUpdates] = useState<LearningUpdate[]>([]);

  const [learningResource, setLearningResource] = useState("");
  const [learned, setLearned] = useState("");
  const [practiced, setPracticed] = useState("");
  const [doubts, setDoubts] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [resourcesResponse, updatesResponse] =
        await Promise.all([
          fetch("/api/student/learning", {
            cache: "no-store",
          }),
          fetch("/api/student/learning-updates", {
            cache: "no-store",
          }),
        ]);

      const resourcesResult = await resourcesResponse.json();
      const updatesResult = await updatesResponse.json();

      if (!resourcesResponse.ok) {
        throw new Error(
          resourcesResult.message ||
            "Failed to load learning resources."
        );
      }

      if (!updatesResponse.ok) {
        throw new Error(
          updatesResult.message ||
            "Failed to load learning updates."
        );
      }

      setResources(resourcesResult.learning || []);
      setUpdates(updatesResult.updates || []);
    } catch (error) {
      console.error("Learning updates error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load learning updates."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "/api/student/learning-updates",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            learningResource,
            learned,
            practiced,
            doubts,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to submit learning update."
        );
      }

      setSuccess(
        "Learning update submitted successfully. Your mentor can now review it."
      );

      setLearningResource("");
      setLearned("");
      setPracticed("");
      setDoubts("");

      await loadData();
    } catch (error) {
      console.error("Submit learning update error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to submit learning update."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 animate-pulse rounded-2xl bg-white" />

        <div className="h-[500px] animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-violet-600">
          Learning Journal
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          What Did You Learn?
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Share what you learned, what you practiced, and
          anything you are still confused about.
        </p>
      </div>

      {/* Messages */}
      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2
            size={19}
            className="mt-0.5 shrink-0 text-emerald-600"
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

      {/* Learning Update Form */}
      <section className="rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <BookOpen size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Learning Update
              </h2>

              <p className="text-sm text-slate-500">
                Tell us about your learning progress.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-5 sm:p-6"
        >
          {/* Resource */}
          <div>
            <label
              htmlFor="learningResource"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              What did you learn from?
            </label>

            <select
              id="learningResource"
              value={learningResource}
              onChange={(event) =>
                setLearningResource(event.target.value)
              }
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            >
              <option value="">
                Select a learning resource
              </option>

              {resources.map((resource) => (
                <option
                  key={resource._id}
                  value={resource._id}
                >
                  {resource.title}
                </option>
              ))}
            </select>
          </div>

          {/* What did you learn */}
          <div>
            <label
              htmlFor="learned"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              What did you learn today?
            </label>

            <textarea
              id="learned"
              value={learned}
              onChange={(event) =>
                setLearned(event.target.value)
              }
              required
              rows={5}
              placeholder="Write what you learned..."
              className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          {/* What did you practice */}
          <div>
            <label
              htmlFor="practiced"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              What did you practice?
            </label>

            <textarea
              id="practiced"
              value={practiced}
              onChange={(event) =>
                setPracticed(event.target.value)
              }
              required
              rows={5}
              placeholder="Write what you practiced..."
              className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          {/* Doubts */}
          <div>
            <label
              htmlFor="doubts"
              className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
            >
              <MessageCircleQuestion
                size={17}
                className="text-slate-400"
              />

              What are you still confused about?
            </label>

            <textarea
              id="doubts"
              value={doubts}
              onChange={(event) =>
                setDoubts(event.target.value)
              }
              rows={4}
              placeholder="Write your doubts..."
              className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end border-t border-slate-100 pt-5">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={17} />

              {submitting
                ? "Submitting..."
                : "Submit Update"}
            </button>
          </div>
        </form>
      </section>

      {/* Previous Updates */}
      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900">
            My Learning Updates
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Your previous learning submissions and mentor
            feedback.
          </p>
        </div>

        {updates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <BookOpen
              size={25}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-sm font-medium text-slate-600">
              No learning updates yet
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Your submitted updates will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {updates.map((update) => (
              <LearningUpdateCard
                key={update._id}
                update={update}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function LearningUpdateCard({
  update,
}: {
  update: LearningUpdate;
}) {
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

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-violet-600">
            Learning Resource
          </p>

          <h3 className="mt-1 break-words text-base font-semibold text-slate-900">
            {update.learningResource?.title ||
              "Learning Resource"}
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            {new Date(update.createdAt).toLocaleDateString(
              "en-IN",
              {
                day: "numeric",
                month: "short",
                year: "numeric",
              }
            )}
          </p>
        </div>

        <span
          className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}
        >
          <StatusIcon size={13} />

          {config.label}
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <InfoBlock
          title="What I learned"
          content={update.learned}
        />

        <InfoBlock
          title="What I practiced"
          content={update.practiced}
        />

        <InfoBlock
          title="My doubts"
          content={
            update.doubts ||
            "No doubts mentioned."
          }
        />
      </div>

      {update.mentorFeedback && (
        <div className="mt-5 rounded-xl border border-violet-100 bg-violet-50/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
            Mentor Feedback
          </p>

          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
            {update.mentorFeedback}
          </p>
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
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-semibold text-slate-600">
        {title}
      </p>

      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-500">
        {content}
      </p>
    </div>
  );
}