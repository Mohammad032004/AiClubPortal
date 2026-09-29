"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FolderKanban,
  Plus,
  Search,
  X,
  Users,
  ExternalLink,
  CheckCircle2,
  Clock3,
  CircleDot,
  FileText,
} from "lucide-react";

type Team = {
  _id: string;
  name: string;
};

type Project = {
  _id: string;
  title: string;
  description: string;
  team?: {
    _id: string;
    name: string;
  };
  demoUrl?: string;
  documentationUrl?: string;
  status: "PLANNING" | "IN_PROGRESS" | "COMPLETED";
  progress: number;
  createdAt: string;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [teamId, setTeamId] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [documentationUrl, setDocumentationUrl] = useState("");

  const [status, setStatus] = useState<
    "PLANNING" | "IN_PROGRESS" | "COMPLETED"
  >("PLANNING");

  const [progress, setProgress] = useState("0");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [projectsResponse, teamsResponse] = await Promise.all([
        fetch("/api/admin/projects", {
          cache: "no-store",
        }),
        fetch("/api/admin/teams", {
          cache: "no-store",
        }),
      ]);

      if (!projectsResponse.ok) {
        const text = await projectsResponse.text();

        console.error("Projects API response:", text);

        throw new Error(
          `Projects API failed with status ${projectsResponse.status}`
        );
      }

      if (!teamsResponse.ok) {
        const text = await teamsResponse.text();

        console.error("Teams API response:", text);

        throw new Error(
          `Teams API failed with status ${teamsResponse.status}`
        );
      }

      const projectsData = await projectsResponse.json();
      const teamsData = await teamsResponse.json();

      setProjects(projectsData.projects || []);

      setTeams(
        (teamsData.teams || []).map(
          (team: { _id: string; name: string }) => ({
            _id: team._id,
            name: team.name,
          })
        )
      );
    } catch (error) {
      console.error("Failed to load project data:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load project data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setTitle("");
    setDescription("");
    setTeamId("");
    setDemoUrl("");
    setDocumentationUrl("");
    setStatus("PLANNING");
    setProgress("0");
    setError("");
  }

  async function handleCreateProject(event: FormEvent) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!title.trim()) {
        setError("Project title is required.");
        return;
      }

      if (!teamId) {
        setError("Please select a team.");
        return;
      }

      const response = await fetch("/api/admin/projects", {
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
          progress: Number(progress),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create project."
        );
      }

      setSuccess("Project created successfully.");

      resetForm();

      setShowModal(false);

      await loadData();
    } catch (error) {
      console.error("Create project error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create project."
      );
    } finally {
      setSaving(false);
    }
  }

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return projects;

    return projects.filter((project) => {
      return (
        project.title.toLowerCase().includes(query) ||
        project.team?.name?.toLowerCase().includes(query) ||
        project.status.toLowerCase().includes(query)
      );
    });
  }, [projects, search]);

  const stats = {
    total: projects.length,

    planning: projects.filter(
      (project) => project.status === "PLANNING"
    ).length,

    inProgress: projects.filter(
      (project) => project.status === "IN_PROGRESS"
    ).length,

    completed: projects.filter(
      (project) => project.status === "COMPLETED"
    ).length,
  };

  function getStatusLabel(status: Project["status"]) {
    if (status === "IN_PROGRESS") return "In Progress";

    if (status === "COMPLETED") return "Completed";

    return "Planning";
  }

  function getStatusClasses(status: Project["status"]) {
    if (status === "COMPLETED") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (status === "IN_PROGRESS") {
      return "bg-blue-50 text-blue-700";
    }

    return "bg-amber-50 text-amber-700";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Projects
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage team projects, progress, demos and documentation.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
        >
          <Plus size={18} />
          Add Project
        </button>
      </div>

      {/* Success */}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {success}
        </div>
      )}

      {/* Error */}
      {error && !showModal && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Projects"
          value={stats.total}
          icon={<FolderKanban size={20} />}
          iconClass="bg-violet-100 text-violet-700"
        />

        <StatCard
          title="Planning"
          value={stats.planning}
          icon={<CircleDot size={20} />}
          iconClass="bg-amber-100 text-amber-700"
        />

        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={<Clock3 size={20} />}
          iconClass="bg-blue-100 text-blue-700"
        />

        <StatCard
          title="Completed"
          value={stats.completed}
          icon={<CheckCircle2 size={20} />}
          iconClass="bg-emerald-100 text-emerald-700"
        />
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search projects..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
          />
        </div>
      </div>

      {/* Projects Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Project
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Team
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Progress
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Links
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    Loading projects...
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center"
                  >
                    <FolderKanban
                      size={30}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-medium text-slate-700">
                      No projects found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Create a project to get started.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr
                    key={project._id}
                    className="transition hover:bg-slate-50/60"
                  >
                    {/* Project */}
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/projects/${project._id}`}
                        className="text-sm font-semibold text-slate-900 transition hover:text-violet-600"
                      >
                        {project.title}
                      </Link>

                      <p className="mt-1 max-w-sm truncate text-xs text-slate-400">
                        {project.description || "No description"}
                      </p>
                    </td>

                    {/* Team */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                          <Users size={16} />
                        </div>

                        <span className="text-sm font-medium text-slate-700">
                          {project.team?.name || "No team"}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                          project.status
                        )}`}
                      >
                        {getStatusLabel(project.status)}
                      </span>
                    </td>

                    {/* Progress */}
                    <td className="px-6 py-4">
                      <div className="w-36">
                        <div className="mb-1.5 flex items-center justify-between text-xs">
                          <span className="text-slate-500">
                            Progress
                          </span>

                          <span className="font-semibold text-slate-700">
                            {project.progress}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-violet-600 transition-all"
                            style={{
                              width: `${Math.min(
                                Math.max(project.progress, 0),
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Links */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {project.demoUrl && (
                          <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                            title="Live Demo"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}

                        {project.documentationUrl && (
                          <a
                            href={project.documentationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                            title="Documentation"
                          >
                            <FileText size={16} />
                          </a>
                        )}

                        {!project.demoUrl &&
                          !project.documentationUrl && (
                            <span className="text-xs text-slate-400">
                              No links
                            </span>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Create Project
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Assign a project to an existing team.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleCreateProject}
              className="space-y-5 p-6"
            >
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Project Title
                </label>

                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Enter project title"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Describe the project..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              {/* Team + Status */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Team
                  </label>

                  <select
                    value={teamId}
                    onChange={(event) =>
                      setTeamId(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  >
                    <option value="">Select a team</option>

                    {teams.length === 0 ? (
                      <option value="" disabled>
                        No teams available
                      </option>
                    ) : (
                      teams.map((team) => (
                        <option key={team._id} value={team._id}>
                          {team.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Status
                  </label>

                  <select
                    value={status}
                    onChange={(event) =>
                      setStatus(
                        event.target.value as Project["status"]
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  >
                    <option value="PLANNING">Planning</option>
                    <option value="IN_PROGRESS">
                      In Progress
                    </option>
                    <option value="COMPLETED">
                      Completed
                    </option>
                  </select>
                </div>
              </div>

              {/* Progress */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Progress (%)
                </label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(event) =>
                    setProgress(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              {/* Demo URL */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Demo URL
                </label>

                <input
                  type="url"
                  value={demoUrl}
                  onChange={(event) =>
                    setDemoUrl(event.target.value)
                  }
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              {/* Documentation */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Documentation URL
                </label>

                <input
                  type="url"
                  value={documentationUrl}
                  onChange={(event) =>
                    setDocumentationUrl(event.target.value)
                  }
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus size={17} />

                  {saving ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
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