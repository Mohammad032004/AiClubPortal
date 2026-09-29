"use client";

import {
  Plus,
  Search,
  Users,
  UserRound,
  ShieldCheck,
  FolderKanban,
  X,
} from "lucide-react";
import { useState } from "react";

type Team = {
  id: number;
  name: string;
  mentor: string;
  members: number;
  status: "ACTIVE" | "COMPLETED" | "PENDING";
};

const initialTeams: Team[] = [
  {
    id: 1,
    name: "Team Alpha",
    mentor: "Rahul Sharma",
    members: 4,
    status: "ACTIVE",
  },
  {
    id: 2,
    name: "Code Warriors",
    mentor: "Priya Singh",
    members: 5,
    status: "ACTIVE",
  },
  {
    id: 3,
    name: "Tech Titans",
    mentor: "Aman Verma",
    members: 4,
    status: "COMPLETED",
  },
];

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    mentor: "",
    members: "",
  });

  function handleCreateTeam(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name || !form.mentor || !form.members) {
      return;
    }

    const newTeam: Team = {
      id: Date.now(),
      name: form.name,
      mentor: form.mentor,
      members: Number(form.members),
      status: "ACTIVE",
    };

    setTeams((previous) => [...previous, newTeam]);

    setForm({
      name: "",
      mentor: "",
      members: "",
    });

    setShowCreateForm(false);
  }

  const filteredTeams = teams.filter((team) => {
    const searchText = search.toLowerCase();

    return (
      team.name.toLowerCase().includes(searchText) ||
      team.mentor.toLowerCase().includes(searchText)
    );
  });

  const activeTeams = teams.filter(
    (team) => team.status === "ACTIVE"
  );

  const completedTeams = teams.filter(
    (team) => team.status === "COMPLETED"
  );

  const totalStudents = teams.reduce(
    (total, team) => total + team.members,
    0
  );

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-8 lg:px-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Teams
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Create and manage AI Club teams and their members.
          </p>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          className="flex w-fit items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
        >
          <Plus size={18} />
          Create Team
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Teams"
          value={teams.length}
          icon={<Users size={21} />}
          iconClass="bg-violet-50 text-violet-600"
        />

        <StatCard
          title="Active Teams"
          value={activeTeams.length}
          icon={<ShieldCheck size={21} />}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Completed Teams"
          value={completedTeams.length}
          icon={<FolderKanban size={21} />}
          iconClass="bg-cyan-50 text-cyan-600"
        />

        <StatCard
          title="Students Assigned"
          value={totalStudents}
          icon={<UserRound size={21} />}
          iconClass="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Teams Section */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {/* Section Header */}
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              All Teams
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Manage teams, mentors and students.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search teams..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>
        </div>

        {/* Teams */}
        {filteredTeams.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <Users size={25} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No teams found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Try another search or create a new team.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Team
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Mentor
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Students
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredTeams.map((team) => (
                  <tr
                    key={team.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    {/* Team */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                          <Users size={19} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {team.name}
                          </p>

                          <p className="text-xs text-slate-400">
                            AI Club Team
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Mentor */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-50 text-cyan-700">
                          <ShieldCheck size={15} />
                        </div>

                        <span className="text-sm text-slate-600">
                          {team.mentor}
                        </span>
                      </div>
                    </td>

                    {/* Students */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <UserRound
                          size={16}
                          className="text-slate-400"
                        />

                        {team.members} Students
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          team.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700"
                            : team.status === "COMPLETED"
                              ? "bg-cyan-50 text-cyan-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {team.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-5">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Create New Team
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create a team and assign a mentor.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={19} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleCreateTeam}
              className="space-y-5 p-6"
            >
              {/* Team Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Team Name
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      name: event.target.value,
                    })
                  }
                  placeholder="e.g. Team Alpha"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              {/* Mentor */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Assign Mentor
                </label>

                <select
                  value={form.mentor}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      mentor: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                >
                  <option value="" disabled>
                    Select mentor
                  </option>

                  <option value="Rahul Sharma">
                    Rahul Sharma
                  </option>

                  <option value="Priya Singh">
                    Priya Singh
                  </option>

                  <option value="Aman Verma">
                    Aman Verma
                  </option>
                </select>
              </div>

              {/* Students */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Number of Students
                </label>

                <input
                  type="number"
                  min="1"
                  value={form.members}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      members: event.target.value,
                    })
                  }
                  placeholder="e.g. 4"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  Student selection will be connected to MongoDB later.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                >
                  Create Team
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
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <div>
          <p className="text-sm text-slate-500">{title}</p>

          <p className="text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}