"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FolderKanban,
  Users,
  UserRound,
  Mail,
  ExternalLink,
  FileText,
  CheckCircle2,
  Clock3,
  CircleDot,
  X,
  Save,
} from "lucide-react";

type Project = {
  _id: string;
  title: string;
  description: string;
  team?: {
    _id: string;
    name: string;
  };
  createdBy?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  demoUrl?: string;
  documentationUrl?: string;
  status: "PLANNING" | "IN_PROGRESS" | "COMPLETED";
  progress: number;
  createdAt: string;
  updatedAt: string;
};

type Team = {
  _id: string;
  name: string;
};

export default function ProjectDetailsPage() {
  const params = useParams();

  const projectId = String(params.id);

  const [project, setProject] = useState<Project | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

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

  async function loadProject() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/projects/${projectId}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        const text = await response.text();

        console.error("Project API response:", text);

        throw new Error(
          `Project API failed with status ${response.status}`
        );
      }

      const data = await response.json();

      setProject(data.project || null);
    } catch (error) {
      console.error("Failed to load project:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load project."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadTeams() {
    try {
      const response = await fetch("/api/admin/teams", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load teams.");
      }

      const data = await response.json();

      setTeams(
        (data.teams || []).map(
          (team: { _id: string; name: string }) => ({
            _id: team._id,
            name: team.name,
          })
        )
      );
    } catch (error) {
      console.error("Failed to load teams:", error);
    }
  }

  useEffect(() => {
    if (!projectId) return;

    loadProject();
  }, [projectId]);

  function openEditModal() {
    if (!project) return;

    setTitle(project.title);
    setDescription(project.description || "");
    setTeamId(project.team?._id || "");
    setDemoUrl(project.demoUrl || "");
    setDocumentationUrl(project.documentationUrl || "");
    setStatus(project.status);
    setProgress(String(project.progress ?? 0));

    setError("");
    setSuccess("");

    loadTeams();

    setShowEditModal(true);
  }

  async function handleUpdateProject(
    event: React.FormEvent
  ) {
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

      const numericProgress = Number(progress);

      if (
        Number.isNaN(numericProgress) ||
        numericProgress < 0 ||
        numericProgress > 100
      ) {
        setError("Progress must be between 0 and 100.");
        return;
      }

      const response = await fetch(
        `/api/admin/projects/${projectId}`,
        {
          method: "PATCH",
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
            progress: numericProgress,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update project."
        );
      }

      setProject(data.project);

      setSuccess("Project updated successfully.");

      setShowEditModal(false);
    } catch (error) {
      console.error("Update project error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update project."
      );
    } finally {
      setSaving(false);
    }
  }

  function getStatusLabel(
    projectStatus: Project["status"]
  ) {
    if (projectStatus === "IN_PROGRESS") {
      return "In Progress";
    }

    if (projectStatus === "COMPLETED") {
      return "Completed";
    }

    return "Planning";
  }

  function getStatusClasses(
    projectStatus: Project["status"]
  ) {
    if (projectStatus === "COMPLETED") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (projectStatus === "IN_PROGRESS") {
      return "bg-blue-50 text-blue-700";
    }

    return "bg-amber-50 text-amber-700";
  }

  function getStatusIcon(
    projectStatus: Project["status"]
  ) {
    if (projectStatus === "COMPLETED") {
      return <CheckCircle2 size={16} />;
    }

    if (projectStatus === "IN_PROGRESS") {
      return <Clock3 size={16} />;
    }

    return <CircleDot size={16} />;
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading project...
        </p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-5">
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-violet-600"
        >
          <ArrowLeft size={17} />
          Back to Projects
        </Link>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-sm font-semibold text-red-700">
            Project not found
          </p>

          {error && (
            <p className="mt-2 text-xs text-red-600">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/admin/projects"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-violet-600"
      >
        <ArrowLeft size={17} />
        Back to Projects
      </Link>

      {/* Success */}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {success}
        </div>
      )}

      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              <FolderKanban size={26} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">
                  {project.title}
                </h1>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                    project.status
                  )}`}
                >
                  {getStatusIcon(project.status)}
                  {getStatusLabel(project.status)}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                {project.description ||
                  "No project description provided."}
              </p>
            </div>
          </div>

          <button
            onClick={openEditModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            <Save size={17} />
            Edit Project
          </button>
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Progress */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-medium text-slate-500">
            Project Progress
          </p>

          <div className="mt-4 flex items-end justify-between">
            <p className="text-3xl font-bold text-slate-900">
              {project.progress}%
            </p>

            <span className="text-xs text-slate-400">
              Complete
            </span>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
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

        {/* Team */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-medium text-slate-500">
            Assigned Team
          </p>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <Users size={20} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                {project.team?.name || "No team"}
              </p>

              <p className="text-xs text-slate-400">
                Project team
              </p>
            </div>
          </div>
        </div>

        {/* Created By */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-medium text-slate-500">
            Created By
          </p>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <UserRound size={20} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {project.createdBy?.name || "Unknown"}
              </p>

              <p className="truncate text-xs text-slate-400">
                {project.createdBy?.email || "No email"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-bold text-slate-900">
          Project Resources
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          External resources associated with this project.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {project.demoUrl ? (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-violet-200 hover:bg-violet-50/40"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                <ExternalLink size={18} />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Live Demo
                </p>

                <p className="text-xs text-slate-400">
                  Open project demo
                </p>
              </div>
            </a>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-600">
                No demo available
              </p>
            </div>
          )}

          {project.documentationUrl ? (
            <a
              href={project.documentationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-violet-200 hover:bg-violet-50/40"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                <FileText size={18} />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Documentation
                </p>

                <p className="text-xs text-slate-400">
                  Open project documentation
                </p>
              </div>
            </a>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-600">
                No documentation available
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Project Information */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-bold text-slate-900">
          Project Information
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            label="Status"
            value={getStatusLabel(project.status)}
          />

          <InfoItem
            label="Progress"
            value={`${project.progress}%`}
          />

          <InfoItem
            label="Team"
            value={project.team?.name || "No team"}
          />

          <InfoItem
            label="Created"
            value={new Date(
              project.createdAt
            ).toLocaleDateString()}
          />

          <InfoItem
            label="Last Updated"
            value={new Date(
              project.updatedAt
            ).toLocaleDateString()}
          />

          <InfoItem
            label="Creator Role"
            value={project.createdBy?.role || "Unknown"}
          />
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Edit Project
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Update project information and progress.
                </p>
              </div>

              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleUpdateProject}
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
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
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

              {/* Demo */}
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
                  onClick={() =>
                    setShowEditModal(false)
                  }
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={17} />

                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}