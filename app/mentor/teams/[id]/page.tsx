"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Users,
  UsersRound,
  Mail,
  CheckCircle2,
  Clock3,
} from "lucide-react";

type Student = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

type Mentor = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

type Team = {
  _id: string;
  name: string;
  status: "ACTIVE" | "COMPLETED" | "PENDING";
  mentor: Mentor;
  students: Student[];
};

export default function MentorTeamDetailsPage() {
  const params = useParams();
  const teamId = params.id as string;

  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeam() {
      try {
        const response = await fetch(
          `/api/mentor/teams/${teamId}`
        );

        if (!response.ok) {
          throw new Error("Failed to load team");
        }

        const data = await response.json();

        if (data.success) {
          setTeam(data.team);
        }
      } catch (error) {
        console.error("Team details error:", error);
      } finally {
        setLoading(false);
      }
    }

    if (teamId) {
      loadTeam();
    }
  }, [teamId]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading team...
        </p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="p-6 sm:p-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-medium text-red-600">
            Team not found or you do not have access to this team.
          </p>

          <Link
            href="/mentor/teams"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-700"
          >
            <ArrowLeft size={16} />
            Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  const statusStyles =
    team.status === "ACTIVE"
      ? "bg-emerald-50 text-emerald-600"
      : team.status === "COMPLETED"
        ? "bg-blue-50 text-blue-600"
        : "bg-amber-50 text-amber-600";

  return (
    <div className="bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-7">
        {/* Back */}
        <Link
          href="/mentor/teams"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-violet-600"
        >
          <ArrowLeft size={16} />
          Back to Teams
        </Link>

        {/* Team Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <UsersRound size={26} />
              </div>

              <div>
                <p className="text-sm font-medium text-violet-600">
                  Team
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                  {team.name}
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  {team.students?.length || 0} members assigned
                </p>
              </div>
            </div>

            <span
              className={`self-start rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyles}`}
            >
              {team.status}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Users size={18} />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Members
                </p>

                <p className="text-xl font-bold text-slate-900">
                  {team.students?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={18} />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Status
                </p>

                <p className="text-xl font-bold text-slate-900">
                  {team.status}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Clock3 size={18} />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Workspace
                </p>

                <p className="text-xl font-bold text-slate-900">
                  Active
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <h2 className="font-semibold text-slate-900">
              Team Members
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Students assigned to this team
            </p>
          </div>

          {team.students?.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <Users
                size={34}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm font-medium text-slate-600">
                No members assigned
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Students assigned to this team will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {team.students.map((student) => (
                <div
                  key={student._id}
                  className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                      {student.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {student.name}
                      </p>

                      <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                        <Mail size={13} />

                        <span className="truncate">
                          {student.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="hidden rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500 sm:block">
                    Student
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mentor */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">
            Account
          </h2>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-50 text-sm font-bold text-cyan-700">
              {team.mentor?.name
                ?.charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                {team.mentor?.name}
              </p>

              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                <Mail size={13} />
                {team.mentor?.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}