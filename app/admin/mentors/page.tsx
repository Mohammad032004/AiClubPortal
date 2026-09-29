"use client";

import {
  Mail,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

type Mentor = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: "MENTOR";
  createdAt?: string;
};

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  async function fetchMentors() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/members");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch mentors.");
      }

      const mentorList = (data.members || []).filter(
        (member: Mentor) => member.role === "MENTOR"
      );

      setMentors(mentorList);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load mentors."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMentors();
  }, []);

  const filteredMentors = mentors.filter((mentor) => {
    const searchText = search.toLowerCase();

    return (
      mentor.name.toLowerCase().includes(searchText) ||
      mentor.email.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-8 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Mentors
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          View and manage mentors in the AI Club.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Mentors"
          value={mentors.length}
          icon={<Users size={21} />}
          iconClass="bg-violet-50 text-violet-600"
        />

        <StatCard
          title="Active Mentors"
          value={mentors.length}
          icon={<ShieldCheck size={21} />}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Mentor Accounts"
          value={mentors.length}
          icon={<UserRound size={21} />}
          iconClass="bg-cyan-50 text-cyan-600"
        />
      </div>

      {/* Mentors Section */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {/* Section Header */}
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              All Mentors
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Mentors currently registered in the AI Club.
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
              placeholder="Search mentors..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-72 items-center justify-center">
            <p className="text-sm text-slate-500">
              Loading mentors...
            </p>
          </div>
        ) : filteredMentors.length === 0 ? (
          /* Empty State */
          <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <UserRound size={25} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              {search
                ? "No mentors found"
                : "No mentors created yet"}
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {search
                ? "Try searching with a different name or email."
                : "Mentors created from the Members section will appear here."}
            </p>
          </div>
        ) : (
          /* Table */
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Mentor
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
                {filteredMentors.map((mentor) => (
                  <tr
                    key={mentor._id || mentor.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                          {mentor.name
                            .split(" ")
                            .map((word) => word[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {mentor.name}
                          </p>

                          <p className="text-xs text-slate-400">
                            AI Club Mentor
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail
                          size={15}
                          className="text-slate-400"
                        />

                        {mentor.email}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                        Mentor
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      {mentor.createdAt
                        ? new Date(
                            mentor.createdAt
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