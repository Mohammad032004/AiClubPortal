"use client";

import { useEffect, useState } from "react";
import {
  Users,
  UserRound,
  Mail,
  ShieldCheck,
  CircleCheck,
  Clock3,
} from "lucide-react";

type Person = {
  _id: string;
  name: string;
  email: string;
  role?: string;
};

type Team = {
  _id: string;
  name: string;
  status: "ACTIVE" | "COMPLETED" | "PENDING";
  mentor: Person | null;
  students: Person[];
  createdAt: string;
};

const statusConfig = {
  ACTIVE: {
    label: "Active",
    className: "bg-emerald-100 text-emerald-700",
    icon: CircleCheck,
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-violet-100 text-violet-700",
    icon: CircleCheck,
  },
  PENDING: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700",
    icon: Clock3,
  },
};

export default function StudentTeamPage() {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTeam() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/student/team");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load team");
        }

        setTeam(data.team);
      } catch (error) {
        console.error("Team load error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load team"
        );
      } finally {
        setLoading(false);
      }
    }

    loadTeam();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
        <div className="h-36 animate-pulse rounded-2xl bg-white" />
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="h-48 animate-pulse rounded-2xl bg-white" />
          <div className="h-48 animate-pulse rounded-2xl bg-white lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!team) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
          <Users size={25} />
        </div>

        <h1 className="mt-4 text-lg font-semibold text-slate-900">
          No team assigned
        </h1>

        <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
          You have not been assigned to a team yet. Your team information
          will appear here once you are assigned.
        </p>
      </div>
    );
  }

  const status = statusConfig[team.status] || statusConfig.ACTIVE;
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-violet-600">
          Team Workspace
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          My Team
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View your team members, mentor, and team information.
        </p>
      </div>

      {/* Team header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              <Users size={26} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {team.name}
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {team.students.length}{" "}
                {team.students.length === 1 ? "member" : "members"}
              </p>
            </div>
          </div>

          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${status.className}`}
          >
            <StatusIcon size={14} />
            {status.label}
          </span>
        </div>
      </div>

      {/* Mentor + Members */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Mentor */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <ShieldCheck size={19} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Team Mentor
              </h2>

              <p className="text-xs text-slate-400">
                Your assigned mentor
              </p>
            </div>
          </div>

          {team.mentor ? (
            <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <Avatar
                  name={team.mentor.name}
                  variant="cyan"
                />

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {team.mentor.name}
                  </p>

                  <p className="truncate text-xs text-slate-400">
                    Mentor
                  </p>
                </div>
              </div>

              <a
                href={`mailto:${team.mentor.email}`}
                className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500 transition hover:text-violet-600"
              >
                <Mail size={14} />
                <span className="truncate">{team.mentor.email}</span>
              </a>
            </div>
          ) : (
            <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-400">
              No mentor assigned.
            </div>
          )}
        </div>

        {/* Members */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Users size={19} />
              </div>

              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Team Members
                </h2>

                <p className="text-xs text-slate-400">
                  Students in your team
                </p>
              </div>
            </div>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {team.students.length}
            </span>
          </div>

          {team.students.length > 0 ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {team.students.map((student) => (
                <div
                  key={student._id}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3"
                >
                  <Avatar name={student.name} />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {student.name}
                    </p>

                    <p className="truncate text-xs text-slate-400">
                      {student.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-400">
              No team members found.
            </div>
          )}
        </div>
      </div>

      {/* Team information */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <UserRound size={19} />
          </div>

          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Team Information
            </h2>

            <p className="text-xs text-slate-400">
              Basic team details
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <InfoItem
            label="Team Name"
            value={team.name}
          />

          <InfoItem
            label="Members"
            value={String(team.students.length)}
          />

          <InfoItem
            label="Status"
            value={status.label}
          />
        </div>
      </div>
    </div>
  );
}

function Avatar({
  name,
  variant = "violet",
}: {
  name: string;
  variant?: "violet" | "cyan";
}) {
  const initial = name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
        variant === "cyan"
          ? "bg-cyan-100 text-cyan-700"
          : "bg-violet-100 text-violet-700"
      }`}
    >
      {initial}
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
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs text-slate-400">{label}</p>

      <p className="mt-1 text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}