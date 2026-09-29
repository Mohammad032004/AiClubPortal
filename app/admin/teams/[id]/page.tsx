"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  UserRound,
  Mail,
  FolderKanban,
  CheckCircle2,
  Clock3,
  CircleDot,
} from "lucide-react";

type Member = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

type Team = {
  _id: string;
  name: string;
  status: "ACTIVE" | "COMPLETED" | "PENDING";
  mentor: Member;
  students: Member[];
  createdAt: string;
};

export default function TeamDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTeam() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/admin/teams/${params.id}`);
const text = await response.text();

if (!response.ok) {
  throw new Error(`Failed to load team (${response.status})`);
}

if (!text) {
  throw new Error("Server returned an empty response.");
}

const data = JSON.parse(text);

if (!data.success) {
  throw new Error(data.message || "Failed to load team.");
}

if (!data.team) {
  throw new Error("Team not found.");
}

setTeam(data.team);
      } catch (err) {
        console.error("Team details error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load team details."
        );
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadTeam();
    }
  }, [params.id]);

  const getStatusStyles = (status: Team["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "COMPLETED":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";

      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-100" />

        <div className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white" />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white lg:col-span-2" />
          <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/teams"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-violet-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Teams
        </Link>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-800">
            Unable to load team
          </h2>

          <p className="mt-1 text-sm text-red-600">
            {error || "Team not found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/admin/teams"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-violet-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Teams
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
                <Users className="h-6 w-6 text-violet-600" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {team.name}
                </h1>

                <p className="text-sm text-slate-500">
                  Team ID: {team._id}
                </p>
              </div>
            </div>
          </div>

          <span
            className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${getStatusStyles(
              team.status
            )}`}
          >
            <CircleDot className="h-3.5 w-3.5" />
            {team.status}
          </span>
        </div>
      </div>

      {/* Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-violet-50 p-2">
              <Users className="h-5 w-5 text-violet-600" />
            </div>

            <div>
              <p className="text-sm text-slate-500">Team Members</p>
              <p className="text-xl font-bold text-slate-900">
                {team.students.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-cyan-50 p-2">
              <UserRound className="h-5 w-5 text-cyan-600" />
            </div>

            <div>
              <p className="text-sm text-slate-500">Mentor</p>
              <p className="text-base font-bold text-slate-900">
                {team.mentor?.name || "Not assigned"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2">
              <Clock3 className="h-5 w-5 text-amber-600" />
            </div>

            <div>
              <p className="text-sm text-slate-500">Status</p>
              <p className="text-base font-bold text-slate-900">
                {team.status}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>

            <div>
              <p className="text-sm text-slate-500">Projects</p>
              <p className="text-xl font-bold text-slate-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Students */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Team Members
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Students assigned to this team
                </p>
              </div>

              <span className="rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700">
                {team.students.length} Students
              </span>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {team.students.length > 0 ? (
              team.students.map((student) => (
                <div
                  key={student._id}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">
                      {student.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">
                        {student.name}
                      </p>

                      <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="truncate">
                          {student.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="hidden rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 sm:inline-flex">
                    STUDENT
                  </span>
                </div>
              ))
            ) : (
              <div className="px-6 py-10 text-center">
                <Users className="mx-auto h-8 w-8 text-slate-300" />

                <p className="mt-2 text-sm text-slate-500">
                  No students assigned to this team.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mentor */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Assigned Mentor
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Mentor responsible for this team
            </p>
          </div>

          <div className="p-6">
            {team.mentor ? (
              <>
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-100 text-lg font-bold text-cyan-700">
                    {team.mentor.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900">
                      {team.mentor.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Mentor
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="h-4 w-4" />
                    <span className="break-all">
                      {team.mentor.email}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                No mentor assigned.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming modules */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
            <CircleDot className="h-5 w-5 text-violet-600" />
          </div>

          <h3 className="mt-4 font-semibold text-slate-900">
            Learning
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Track learning resources, completion and mentor reviews.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50">
            <CheckCircle2 className="h-5 w-5 text-cyan-600" />
          </div>

          <h3 className="mt-4 font-semibold text-slate-900">
            Tasks
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            View assignments, submissions and mentor feedback.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
            <FolderKanban className="h-5 w-5 text-emerald-600" />
          </div>

          <h3 className="mt-4 font-semibold text-slate-900">
            Project
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Manage the team's project, milestones and progress.
          </p>
        </div>
      </div>
    </div>
  );
}