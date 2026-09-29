"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FolderKanban,
  Search,
  ArrowUpRight,
  Users,
  CheckCircle2,
  Clock3,
} from "lucide-react";

type Project = {
  _id: string;
  title: string;
  description: string;
  status: "PLANNING" | "IN_PROGRESS" | "COMPLETED";
  progress: number;
  demoUrl?: string;
  documentationUrl?: string;
  createdAt: string;
  team?: {
    _id: string;
    name: string;
  };
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
};

type Team = {
  _id: string;
  name: string;
};

const statusConfig = {
  PLANNING: {
    label: "Planning",
    className: "bg-slate-100 text-slate-700",
    icon: Clock3,
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-violet-100 text-violet-700",
    icon: Clock3,
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-emerald-100 text-emerald-700",
    icon: CheckCircle2,
  },
};

export default function StudentProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/student/projects");

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load projects");
        }

        setProjects(data.projects || []);
        setTeam(data.team || null);
      } catch (error) {
        console.error("Projects load error:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load projects"
        );
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return projects;

    return projects.filter(
      (project) =>
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.status.toLowerCase().includes(query)
    );
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
            <FolderKanban size={16} />
            <span>Projects</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            My Projects
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Work on projects assigned to your team and track your progress.
          </p>
        </div>

        {team && (
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5">
            <Users size={17} className="text-violet-600" />
            <div>
              <p className="text-[11px] text-slate-400">Your Team</p>
              <p className="text-sm font-semibold text-slate-800">
                {team.name}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Projects"
          value={stats.total}
          icon={FolderKanban}
        />

        <StatCard
          label="Planning"
          value={stats.planning}
          icon={Clock3}
        />

        <StatCard
          label="In Progress"
          value={stats.inProgress}
          icon={Clock3}
        />

        <StatCard
          label="Completed"
          value={stats.completed}
          icon={CheckCircle2}
        />
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="grid gap-5 md:grid-cols-2">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <FolderKanban size={25} />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            {search ? "No projects found" : "No projects yet"}
          </h2>

          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            {search
              ? "Try a different search term."
              : "Projects assigned to your team will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filteredProjects.map((project) => {
            const status = statusConfig[project.status];
            const StatusIcon = status.icon;

            return (
              <Link
                key={project._id}
                href={`/student/projects/${project._id}`}
                className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-violet-200 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <FolderKanban size={20} />
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold text-slate-900 group-hover:text-violet-700">
                        {project.title}
                      </h2>

                      <p className="mt-0.5 text-xs text-slate-400">
                        {project.team?.name || team?.name || "Your Team"}
                      </p>
                    </div>
                  </div>

                  <ArrowUpRight
                    size={18}
                    className="shrink-0 text-slate-300 transition group-hover:text-violet-600"
                  />
                </div>

                <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
                  {project.description || "No project description provided."}
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                  >
                    <StatusIcon size={13} />
                    {status.label}
                  </span>

                  <span className="text-xs font-medium text-slate-500">
                    {project.progress}% complete
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-violet-600 transition-all"
                    style={{
                      width: `${Math.min(
                        Math.max(project.progress || 0, 0),
                        100
                      )}%`,
                    }}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs text-slate-400">
                    Created by{" "}
                    <span className="font-medium text-slate-600">
                      {project.createdBy?.name || "AI Club"}
                    </span>
                  </span>

                  {project.demoUrl && (
                    <span className="text-xs font-medium text-violet-600">
                      Demo available
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof FolderKanban;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          <Icon size={19} />
        </div>

        <span className="text-2xl font-bold text-slate-900">
          {value}
        </span>
      </div>

      <p className="mt-4 text-sm font-medium text-slate-500">
        {label}
      </p>
    </div>
  );
}