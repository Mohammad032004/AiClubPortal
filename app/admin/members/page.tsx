
"use client";

import {
  Ban,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Mail,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type Member = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: "STUDENT";
  isSuspended?: boolean;
  createdAt?: string;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  members?: Member[];
  member?: Member;
};

const getMemberId = (member: Member) =>
  member._id || member.id || "";

async function readResponse(response: Response): Promise<ApiResponse> {
  const text = await response.text();

  if (!text) {
    throw new Error(
      response.ok
        ? "The server returned an empty response."
        : `Request failed (${response.status}).`
    );
  }

  let data: ApiResponse;

  try {
    data = JSON.parse(text) as ApiResponse;
  } catch {
    throw new Error(
      "The server returned an invalid response. Please check your API route."
    );
  }

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message || data.error || "Something went wrong."
    );
  }

  return data;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/members", {
        method: "GET",
        cache: "no-store",
      });

      const data = await readResponse(response);

      setMembers(
        (data.members || []).filter(
          (member) => member.role === "STUDENT"
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load students."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMembers();
  }, [fetchMembers]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setEditingMember(null);
  };

  const openCreateModal = () => {
    resetForm();
    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const openEditModal = (member: Member) => {
    setEditingMember(member);
    setName(member.name);
    setEmail(member.email);
    setPassword("");
    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }

    if (!editingMember && !password) {
      setError("Password is required when creating a student.");
      return;
    }

    if (password && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSaving(true);

    try {
      const isEditing = Boolean(editingMember);

      const body: Record<string, string> = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
      };

      if (password) body.password = password;

      if (editingMember) {
        body.memberId = getMemberId(editingMember);
      }

      const response = await fetch("/api/admin/members", {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await readResponse(response);

      setSuccess(
        data.message ||
          (isEditing
            ? "Student updated successfully."
            : "Student created successfully.")
      );

      setModalOpen(false);
      resetForm();

      await fetchMembers();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save student."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (
    member: Member,
    action: "suspend" | "activate"
  ) => {
    const memberId = getMemberId(member);

    if (!memberId) {
      setError("Student ID is missing.");
      return;
    }

    const actionLabel =
      action === "suspend" ? "suspend" : "activate";

    if (
      !window.confirm(
        `Are you sure you want to ${actionLabel} ${member.name}?`
      )
    ) {
      return;
    }

    setActionId(memberId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/members", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memberId, action }),
      });

      const data = await readResponse(response);

      setSuccess(
        data.message ||
          `Student ${action === "suspend" ? "suspended" : "activated"} successfully.`
      );

      await fetchMembers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${actionLabel} student.`
      );
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (member: Member) => {
    const memberId = getMemberId(member);

    if (!memberId) {
      setError("Student ID is missing.");
      return;
    }

    if (
      !window.confirm(
        `Delete ${member.name} permanently? This action cannot be undone.`
      )
    ) {
      return;
    }

    setActionId(memberId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/members", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memberId }),
      });

      const data = await readResponse(response);

      setMembers((current) =>
        current.filter((item) => getMemberId(item) !== memberId)
      );

      setSuccess(data.message || "Student deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete student."
      );
    } finally {
      setActionId(null);
    }
  };

  const filteredMembers = members.filter((member) => {
    const query = search.trim().toLowerCase();

    return (
      member.name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query)
    );
  });

  const suspendedCount = members.filter(
    (member) => member.isSuspended
  ).length;

  const activeCount = members.length - suspendedCount;

  const formatDate = (date?: string) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "—";

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Page Header */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-cyan-700">
              <GraduationCap size={18} />
              <span>Administration</span>
              <span className="text-gray-300">/</span>
              <span>Students</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
              Student Management
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage student accounts, permissions and account status.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-100"
          >
            <Plus size={18} />
            Add Student
          </button>
        </div>

        {/* Notifications */}
        {error && !modalOpen && (
          <div
            role="alert"
            className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              aria-label="Dismiss error"
              className="shrink-0 rounded-md p-1 hover:bg-red-100"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            <span>{success}</span>
            <button
              onClick={() => setSuccess("")}
              aria-label="Dismiss success message"
              className="shrink-0 rounded-md p-1 hover:bg-emerald-100"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="Total Students"
            value={members.length}
            description="All registered student accounts"
            icon={<Users size={21} />}
            iconClass="bg-cyan-50 text-cyan-700"
          />

          <StatCard
            title="Active Students"
            value={activeCount}
            description="Accounts not marked suspended"
            icon={<CheckCircle2 size={21} />}
            iconClass="bg-emerald-50 text-emerald-700"
          />

          <StatCard
            title="Suspended Students"
            value={suspendedCount}
            description="Accounts marked as suspended"
            icon={<ShieldCheck size={21} />}
            iconClass="bg-amber-50 text-amber-700"
          />
        </div>

        {/* Students Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="font-semibold text-gray-900">
                All Students
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {filteredMembers.length} student
                {filteredMembers.length === 1 ? "" : "s"} found
              </p>
            </div>

            <div className="flex gap-2">
              <div className="relative w-full sm:w-80">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name or email..."
                  aria-label="Search students"
                  className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <button
                onClick={() => void fetchMembers()}
                disabled={loading}
                title="Refresh students"
                aria-label="Refresh students"
                className="rounded-xl border border-gray-300 bg-white p-2.5 text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw
                  size={18}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Student</th>
                  <th className="px-5 py-4 font-semibold">Role</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Joined</th>
                  <th className="px-5 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <Loader2
                        size={28}
                        className="mx-auto animate-spin text-cyan-600"
                      />
                      <p className="mt-3 text-gray-500">
                        Loading students...
                      </p>
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                        <Users size={27} />
                      </div>
                      <p className="mt-4 font-semibold text-gray-800">
                        {search
                          ? "No matching students found"
                          : "No students added yet"}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {search
                          ? "Try another name or email address."
                          : "Create your first student account to get started."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => {
                    const memberId = getMemberId(member);
                    const busy = actionId === memberId;

                    return (
                      <tr
                        key={memberId}
                        className="transition hover:bg-gray-50/80"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-cyan-700">
                              <UserRound size={19} />
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900">
                                {member.name}
                              </p>
                              <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                                <Mail size={13} className="shrink-0" />
                                <span className="break-all">
                                  {member.email}
                                </span>
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-lg border border-cyan-100 bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-800">
                            Student
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {member.isSuspended ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
                              <Ban size={13} />
                              Suspended
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
                              <CheckCircle2 size={13} />
                              Active
                            </span>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                          {formatDate(member.createdAt)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <ActionButton
                              label="Edit student"
                              onClick={() => openEditModal(member)}
                              disabled={busy}
                            >
                              <Pencil size={16} />
                            </ActionButton>

                            {member.isSuspended ? (
                              <ActionButton
                                label="Activate student"
                                onClick={() =>
                                  void handleStatusChange(member, "activate")
                                }
                                disabled={busy}
                                className="text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                              >
                                {busy ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <CheckCircle2 size={16} />
                                )}
                              </ActionButton>
                            ) : (
                              <ActionButton
                                label="Suspend student"
                                onClick={() =>
                                  void handleStatusChange(member, "suspend")
                                }
                                disabled={busy}
                                className="text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                              >
                                {busy ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <Ban size={16} />
                                )}
                              </ActionButton>
                            )}

                            <ActionButton
                              label="Delete student"
                              onClick={() => void handleDelete(member)}
                              disabled={busy}
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              {busy ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </ActionButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 border-t border-gray-200 bg-white px-5 py-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing {filteredMembers.length} of {members.length} students
            </span>
            <span>AI Club · Student Administration</span>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/40 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-modal-title"
            className="my-auto w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-cyan-50 p-2.5 text-cyan-700">
                  {editingMember ? (
                    <Pencil size={20} />
                  ) : (
                    <Plus size={20} />
                  )}
                </div>

                <div>
                  <h2
                    id="student-modal-title"
                    className="font-semibold text-gray-900"
                  >
                    {editingMember ? "Edit Student" : "Add New Student"}
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    {editingMember
                      ? "Update the student's account details."
                      : "Create a student account for the AI Club portal."}
                  </p>
                </div>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                aria-label="Close modal"
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="student-name"
                  className="text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <input
                  id="student-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter student's full name"
                  autoComplete="name"
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="student-email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <input
                  id="student-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="student@example.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="student-password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password{" "}
                  {editingMember && (
                    <span className="font-normal text-gray-400">
                      (optional)
                    </span>
                  )}
                </label>
                <input
                  id="student-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={
                    editingMember
                      ? "Leave blank to keep current password"
                      : "Enter a password"
                  }
                  autoComplete="new-password"
                  minLength={6}
                  required={!editingMember}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />
                <p className="text-xs text-gray-500">
                  {editingMember
                    ? "Only enter a password if you want to change it."
                    : "Use at least 6 characters."}
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                <GraduationCap size={21} className="text-cyan-700" />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Student Account
                  </p>
                  <p className="text-xs text-gray-500">
                    The account role is assigned automatically.
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={17} />
                  )}
                  {saving
                    ? "Saving..."
                    : editingMember
                      ? "Save Changes"
                      : "Create Student"}
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
  description,
  icon,
  iconClass,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
            {value}
          </p>
          <p className="mt-2 text-xs text-gray-500">{description}</p>
        </div>

        <div className={`rounded-xl p-3 ${iconClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  children,
  label,
  onClick,
  disabled,
  className = "",
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}
