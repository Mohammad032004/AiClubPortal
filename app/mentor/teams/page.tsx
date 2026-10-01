"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  UsersRound,
  Search,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Users,
} from "lucide-react";

type Student = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

type Team = {
  _id: string;
  name: string;
  status: "ACTIVE" | "COMPLETED" | "PENDING";
  students?: Student[];
};

export default function MentorTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeams() {
      try {
        const response = await fetch("/api/mentor/teams");

        if (!response.ok) {
          throw new Error("Failed to load teams");
        }

        const data = await response.json();

        if (data.success) {
          setTeams(data.teams || []);
        }
      } catch (error) {
        console.error("Mentor teams error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTeams();
  }, []);

  const filteredTeams = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return teams;

    return teams.filter((team) =>
      team.name.toLowerCase().includes(query)
    );
  }, [teams, search]);

  const activeTeams = teams.filter(
    (team) => team.status === "ACTIVE"
  ).length;

  const completedTeams = teams.filter(
    (team) => team.status === "COMPLETED"
  ).length;

  const totalStudents = teams.reduce(
    (total, team) => total + (team.students?.length || 0),
    0
  );

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading teams...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Header */}
        <div>
          <p className="text-sm font-medium text-violet-600">
            Mentor Workspace
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            My Teams
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View and manage the teams assigned to you.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Teams
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {teams.length}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <UsersRound size={19} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active Teams
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {activeTeams}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={19} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Completed
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {completedTeams}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Clock3 size={19} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Students
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {totalStudents}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <Users size={19} />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search teams..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
            />
          </div>
        </div>

        {/* Teams */}
        {filteredTeams.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <UsersRound
              size={36}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-4 text-base font-semibold text-slate-700">
              {search
                ? "No teams found"
                : "No teams assigned"}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {search
                ? "Try a different team name."
                : "Teams assigned to you will appear here."}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredTeams.map((team) => (
              <Link
                key={team._id}
                href={`/mentor/teams/${team._id}`}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <UsersRound size={20} />
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      team.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-600"
                        : team.status === "COMPLETED"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {team.status}
                  </span>
                </div>

                <h2 className="mt-5 truncate text-base font-semibold text-slate-900">
                  {team.name}
                </h2>

                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                  <Users size={16} />
                  <span>
                    {team.students?.length || 0}{" "}
                    {team.students?.length === 1
                      ? "student"
                      : "students"}
                  </span>
                </div>

                {/* Student Preview */}
                {team.students &&
                  team.students.length > 0 && (
                    <div className="mt-5 flex items-center">
                      <div className="flex -space-x-2">
                        {team.students
                          .slice(0, 4)
                          .map((student) => (
                            <div
                              key={student._id}
                              title={student.name}
                              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-violet-100 text-xs font-bold text-violet-700"
                            >
                              {student.name
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          ))}
                      </div>

                      {team.students.length > 4 && (
                        <span className="ml-3 text-xs text-slate-400">
                          +{team.students.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs font-medium text-slate-400">
                    View team details
                  </span>

                  <ArrowRight
                    size={17}
                    className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-violet-600"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}