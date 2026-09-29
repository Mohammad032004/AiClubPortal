"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  FolderKanban,
  Users,
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
  updatedAt: string;
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

export default function StudentProjectDetailsPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProject() {
      try {
        const id = window.location.pathname.split("/").pop();

        if (!id) {
          throw new Error("Project ID is missing");
        }

        const response = await fetch(`/api/student/projects/${id}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load project");
        }

        setProject(data.project);
      } catch (error) {
        console.error("Project details error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load project"
        );
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
        <div className="h-40 animate-pulse rounded-2xl bg-white" />
        <div className="h-64 animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-5">
        <Link
          href="/student/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-violet-600"
        >
          <ArrowLeft size={16} />
          Back to Projects
        </Link>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
          {error || "Project not found"}
        </div>
      </div>
    );
  }

  const status = statusConfig[project.status];
  const StatusIcon = status.icon;

  const progress = Math.min(
    Math.max(project.progress || 0, 0),
    100
  );

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/student/projects"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-violet-600"
      >
        <ArrowLeft size={16} />
        Back to Projects
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <FolderKanban size={25} />
            </div>

            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                >
                  <StatusIcon size={13} />
                  {status.label}
                </span>

                <span className="text-xs text-slate-400">
                  {progress}% complete
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {project.title}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {project.team?.name || "Your Team"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                Live Demo
                <ArrowUpRight size={16} />
              </a>
            )}

            {project.documentationUrl && (
              <a
                href={project.documentationUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Documentation
                <FileText size={16} />
              </a>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mt-7">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">
              Project Progress
            </span>

            <span className="text-sm font-semibold text-violet-600">
              {progress}%
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-violet-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Description */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <BookOpen size={19} />
              </div>

              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Project Overview
                </h2>

                <p className="text-xs text-slate-400">
                  Description and project information
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                {project.description || "No project description provided."}
              </p>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <Users size={19} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Team
              </h2>

              <p className="text-xs text-slate-400">
                Assigned team
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-800">
              {project.team?.name || "Your Team"}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Project team
            </p>
          </div>

          {project.createdBy && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-400">
                Created by
              </p>

              <p className="mt-1 text-sm font-medium text-slate-700">
                {project.createdBy.name}
              </p>

              <p className="mt-0.5 text-xs text-slate-400">
                {project.createdBy.email}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Project information */}
      <div className="grid gap-4 sm:grid-cols-3">
        <InfoCard
          icon={FolderKanban}
          label="Status"
          value={status.label}
        />

        <InfoCard
          icon={CheckCircle2}
          label="Progress"
          value={`${progress}%`}
        />

        <InfoCard
          icon={Clock3}
          label="Last Updated"
          value={new Date(project.updatedAt).toLocaleDateString()}
        />
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FolderKanban;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          <Icon size={17} />
        </div>

        <div>
          <p className="text-xs text-slate-400">{label}</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-800">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}