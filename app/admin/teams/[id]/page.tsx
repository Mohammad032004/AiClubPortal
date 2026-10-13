
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  UserRound,
  Mail,
  FolderKanban,
  CheckCircle2,
  Clock3,
  X,
  Save,
  Pencil,
} from "lucide-react";

type Member = {
  _id: string;
  name: string;
  email: string;
  role: string;
  isSuspended?: boolean;
};

type Team = {
  _id: string;
  name: string;
  status: "ACTIVE" | "COMPLETED" | "PENDING";
  mentor: Member;
  students: Member[];
  createdAt?: string;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  team?: Team;
  mentors?: Member[];
  members?: Member[];
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
    console.error(`${label} failed:`, {
      status: response.status,
      response: data,
    });

    throw new Error(
      data.message || `${label} failed with status ${response.status}.`
    );
  }

  return data;
}

export default function TeamDetailsPage() {
  const params = useParams<{ id: string }>();
  const teamId = params.id;

  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] =
    useState<Team["status"]>("ACTIVE");

  const [mentors, setMentors] = useState<Member[]>([]);
  const [students, setStudents] = useState<Member[]>([]);
  const [editMentor, setEditMentor] = useState("");
  const [editStudents, setEditStudents] = useState<string[]>([]);

  const [membersLoading, setMembersLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  async function loadTeam() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/admin/teams/${teamId}`, {
        cache: "no-store",
      });

      const data = await readResponse(response, "Load team API");

      if (!data.team) {
        throw new Error("The API did not return a team.");
      }

      setTeam(data.team);
    } catch (err) {
      console.error("Load team error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load team details."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (teamId) {
      void loadTeam();
    }
  }, [teamId]);

  function statusClass(status: Team["status"]) {
    switch (status) {
      case "ACTIVE":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "COMPLETED":
        return "border-blue-200 bg-blue-50 text-blue-700";
      default:
        return "border-amber-200 bg-amber-50 text-amber-700";
    }
  }

  async function openEditModal() {
    if (!team) return;

    setEditName(team.name);
    setEditStatus(team.status);
    setEditMentor(team.mentor?._id || "");
    setEditStudents(
      (team.students || []).map((student) => student._id)
    );

    setSaveError("");
    setSaveSuccess("");
    setIsEditOpen(true);

    try {
      setMembersLoading(true);

      const [mentorsResponse, membersResponse] = await Promise.all([
        fetch("/api/admin/mentors", { cache: "no-store" }),
        fetch("/api/admin/members", { cache: "no-store" }),
      ]);

      const [mentorsData, membersData] = await Promise.all([
        readResponse(mentorsResponse, "Load mentors API"),
        readResponse(membersResponse, "Load members API"),
      ]);

      const currentMentorId = team.mentor?._id;

      const currentStudentIds = new Set(
        (team.students || []).map((student) => student._id)
      );

      const mentorRecords = (mentorsData.mentors || []).filter(
        (mentor) =>
          mentor.role === "MENTOR" &&
          Boolean(mentor._id) &&
          (!mentor.isSuspended || mentor._id === currentMentorId)
      );

      const uniqueMentors = Array.from(
        new Map(
          mentorRecords.map((mentor) => [mentor._id, mentor])
        ).values()
      );

      const studentRecords = (membersData.members || []).filter(
        (student) =>
          student.role === "STUDENT" &&
          Boolean(student._id) &&
          (!student.isSuspended ||
            currentStudentIds.has(student._id))
      );

      const uniqueStudents = Array.from(
        new Map(
          studentRecords.map((student) => [student._id, student])
        ).values()
      );

      setMentors(uniqueMentors);
      setStudents(uniqueStudents);
    } catch (err) {
      console.error("Load team assignments error:", err);

      setSaveError(
        err instanceof Error
          ? err.message
          : "Failed to load mentors and students."
      );
    } finally {
      setMembersLoading(false);
    }
  }

  function closeEditModal() {
    if (saving) return;

    setIsEditOpen(false);
    setSaveError("");
    setSaveSuccess("");
  }

  function toggleStudent(studentId: string) {
    setEditStudents((previous) =>
      previous.includes(studentId)
        ? previous.filter((id) => id !== studentId)
        : [...previous, studentId]
    );
  }

  async function handleUpdateTeam() {
    if (!team) return;

    setSaveError("");
    setSaveSuccess("");

    if (!editName.trim()) {
      setSaveError("Team name is required.");
      return;
    }

    if (!editMentor) {
      setSaveError("Please select a mentor.");
      return;
    }

    if (editStudents.length === 0) {
      setSaveError("Please select at least one student.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`/api/admin/teams/${teamId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editName.trim(),
          status: editStatus,
          mentorId: editMentor,
          studentIds: editStudents,
        }),
      });

      const data = await readResponse(response, "Update team API");

      // Some APIs return only success/message rather than the updated team.
      // In that case, reload the team using the GET endpoint.
      if (data.team) {
        setTeam(data.team);
      } else {
        await loadTeam();
      }

      setSaveSuccess(data.message || "Team updated successfully.");
      setIsEditOpen(false);
    } catch (err) {
      console.error("Update team error:", err);

      setSaveError(
        err instanceof Error
          ? err.message
          : "Failed to update team."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
        Loading team details...
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-10">
        <Link
          href="/admin/teams"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-violet-700 hover:text-violet-900"
        >
          <ArrowLeft size={16} />
          Back to Teams
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error || "Team not found."}

          <button
            type="button"
            onClick={() => void loadTeam()}
            className="ml-3 font-semibold underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-8 lg:px-8">
      <Link
        href="/admin/teams"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-violet-700"
      >
        <ArrowLeft size={17} />
        Back to Teams
      </Link>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {team.name}
            </h1>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(team.status)}`}
            >
              {team.status}
            </span>
          </div>

          <p className="text-sm text-slate-500">
            Manage this team, its mentor, and its student assignments.
          </p>

          <p className="mt-2 break-all text-xs text-slate-400">
            Team ID: {team._id}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void openEditModal()}
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          <Pencil size={16} />
          Edit Team
        </button>
      </div>

      {saveSuccess && !isEditOpen && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {saveSuccess}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <InfoCard
          icon={<Users size={21} />}
          label="Total Students"
          value={String(team.students?.length || 0)}
          color="bg-violet-50 text-violet-600"
        />

        <InfoCard
          icon={<UserRound size={21} />}
          label="Assigned Mentor"
          value={team.mentor?.name || "Not assigned"}
          color="bg-cyan-50 text-cyan-600"
        />

        <InfoCard
          icon={
            team.status === "ACTIVE" ? (
              <CheckCircle2 size={21} />
            ) : team.status === "COMPLETED" ? (
              <FolderKanban size={21} />
            ) : (
              <Clock3 size={21} />
            )
          }
          label="Team Status"
          value={team.status}
          color="bg-emerald-50 text-emerald-600"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Mentor details */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-cyan-50 p-3 text-cyan-700">
              <UserRound size={22} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Team Mentor
              </h2>
              <p className="text-xs text-slate-500">
                Assigned mentor details
              </p>
            </div>
          </div>

          {team.mentor ? (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-lg font-bold text-violet-700">
                {team.mentor.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                {team.mentor.name}
              </h3>

              <p className="mt-1 break-all text-sm text-slate-500">
                {team.mentor.email}
              </p>

              <span className="mt-4 inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                MENTOR
              </span>
            </>
          ) : (
            <p className="text-sm text-slate-500">
              No mentor assigned.
            </p>
          )}
        </section>

        {/* Student list */}
        <section className="rounded-2xl border border-slate-200 bg-white lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <div>
              <h2 className="font-semibold text-slate-900">
                Team Students
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Students currently assigned to this team.
              </p>
            </div>

            <span className="rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
              {team.students?.length || 0} students
            </span>
          </div>

          {!team.students?.length ? (
            <div className="p-10 text-center text-sm text-slate-500">
              No students assigned to this team.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {team.students.map((student, index) => (
                <div
                  key={student._id || `student-${index}`}
                  className="flex items-center gap-3 px-6 py-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                    {student.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {student.name}
                    </p>

                    <p className="mt-1 flex items-center gap-1.5 break-all text-xs text-slate-500">
                      <Mail size={13} className="shrink-0" />
                      {student.email}
                    </p>
                  </div>

                  <span className="hidden rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 sm:inline-flex">
                    STUDENT
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Edit team modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-start justify-between border-b border-slate-100 bg-white px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Edit Team
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update the team details and assignments.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                disabled={saving}
                aria-label="Close edit team form"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {saveError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {saveError}
                </div>
              )}

              {saveSuccess && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {saveSuccess}
                </div>
              )}

              <div>
                <label
                  htmlFor="edit-team-name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Team Name
                </label>

                <input
                  id="edit-team-name"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-team-status"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Team Status
                </label>

                <select
                  id="edit-team-status"
                  value={editStatus}
                  onChange={(event) =>
                    setEditStatus(event.target.value as Team["status"])
                  }
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-400"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING">Pending</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit-team-mentor"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Assign Mentor
                </label>

                <select
                  id="edit-team-mentor"
                  value={editMentor}
                  onChange={(event) => setEditMentor(event.target.value)}
                  disabled={saving || membersLoading}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-400"
                >
                  <option value="">Select mentor</option>

                  {mentors.map((mentor) => (
                    <option
                      key={mentor._id}
                      value={mentor._id}
                    >
                      {mentor.name} — {mentor.email}
                      {mentor.isSuspended ? " (Suspended)" : ""}
                    </option>
                  ))}
                </select>

                {mentors.length === 0 && !membersLoading && (
                  <p className="mt-2 text-xs text-amber-600">
                    No eligible mentors were returned by the API.
                  </p>
                )}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">
                    Assign Students
                  </label>

                  <span className="text-xs font-semibold text-violet-600">
                    {editStudents.length} selected
                  </span>
                </div>

                {membersLoading ? (
                  <div className="rounded-xl border border-slate-200 p-6 text-center text-sm text-slate-500">
                    Loading mentors and students...
                  </div>
                ) : students.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 p-6 text-center text-sm text-slate-500">
                    No eligible students were returned by the API.
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200">
                    {students.map((student) => {
                      const selected = editStudents.includes(student._id);

                      return (
                        <label
                          key={student._id}
                          className={`flex cursor-pointer items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-0 ${
                            selected ? "bg-violet-50" : "hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            disabled={saving}
                            onChange={() => toggleStudent(student._id)}
                            className="h-4 w-4 accent-violet-600"
                          />

                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-slate-900">
                              {student.name}
                            </span>

                            <span className="block truncate text-xs text-slate-500">
                              {student.email}
                            </span>
                          </span>

                          {student.isSuspended && (
                            <span className="text-xs font-medium text-amber-700">
                              Suspended
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => void handleUpdateTeam()}
                  disabled={saving || membersLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
  color,
}: {
  icon: ReactNode;
  label: string;
  value: string;
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

        <div className="min-w-0">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="truncate text-lg font-bold text-slate-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
