"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  BookOpen,
  FileText,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react";

type LearningItem = {
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

type MentorTeam = {
  _id: string;
  name: string;
};

export default function MentorLearningPage() {
  const [learning, setLearning] = useState<LearningItem[]>([]);
  const [teams, setTeams] = useState<MentorTeam[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "COMPLETED"
  >("ALL");

  const [showAddForm, setShowAddForm] = useState(false);

  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [teamId, setTeamId] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchLearning();
  }, []);

  async function fetchLearning() {
    try {
      setLoading(true);

      const response = await fetch("/api/mentor/learning", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load learning resources."
        );
      }

      setLearning(data.learning || []);

      /*
       * The mentor API currently returns the resources and
       * their populated teams. We use those teams for the
       * resource creation dropdown.
       */
      const uniqueTeams = new Map<string, MentorTeam>();

      (data.learning || []).forEach((item: LearningItem) => {
        if (item.team?._id && item.team.name) {
          uniqueTeams.set(item.team._id, {
            _id: item.team._id,
            name: item.team.name,
          });
        }
      });

      setTeams(Array.from(uniqueTeams.values()));
    } catch (error) {
      console.error("Failed to load learning:", error);
      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to load learning resources."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleAddResource(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSubmitting(true);
    setFormError("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/mentor/learning", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          youtubeUrl,
          notes,
          teamId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to add learning resource."
        );
      }

      setSuccessMessage(
        "Learning resource added successfully."
      );

      setTitle("");
      setYoutubeUrl("");
      setNotes("");
      setTeamId("");
      setShowAddForm(false);

      await fetchLearning();
    } catch (error) {
      console.error(
        "Failed to add learning resource:",
        error
      );

      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to add learning resource."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const filteredLearning = useMemo(() => {
    const query = search.trim().toLowerCase();

    return learning.filter((item) => {
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.notes.toLowerCase().includes(query) ||
        item.team?.name.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [learning, search, statusFilter]);

  const activeCount = learning.filter(
    (item) => item.status === "ACTIVE"
  ).length;

  const completedCount = learning.filter(
    (item) => item.status === "COMPLETED"
  ).length;

  return (
    <div className="bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-violet-600">
              Learning
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Learning Resources
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage the learning resources assigned to your
              teams.
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
            Add Learning Resource
          </button>
        </div>

        {/* Success */}
        {successMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {successMessage}
          </div>
        )}

        {/* Add Resource Modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Add Learning Resource
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Add a resource for one of your assigned
                    teams.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close"
                >
                  <X size={19} />
                </button>
              </div>

              {/* Form */}
              <form
                onSubmit={handleAddResource}
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

                {/* Title */}
                <div>
                  <label
                    htmlFor="title"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Resource Title
                  </label>

                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(event) =>
                      setTitle(event.target.value)
                    }
                    required
                    placeholder="e.g. JavaScript Functions"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                {/* YouTube URL */}
                <div>
                  <label
                    htmlFor="youtubeUrl"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    YouTube URL
                  </label>

                  <input
                    id="youtubeUrl"
                    type="url"
                    value={youtubeUrl}
                    onChange={(event) =>
                      setYoutubeUrl(event.target.value)
                    }
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label
                    htmlFor="notes"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Notes
                  </label>

                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(event) =>
                      setNotes(event.target.value)
                    }
                    rows={5}
                    placeholder="Add notes or instructions for your students..."
                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
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
                    onClick={() =>
                      setShowAddForm(false)
                    }
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting || teams.length === 0}
                    className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting
                      ? "Adding..."
                      : "Add Resource"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Total Resources */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Total Resources
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {learning.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <BookOpen size={21} />
              </div>
            </div>
          </div>

          {/* Active */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Active
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {activeCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <BookOpen size={21} />
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
                <FileText size={21} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative w-full lg:max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search learning resources..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
              />
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              {(
                ["ALL", "ACTIVE", "COMPLETED"] as const
              ).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() =>
                    setStatusFilter(status)
                  }
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    statusFilter === status
                      ? "bg-violet-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {status === "ALL"
                    ? "All"
                    : status === "ACTIVE"
                      ? "Active"
                      : "Completed"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-violet-600" />

            <p className="mt-4 text-sm text-slate-500">
              Loading learning resources...
            </p>
          </div>
        ) : filteredLearning.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <BookOpen size={25} />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No learning resources found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              There are no learning resources matching
              your current search or filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredLearning.map((item) => (
              <div
                key={item._id}
                className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-sm"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <BookOpen size={21} />
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      item.status === "COMPLETED"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-cyan-50 text-cyan-700"
                    }`}
                  >
                    {item.status === "COMPLETED"
                      ? "Completed"
                      : "Active"}
                  </span>
                </div>

                {/* Title */}
                <h2 className="mt-5 line-clamp-2 text-base font-bold text-slate-900">
                  {item.title}
                </h2>

                {/* Team */}
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                  <Users size={15} />

                  <span className="truncate">
                    {item.team?.name || "Team"}
                  </span>
                </div>

                {/* Notes */}
                {item.notes && (
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500">
                    {item.notes}
                  </p>
                )}

                {/* Footer */}
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">
                      Added by
                    </p>

                    <p className="truncate text-sm font-medium text-slate-700">
                      {item.createdBy?.name ||
                        "AI Club"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}