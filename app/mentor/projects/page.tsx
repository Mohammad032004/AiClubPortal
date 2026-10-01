"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  ExternalLink,
  FileText,
  FolderKanban,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react";

type ProjectItem = {
  _id: string;
  title: string;
  description: string;
  demoUrl: string;
  documentationUrl: string;
  status: "PLANNING" | "IN_PROGRESS" | "COMPLETED";
  progress: number;
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

export default function MentorProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [teams, setTeams] = useState<MentorTeam[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PLANNING" | "IN_PROGRESS" | "COMPLETED"
  >("ALL");

  const [showAddForm, setShowAddForm] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [teamId, setTeamId] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [documentationUrl, setDocumentationUrl] =
    useState("");
  const [status, setStatus] = useState<
    "PLANNING" | "IN_PROGRESS" | "COMPLETED"
  >("PLANNING");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      setLoading(true);
      setFormError("");

      const response = await fetch("/api/mentor/projects", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load projects."
        );
      }

      setProjects(data.projects || []);
      setTeams(data.teams || []);
    } catch (error) {
      console.error("Failed to load projects:", error);

      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to load projects."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleAddProject(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSubmitting(true);
    setFormError("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/mentor/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          teamId,
          demoUrl,
          documentationUrl,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create project."
        );
      }

      setSuccessMessage(
        "Project created successfully."
      );

      setTitle("");
      setDescription("");
      setTeamId("");
      setDemoUrl("");
      setDocumentationUrl("");
      setStatus("PLANNING");

      setShowAddForm(false);

      await fetchProjects();
    } catch (error) {
      console.error("Failed to create project:", error);

      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to create project."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        !query ||
        project.title.toLowerCase().includes(query) ||
        project.description
          .toLowerCase()
          .includes(query) ||
        project.team?.name
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const planningCount = projects.filter(
    (project) => project.status === "PLANNING"
  ).length;

  const inProgressCount = projects.filter(
    (project) => project.status === "IN_PROGRESS"
  ).length;

  const completedCount = projects.filter(
    (project) => project.status === "COMPLETED"
  ).length;

  const statusClasses = {
    PLANNING: "bg-slate-100 text-slate-600",
    IN_PROGRESS: "bg-violet-50 text-violet-700",
    COMPLETED: "bg-emerald-50 text-emerald-700",
  };

  const formatStatus = (
    projectStatus: ProjectItem["status"]
  ) => {
    if (projectStatus === "IN_PROGRESS") {
      return "In Progress";
    }

    if (projectStatus === "PLANNING") {
      return "Planning";
    }

    return "Completed";
  };

  return (
    <div className="bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-violet-600">
              Projects
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Team Projects
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Create and track projects assigned to your
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
            Add Project
          </button>
        </div>

        {/* Success */}
        {successMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {successMessage}
          </div>
        )}

        {/* Add Project Modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Add Project
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Create a project for one of your assigned
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
                onSubmit={handleAddProject}
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
                    Project Title
                  </label>

                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(event) =>
                      setTitle(event.target.value)
                    }
                    required
                    placeholder="e.g. AI-Powered Attendance System"
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
                    placeholder="Describe the project and what the team is expected to build..."
                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                {/* Status */}
                <div>
                  <label
                    htmlFor="status"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Status
                  </label>

                  <select
                    id="status"
                    value={status}
                    onChange={(event) =>
                      setStatus(
                        event.target.value as
                          | "PLANNING"
                          | "IN_PROGRESS"
                          | "COMPLETED"
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  >
                    <option value="PLANNING">
                      Planning
                    </option>

                    <option value="IN_PROGRESS">
                      In Progress
                    </option>

                    <option value="COMPLETED">
                      Completed
                    </option>
                  </select>
                </div>

                {/* URLs */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="demoUrl"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Demo URL
                    </label>

                    <input
                      id="demoUrl"
                      type="url"
                      value={demoUrl}
                      onChange={(event) =>
                        setDemoUrl(event.target.value)
                      }
                      placeholder="https://..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="documentationUrl"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Documentation URL
                    </label>

                    <input
                      id="documentationUrl"
                      type="url"
                      value={documentationUrl}
                      onChange={(event) =>
                        setDocumentationUrl(
                          event.target.value
                        )
                      }
                      placeholder="https://..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
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
                      : "Create Project"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Total Projects
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {projects.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <FolderKanban size={21} />
              </div>
            </div>
          </div>

          {/* Planning */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Planning
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {planningCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <FolderKanban size={21} />
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
                <FolderKanban size={21} />
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
                <FolderKanban size={21} />
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
                placeholder="Search projects, teams..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
              />
            </div>

            {/* Status */}
            <div className="flex flex-wrap gap-2">
              {(
                [
                  "ALL",
                  "PLANNING",
                  "IN_PROGRESS",
                  "COMPLETED",
                ] as const
              ).map((projectStatus) => (
                <button
                  key={projectStatus}
                  type="button"
                  onClick={() =>
                    setStatusFilter(projectStatus)
                  }
                  className={`rounded-xl px-3 py-2 text-xs font-medium transition ${
                    statusFilter === projectStatus
                      ? "bg-violet-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {projectStatus === "ALL"
                    ? "All"
                    : formatStatus(projectStatus)}
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
              Loading projects...
            </p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FolderKanban size={25} />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No projects found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              There are no projects matching your current
              search or filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-sm"
              >
                {/* Top */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <FolderKanban size={21} />
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[project.status]}`}
                  >
                    {formatStatus(project.status)}
                  </span>
                </div>

                {/* Title */}
                <h2 className="mt-5 line-clamp-2 text-base font-bold text-slate-900">
                  {project.title}
                </h2>

                {/* Team */}
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                  <Users size={15} />

                  <span className="truncate">
                    {project.team?.name || "Team"}
                  </span>
                </div>

                {/* Description */}
                {project.description && (
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500">
                    {project.description}
                  </p>
                )}

                {/* Progress */}
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-500">
                      Progress
                    </span>

                    <span className="font-semibold text-slate-700">
                      {project.progress}%
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-violet-600 transition-all"
                      style={{
                        width: `${project.progress}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Links */}
                {(project.demoUrl ||
                  project.documentationUrl) && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                      >
                        <ExternalLink size={14} />
                        Demo
                      </a>
                    )}

                    {project.documentationUrl && (
                      <a
                        href={project.documentationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                      >
                        <FileText size={14} />
                        Documentation
                      </a>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-400">
                    Created by
                  </p>

                  <p className="mt-1 truncate text-sm font-medium text-slate-700">
                    {project.createdBy?.name || "AI Club"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}