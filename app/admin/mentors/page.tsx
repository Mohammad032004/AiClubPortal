
"use client";

import {
  AlertCircle,
  Ban,
  CalendarDays,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type Mentor = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: "MENTOR";
  createdAt?: string;
  updatedAt?: string;
  isSuspended?: boolean;
};

type MentorForm = {
  name: string;
  email: string;
  password: string;
};

const EMPTY_FORM: MentorForm = {
  name: "",
  email: "",
  password: "",
};

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMentor, setEditingMentor] =
    useState<Mentor | null>(null);
  const [form, setForm] = useState<MentorForm>(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const fetchMentors = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await fetch("/api/admin/mentors", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch mentors."
          );
        }

        setMentors(data.mentors || []);
      } catch (err) {
        console.error("Fetch mentors error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load mentors."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    void fetchMentors();
  }, [fetchMentors]);

  const filteredMentors = mentors.filter((mentor) => {
    const query = search.trim().toLowerCase();

    return (
      mentor.name.toLowerCase().includes(query) ||
      mentor.email.toLowerCase().includes(query)
    );
  });

  const activeCount = mentors.filter(
    (mentor) => !mentor.isSuspended
  ).length;

  const suspendedCount = mentors.filter(
    (mentor) => mentor.isSuspended
  ).length;

  function openCreateModal() {
    setEditingMentor(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function openEditModal(mentor: Mentor) {
    setEditingMentor(mentor);

    setForm({
      name: mentor.name,
      email: mentor.email,
      password: "",
    });

    setFormError("");
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingMentor(null);
    setForm(EMPTY_FORM);
    setFormError("");
  }

  function updateField(field: keyof MentorForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setFormError("");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setFormError("");
    setError("");
    setSuccess("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!name || !email) {
      setFormError("Name and email are required.");
      return;
    }

    if (name.length > 100) {
      setFormError("Name cannot exceed 100 characters.");
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254
    ) {
      setFormError("Please enter a valid email address.");
      return;
    }

    if (!editingMentor && !password) {
      setFormError("Please enter an initial password.");
      return;
    }

    if (
      password &&
      (password.length < 6 || password.length > 128)
    ) {
      setFormError(
        "Password must contain between 6 and 128 characters."
      );
      return;
    }

    const mentorId = editingMentor
      ? editingMentor._id || editingMentor.id
      : undefined;

    if (editingMentor && !mentorId) {
      setFormError(
        "Mentor ID is missing. Refresh the page and try again."
      );
      return;
    }

    const isEditing = Boolean(editingMentor);

    const payload = isEditing
      ? {
          memberId: mentorId,
          name,
          email,
          ...(password ? { password } : {}),
        }
      : {
          name,
          email,
          password,
        };

    try {
      setSaving(true);

      const response = await fetch("/api/admin/mentors", {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to ${isEditing ? "update" : "create"} mentor.`
        );
      }

      setModalOpen(false);
      setEditingMentor(null);
      setForm(EMPTY_FORM);
      setFormError("");

      setSuccess(
        data.message ||
          (isEditing
            ? "Mentor updated successfully."
            : "Mentor created successfully.")
      );

      await fetchMentors(true);
    } catch (err) {
      console.error("Save mentor error:", err);

      setFormError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  async function changeMentorStatus(mentor: Mentor) {
    const memberId = mentor._id || mentor.id;

    if (!memberId || actionId) return;

    const action = mentor.isSuspended ? "activate" : "suspend";

    const confirmed = window.confirm(
      action === "suspend"
        ? `Suspend ${mentor.name}'s account? They will lose access after the server recognizes the suspension.`
        : `Activate ${mentor.name}'s account?`
    );

    if (!confirmed) return;

    setActionId(memberId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/mentors", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberId,
          action,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update status.");
      }

      setSuccess(data.message);
      await fetchMentors(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update mentor status."
      );
    } finally {
      setActionId(null);
    }
  }

  async function deleteMentor(mentor: Mentor) {
    const memberId = mentor._id || mentor.id;

    if (!memberId || actionId) return;

    const confirmed = window.confirm(
      `Permanently delete ${mentor.name} (${mentor.email})?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setActionId(memberId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/mentors", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memberId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete mentor.");
      }

      setSuccess(data.message);
      await fetchMentors(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete mentor."
      );
    } finally {
      setActionId(null);
    }
  }

  const stats = [
    {
      title: "Total Mentors",
      value: mentors.length,
      icon: Users,
      iconClass: "bg-violet-50 text-violet-600",
    },
    {
      title: "Active Mentors",
      value: activeCount,
      icon: UserCheck,
      iconClass: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Suspended Mentors",
      value: suspendedCount,
      icon: Ban,
      iconClass: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-8 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-violet-600">
            <ShieldCheck size={17} />
            AI Club Administration
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Mentor Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Create, edit, suspend, activate and manage mentor accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-100"
        >
          <Plus size={18} />
          Add Mentor
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          <CheckCircle2 size={18} />
          <span className="flex-1">{success}</span>
          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss success"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.iconClass}`}
                >
                  <Icon size={22} />
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    {stat.title}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {loading ? "—" : stat.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mentor table */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              All Mentors
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              {mentors.length} mentor account
              {mentors.length === 1 ? "" : "s"} registered
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative sm:w-72">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name or email..."
                aria-label="Search mentors"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <button
              type="button"
              onClick={() => void fetchMentors(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-72 flex-col items-center justify-center gap-3">
            <LoaderCircle
              size={28}
              className="animate-spin text-violet-600"
            />
            <p className="text-sm text-slate-500">
              Loading mentors...
            </p>
          </div>
        ) : filteredMentors.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <UserRound size={26} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              {search.trim()
                ? "No mentors found"
                : "No mentors created yet"}
            </h3>

            <p className="mt-2 max-w-sm text-sm text-slate-500">
              {search.trim()
                ? "Try a different name or email address."
                : "Create your first mentor account to get started."}
            </p>

            {!search.trim() && (
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                <Plus size={17} />
                Create First Mentor
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                  {[
                    "Mentor",
                    "Email",
                    "Role",
                    "Status",
                    "Created",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredMentors.map((mentor) => {
                  const id = mentor._id || mentor.id;
                  const isBusy = actionId === id;
                  const initials = mentor.name
                    .trim()
                    .split(/\s+/)
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr
                      key={id || mentor.email}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                            {initials || "M"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {mentor.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              AI Club Mentor
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail
                            size={15}
                            className="shrink-0 text-slate-400"
                          />
                          {mentor.email}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700">
                          <ShieldCheck size={13} />
                          Mentor
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            mentor.isSuspended
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              mentor.isSuspended
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                          />
                          {mentor.isSuspended
                            ? "Suspended"
                            : "Active"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <CalendarDays
                            size={15}
                            className="text-slate-400"
                          />
                          {mentor.createdAt
                            ? new Date(
                                mentor.createdAt
                              ).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(mentor)}
                            disabled={Boolean(actionId)}
                            title="Edit mentor"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-50"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void changeMentorStatus(mentor)
                            }
                            disabled={Boolean(actionId)}
                            title={
                              mentor.isSuspended
                                ? "Activate mentor"
                                : "Suspend mentor"
                            }
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                              mentor.isSuspended
                                ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                : "border-amber-200 text-amber-700 hover:bg-amber-50"
                            }`}
                          >
                            {isBusy ? (
                              <LoaderCircle
                                size={14}
                                className="animate-spin"
                              />
                            ) : mentor.isSuspended ? (
                              <UserCheck size={14} />
                            ) : (
                              <Ban size={14} />
                            )}
                            {mentor.isSuspended
                              ? "Activate"
                              : "Suspend"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void deleteMentor(mentor)
                            }
                            disabled={Boolean(actionId)}
                            title="Delete mentor permanently"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredMentors.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-500">
            Showing {filteredMentors.length} of {mentors.length} mentors
          </div>
        )}
      </section>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mentor-modal-title"
            className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  {editingMentor ? (
                    <Pencil size={21} />
                  ) : (
                    <UserRound size={22} />
                  )}
                </div>

                <div>
                  <h2
                    id="mentor-modal-title"
                    className="text-lg font-bold text-slate-900"
                  >
                    {editingMentor
                      ? "Edit Mentor"
                      : "Create New Mentor"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {editingMentor
                      ? "Update the mentor's account details."
                      : "Create a new AI Club mentor account."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close modal"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-5 p-5 sm:p-6">
                {formError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  >
                    <AlertCircle
                      size={17}
                      className="mt-0.5 shrink-0"
                    />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="mentor-name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Full Name
                  </label>
                  <input
                    id="mentor-name"
                    type="text"
                    autoComplete="name"
                    maxLength={100}
                    required
                    value={form.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    placeholder="Enter mentor's full name"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="mentor-email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="mentor-email"
                      type="email"
                      autoComplete="email"
                      required
                      maxLength={254}
                      value={form.email}
                      onChange={(event) =>
                        updateField("email", event.target.value)
                      }
                      placeholder="mentor@example.com"
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-50"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="mentor-password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    {editingMentor
                      ? "New Password (Optional)"
                      : "Initial Password"}
                  </label>
                  <div className="relative">
                    <LockKeyhole
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="mentor-password"
                      type="password"
                      autoComplete="new-password"
                      required={!editingMentor}
                      minLength={6}
                      maxLength={128}
                      value={form.password}
                      onChange={(event) =>
                        updateField("password", event.target.value)
                      }
                      placeholder={
                        editingMentor
                          ? "Leave blank to keep current password"
                          : "Minimum 6 characters"
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-50"
                    />
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {editingMentor
                      ? "Leave blank to keep the existing password."
                      : "The password will be hashed on the server before storage."}
                  </p>
                </div>

                <div className="rounded-xl border border-violet-100 bg-violet-50/70 p-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck
                      size={20}
                      className="text-violet-600"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Account Role
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Mentor — MENTOR
                      </p>
                    </div>
                    <span className="ml-auto rounded-full bg-white px-3 py-1 text-xs font-semibold text-violet-700">
                      Fixed
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:justify-end sm:p-6">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingMentor ? (
                        <Pencil size={17} />
                      ) : (
                        <Plus size={18} />
                      )}
                      {editingMentor
                        ? "Save Changes"
                        : "Create Mentor"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
