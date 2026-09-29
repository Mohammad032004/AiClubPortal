"use client";

import {
  FolderKanban,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

type User = {
  _id: string;
  name: string;
  email: string;
  role: "MENTOR" | "STUDENT";
};

type Team = {
  _id: string;
  name: string;
  mentor: User;
  students: User[];
  status: "ACTIVE" | "COMPLETED" | "PENDING";
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [mentors, setMentors] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [search, setSearch] = useState("");

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    mentorId: "",
    studentIds: [] as string[],
  });

  // ==========================================
  // LOAD MEMBERS + TEAMS
  // ==========================================

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      // -------------------------------
      // Load members
      // -------------------------------

      const membersResponse = await fetch(
        "/api/admin/members",
        {
          cache: "no-store",
        }
      );

      const membersText = await membersResponse.text();

      console.log("Members API:", {
        status: membersResponse.status,
        body: membersText,
      });

      if (!membersText) {
        throw new Error(
          `Members API returned an empty response (${membersResponse.status}).`
        );
      }

      let membersData;

      try {
        membersData = JSON.parse(membersText);
      } catch {
        throw new Error(
          `Members API returned invalid JSON: ${membersText}`
        );
      }

      if (!membersResponse.ok) {
        throw new Error(
          membersData.message || "Failed to load members."
        );
      }

      const members: User[] = membersData.members || [];

      // Separate mentors and students
      setMentors(
        members.filter(
          (member) => member.role === "MENTOR"
        )
      );

      setStudents(
        members.filter(
          (member) => member.role === "STUDENT"
        )
      );

      // -------------------------------
      // Load teams
      // -------------------------------

      const teamsResponse = await fetch(
        "/api/admin/teams",
        {
          cache: "no-store",
        }
      );

      const teamsText = await teamsResponse.text();

      console.log("Teams API:", {
        status: teamsResponse.status,
        body: teamsText,
      });

      if (!teamsText) {
        throw new Error(
          `Teams API returned an empty response (${teamsResponse.status}).`
        );
      }

      let teamsData;

      try {
        teamsData = JSON.parse(teamsText);
      } catch {
        throw new Error(
          `Teams API returned invalid JSON: ${teamsText}`
        );
      }

      if (!teamsResponse.ok) {
        throw new Error(
          teamsData.message || "Failed to load teams."
        );
      }

      setTeams(teamsData.teams || []);
    } catch (error) {
      console.error("Teams page error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load teams."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // ==========================================
  // SELECT / UNSELECT STUDENT
  // ==========================================

  function toggleStudent(studentId: string) {
    setForm((previous) => {
      const alreadySelected =
        previous.studentIds.includes(studentId);

      return {
        ...previous,

        studentIds: alreadySelected
          ? previous.studentIds.filter(
              (id) => id !== studentId
            )
          : [...previous.studentIds, studentId],
      };
    });
  }

  // ==========================================
  // CREATE TEAM
  // ==========================================

  async function handleCreateTeam(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    // Validation
    if (!form.name.trim()) {
      setError("Please enter a team name.");
      return;
    }

    if (!form.mentorId) {
      setError("Please select a mentor.");
      return;
    }

    if (form.studentIds.length === 0) {
      setError("Please select at least one student.");
      return;
    }

    try {
      setCreating(true);

      const response = await fetch("/api/admin/teams", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: form.name.trim(),
          mentorId: form.mentorId,
          studentIds: form.studentIds,
        }),
      });

      // IMPORTANT:
      // Read as text first so an empty response
      // doesn't cause "Unexpected end of JSON input".
      const responseText = await response.text();

      console.log("Create Team Response:", {
        status: response.status,
        body: responseText,
      });

      if (!responseText) {
        throw new Error(
          `Server returned an empty response (${response.status}).`
        );
      }

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Server returned invalid JSON: ${responseText}`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create team."
        );
      }

      // Success
      setMessage("Team created successfully.");

      setForm({
        name: "",
        mentorId: "",
        studentIds: [],
      });

      setShowCreateForm(false);

      // Refresh teams
      await loadData();
    } catch (error) {
      console.error("Create team error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create team."
      );
    } finally {
      setCreating(false);
    }
  }

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredTeams = teams.filter((team) => {
    const searchText = search.toLowerCase();

    return (
      team.name
        .toLowerCase()
        .includes(searchText) ||
      team.mentor?.name
        ?.toLowerCase()
        .includes(searchText)
    );
  });

  // ==========================================
  // STATS
  // ==========================================

  const activeTeams = teams.filter(
    (team) => team.status === "ACTIVE"
  );

  const completedTeams = teams.filter(
    (team) => team.status === "COMPLETED"
  );

  const totalStudents = teams.reduce(
    (total, team) =>
      total + (team.students?.length || 0),
    0
  );

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-8 lg:px-8">
      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Teams
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Create and manage AI Club teams and their
            members.
          </p>
        </div>

        <button
          onClick={() => {
            setError("");
            setMessage("");
            setShowCreateForm(true);
          }}
          className="flex w-fit items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
        >
          <Plus size={18} />
          Create Team
        </button>
      </div>

      {/* ======================================
          SUCCESS MESSAGE
      ====================================== */}

      {message && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {message}
        </div>
      )}

      {/* ======================================
          ERROR MESSAGE
      ====================================== */}

      {error && !showCreateForm && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* ======================================
          STATS
      ====================================== */}

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

      {/* ======================================
          TEAMS TABLE
      ====================================== */}

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {/* Table Header */}

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
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search teams..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>
        </div>

        {/* Loading */}

        {loading ? (
          <div className="flex min-h-72 items-center justify-center">
            <p className="text-sm text-slate-500">
              Loading teams...
            </p>
          </div>
        ) : filteredTeams.length === 0 ? (
          /* Empty */

          <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <Users size={25} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              {search
                ? "No teams found"
                : "No teams created yet"}
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {search
                ? "Try another search."
                : "Create your first team to get started."}
            </p>
          </div>
        ) : (
          /* Table */

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
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
                    key={team._id}
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
                          {team.mentor?.name ||
                            "No mentor"}
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

                        {team.students?.length || 0} Students
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

      {/* ======================================
          CREATE TEAM MODAL
      ====================================== */}

      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-5">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}

            <div className="sticky top-0 flex items-start justify-between border-b border-slate-100 bg-white px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Create New Team
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Assign a mentor and students to this
                  team.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreateForm(false)
                }
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
              {/* Error */}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

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
                  disabled={creating}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
                />
              </div>

              {/* Mentor */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Assign Mentor
                </label>

                <select
                  value={form.mentorId}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      mentorId: event.target.value,
                    })
                  }
                  disabled={creating}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
                >
                  <option value="" disabled>
                    Select mentor
                  </option>

                  {mentors.map((mentor) => (
                    <option
                      key={mentor._id}
                      value={mentor._id}
                    >
                      {mentor.name} — {mentor.email}
                    </option>
                  ))}
                </select>

                {mentors.length === 0 && (
                  <p className="mt-2 text-xs text-amber-600">
                    No mentors are available. Create a
                    mentor from the Members page first.
                  </p>
                )}
              </div>

              {/* Students */}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">
                    Select Students
                  </label>

                  <span className="text-xs font-medium text-violet-600">
                    {form.studentIds.length} selected
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200">
                  {students.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">
                      No students are available.
                    </div>
                  ) : (
                    students.map((student) => {
                      const selected =
                        form.studentIds.includes(
                          student._id
                        );

                      return (
                        <button
                          key={student._id}
                          type="button"
                          disabled={creating}
                          onClick={() =>
                            toggleStudent(student._id)
                          }
                          className={`flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 ${
                            selected
                              ? "bg-violet-50"
                              : "hover:bg-slate-50"
                          } disabled:opacity-60`}
                        >
                          {/* Avatar */}

                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              selected
                                ? "bg-violet-600 text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {student.name
                              .split(" ")
                              .map(
                                (word) => word[0]
                              )
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>

                          {/* Student info */}

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {student.name}
                            </p>

                            <p className="truncate text-xs text-slate-400">
                              {student.email}
                            </p>
                          </div>

                          {/* Checkbox */}

                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                              selected
                                ? "border-violet-600 bg-violet-600 text-white"
                                : "border-slate-300"
                            }`}
                          >
                            {selected && (
                              <span className="text-xs">
                                ✓
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Actions */}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() =>
                    setShowCreateForm(false)
                  }
                  disabled={creating}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    creating ||
                    mentors.length === 0 ||
                    students.length === 0
                  }
                  className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating
                    ? "Creating..."
                    : "Create Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// STAT CARD
// ==========================================

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
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}