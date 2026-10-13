
"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import {
  FolderKanban,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  X,
  ArrowRight,
} from "lucide-react";

type User = {
  _id: string;
  name: string;
  email: string;
  role: "MENTOR" | "STUDENT";
  isSuspended?: boolean;
};

type Team = {
  _id: string;
  name: string;
  mentor: User;
  students: User[];
  status: "ACTIVE" | "COMPLETED" | "PENDING";
  createdAt?: string;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  mentors?: User[];
  members?: User[];
  teams?: Team[];
  team?: Team;
  [key: string]: unknown;
};

async function readResponse(
  response: Response,
  label: string
): Promise<ApiResponse> {
  const text = await response.text();

  if (!text) {
    throw new Error(
      `${label} returned an empty response (${response.status}).`
    );
  }

  let data: ApiResponse;

  try {
    data = JSON.parse(text) as ApiResponse;
  } catch {
    console.error(`${label} returned invalid JSON:`, text);
    throw new Error(`${label} returned invalid JSON.`);
  }

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message || `${label} failed with status ${response.status}.`
    );
  }

  return data;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [mentors, setMentors] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    mentorId: "",
    studentIds: [] as string[],
  });

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [mentorsResponse, membersResponse, teamsResponse] =
        await Promise.all([
          fetch("/api/admin/mentors", { cache: "no-store" }),
          fetch("/api/admin/members", { cache: "no-store" }),
          fetch("/api/admin/teams", { cache: "no-store" }),
        ]);

      const [mentorsData, membersData, teamsData] = await Promise.all([
        readResponse(mentorsResponse, "Mentors API"),
        readResponse(membersResponse, "Members API"),
        readResponse(teamsResponse, "Teams API"),
      ]);

      // Keep only active mentors and remove duplicate IDs.
      const mentorRecords = (mentorsData.mentors || []).filter(
        (mentor) =>
          mentor.role === "MENTOR" &&
          !mentor.isSuspended &&
          Boolean(mentor._id)
      );

      const uniqueMentors = Array.from(
        new Map(
          mentorRecords.map((mentor) => [mentor._id, mentor])
        ).values()
      );

      // Keep only active students and remove duplicate IDs.
      const studentRecords = (membersData.members || []).filter(
        (student) =>
          student.role === "STUDENT" &&
          !student.isSuspended &&
          Boolean(student._id)
      );

      const uniqueStudents = Array.from(
        new Map(
          studentRecords.map((student) => [student._id, student])
        ).values()
      );

      setMentors(uniqueMentors);
      setStudents(uniqueStudents);
      setTeams(teamsData.teams || []);
    } catch (err) {
      console.error("Teams page error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load teams."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  function toggleStudent(studentId: string) {
    setForm((previous) => ({
      ...previous,
      studentIds: previous.studentIds.includes(studentId)
        ? previous.studentIds.filter((id) => id !== studentId)
        : [...previous.studentIds, studentId],
    }));
  }

  function openCreateForm() {
    setError("");
    setMessage("");
    setForm({
      name: "",
      mentorId: "",
      studentIds: [],
    });
    setShowCreateForm(true);
  }

  async function handleCreateTeam(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");
    setMessage("");

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

      const data = await readResponse(response, "Create team API");

      if (data.success === false) {
        throw new Error(data.message || "Failed to create team.");
      }

      setMessage(data.message || "Team created successfully.");

      setForm({
        name: "",
        mentorId: "",
        studentIds: [],
      });

      setShowCreateForm(false);

      await loadData();
    } catch (err) {
      console.error("Create team error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create team."
      );
    } finally {
      setCreating(false);
    }
  }

  const query = search.trim().toLowerCase();

  const filteredTeams = teams.filter((team) => {
    return (
      team.name?.toLowerCase().includes(query) ||
      team.mentor?.name?.toLowerCase().includes(query) ||
      team.mentor?.email?.toLowerCase().includes(query) ||
      team.students?.some(
        (student) =>
          student.name?.toLowerCase().includes(query) ||
          student.email?.toLowerCase().includes(query)
      )
    );
  });

  const activeTeams = teams.filter(
    (team) => team.status === "ACTIVE"
  );

  const completedTeams = teams.filter(
    (team) => team.status === "COMPLETED"
  );

  const totalStudents = teams.reduce(
    (total, team) => total + (team.students?.length || 0),
    0
  );

  function statusClass(status: Team["status"]) {
    if (status === "ACTIVE") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (status === "COMPLETED") {
      return "border-blue-200 bg-blue-50 text-blue-700";
    }

    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-8 lg:px-8">
      {/* Page header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Teams
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Create and manage AI Club teams, mentors, and students.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="flex w-fit items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          <Plus size={18} />
          Create Team
        </button>
      </div>

      {/* Feedback */}
      {message && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {error && !showCreateForm && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button
            type="button"
            onClick={() => void loadData()}
            className="ml-3 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Teams"
          value={teams.length}
          icon={<Users size={21} />}
          color="bg-violet-50 text-violet-600"
        />

        <StatCard
          title="Active Teams"
          value={activeTeams.length}
          icon={<ShieldCheck size={21} />}
          color="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Completed Teams"
          value={completedTeams.length}
          icon={<FolderKanban size={21} />}
          color="bg-cyan-50 text-cyan-600"
        />

        <StatCard
          title="Students Assigned"
          value={totalStudents}
          icon={<UserRound size={21} />}
          color="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Teams table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              All Teams
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              View team information and manage assignments.
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search teams, mentors, students..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Loading teams...
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="p-12 text-center">
            <Users
              className="mx-auto mb-3 text-slate-300"
              size={36}
            />

            <h3 className="font-semibold text-slate-800">
              No teams found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {search
                ? "Try a different search."
                : "Create your first team to get started."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Team</th>
                  <th className="px-5 py-4">Mentor</th>
                  <th className="px-5 py-4">Students</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredTeams.map((team, index) => (
                  <tr
                    key={team._id || `team-${index}`}
                    className="hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {team.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        ID: {team._id}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">
                        {team.mentor?.name || "Not assigned"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {team.mentor?.email || ""}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-violet-50 px-2.5 py-1.5 text-xs font-semibold text-violet-700">
                        {team.students?.length || 0} students
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(team.status)}`}
                      >
                        {team.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/teams/${team._id}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                      >
                        View Details
                        <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create team modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-start justify-between border-b border-slate-100 bg-white px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Create New Team
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Select an active mentor and at least one student.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                disabled={creating}
                aria-label="Close create team form"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleCreateTeam}
              className="space-y-5 p-6"
            >
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Team name */}
              <div>
                <label
                  htmlFor="team-name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Team Name
                </label>

                <input
                  id="team-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. Team Alpha"
                  disabled={creating}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              {/* Mentor selection */}
              <div>
                <label
                  htmlFor="team-mentor"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Assign Mentor
                </label>

                <select
                  id="team-mentor"
                  value={form.mentorId}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      mentorId: event.target.value,
                    }))
                  }
                  disabled={creating || mentors.length === 0}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-400"
                >
                  <option value="">Select mentor</option>

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
                    No active mentors are available. Create a mentor
                    from the Mentors page first.
                  </p>
                )}
              </div>

              {/* Student selection */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">
                    Select Students
                  </label>

                  <span className="text-xs font-semibold text-violet-600">
                    {form.studentIds.length} selected
                  </span>
                </div>

                <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200">
                  {students.length === 0 ? (
                    <p className="p-4 text-center text-sm text-slate-500">
                      No active students are available.
                    </p>
                  ) : (
                    students.map((student) => {
                      const selected = form.studentIds.includes(
                        student._id
                      );

                      return (
                        <button
                          type="button"
                          key={student._id}
                          disabled={creating}
                          onClick={() => toggleStudent(student._id)}
                          className={`flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-0 ${
                            selected
                              ? "bg-violet-50"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              selected
                                ? "bg-violet-600 text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {student.name
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-slate-900">
                              {student.name}
                            </span>

                            <span className="block truncate text-xs text-slate-500">
                              {student.email}
                            </span>
                          </span>

                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded border text-xs ${
                              selected
                                ? "border-violet-600 bg-violet-600 text-white"
                                : "border-slate-300"
                            }`}
                          >
                            {selected ? "✓" : ""}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Modal actions */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  disabled={creating}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
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
                  className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Team"}
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
  color,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}
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
