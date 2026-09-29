"use client";

import {
  Mail,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

type Member = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: "MENTOR" | "STUDENT";
  createdAt?: string;
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  async function fetchMembers() {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/members");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch members.");
      }

      setMembers(data.members || []);
    } catch (error) {
      console.error(error);
      setError("Failed to load members.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMembers();
  }, []);

  function updateForm(field: string, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleCreateMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!form.name || !form.email || !form.password || !form.role) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setCreating(true);

      const response = await fetch("/api/admin/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create member.");
      }

      setMessage("Member created successfully.");

      setForm({
        name: "",
        email: "",
        password: "",
        role: "",
      });

      setShowCreateForm(false);

      await fetchMembers();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create member."
      );
    } finally {
      setCreating(false);
    }
  }

  const filteredMembers = members.filter((member) => {
    const searchText = search.toLowerCase();

    return (
      member.name.toLowerCase().includes(searchText) ||
      member.email.toLowerCase().includes(searchText) ||
      member.role.toLowerCase().includes(searchText)
    );
  });

  const mentors = members.filter(
    (member) => member.role === "MENTOR"
  );

  const students = members.filter(
    (member) => member.role === "STUDENT"
  );

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-8 lg:px-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Members
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage mentors and students in the AI Club.
          </p>
        </div>

        <button
          onClick={() => {
            setMessage("");
            setError("");
            setShowCreateForm(true);
          }}
          className="flex w-fit items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
        >
          <Plus size={18} />
          Add Member
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {message}
        </div>
      )}

      {error && !showCreateForm && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Members"
          value={members.length}
          icon={<Users size={21} />}
          iconClass="bg-violet-50 text-violet-600"
        />

        <StatCard
          title="Mentors"
          value={mentors.length}
          icon={<ShieldCheck size={21} />}
          iconClass="bg-cyan-50 text-cyan-600"
        />

        <StatCard
          title="Students"
          value={students.length}
          icon={<UserRound size={21} />}
          iconClass="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Members Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              All Members
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Accounts currently registered in the AI Club.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search members..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-72 items-center justify-center">
            <div className="text-sm text-slate-500">
              Loading members...
            </div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <Users size={25} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              {search
                ? "No members found"
                : "No members created yet"}
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {search
                ? "Try searching with a different name, email or role."
                : "Create your first mentor or student account."}
            </p>

            {!search && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-5 flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                <Plus size={17} />
                Create First Member
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Member
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Email
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Role
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Created
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((member) => (
                  <tr
                    key={member._id || member.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                          {member.name
                            .split(" ")
                            .map((word) => word[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {member.name}
                          </p>

                          <p className="text-xs text-slate-400">
                            AI Club Member
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail size={15} className="text-slate-400" />
                        {member.email}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          member.role === "MENTOR"
                            ? "bg-cyan-50 text-cyan-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {member.role === "MENTOR"
                          ? "Mentor"
                          : "Student"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      {member.createdAt
                        ? new Date(
                            member.createdAt
                          ).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Member Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-5">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Create New Member
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create a mentor or student account.
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
              onSubmit={handleCreateMember}
              className="space-y-5 p-6"
            >
              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Full Name
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    updateForm("name", event.target.value)
                  }
                  placeholder="Enter full name"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateForm("email", event.target.value)
                    }
                    placeholder="member@aiclub.com"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>

                <input
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    updateForm("password", event.target.value)
                  }
                  placeholder="Create a password"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  Minimum 6 characters. The password will be securely
                  hashed.
                </p>
              </div>

              {/* Role */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Role
                </label>

                <select
                  value={form.role}
                  onChange={(event) =>
                    updateForm("role", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                >
                  <option value="" disabled>
                    Select role
                  </option>

                  <option value="MENTOR">Mentor</option>
                  <option value="STUDENT">Student</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  disabled={creating}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating ? "Creating..." : "Create Member"}
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