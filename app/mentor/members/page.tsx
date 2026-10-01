"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  Mail,
  UsersRound,
} from "lucide-react";

type Team = {
  _id: string;
  name: string;
};

type Member = {
  _id: string;
  name: string;
  email: string;
  role: string;
  team: Team | null;
};

export default function MentorMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMembers() {
      try {
        const response = await fetch("/api/mentor/members");

        if (!response.ok) {
          throw new Error("Failed to load members");
        }

        const data = await response.json();

        if (data.success) {
          setMembers(data.members || []);
        }
      } catch (error) {
        console.error("Mentor members error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadMembers();
  }, []);

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return members;

    return members.filter(
      (member) =>
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.team?.name.toLowerCase().includes(query)
    );
  }, [members, search]);

  const teamsCount = new Set(
    members
      .map((member) => member.team?._id)
      .filter(Boolean)
  ).size;

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading members...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Header */}
        <div>
          <p className="text-sm font-medium text-violet-600">
            Workspace
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Members
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View the members assigned to your teams.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Members
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {members.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Users size={20} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Teams
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {teamsCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <UsersRound size={20} />
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
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search members or teams..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
            />
          </div>
        </div>

        {/* Members Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <h2 className="font-semibold text-slate-900">
              Team Members
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {filteredMembers.length} members shown
            </p>
          </div>

          {filteredMembers.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Users
                size={36}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 text-sm font-semibold text-slate-700">
                {search
                  ? "No members found"
                  : "No members assigned"}
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                {search
                  ? "Try a different search."
                  : "Members assigned to your teams will appear here."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredMembers.map((member) => {
                const initial = member.name
                  .charAt(0)
                  .toUpperCase();

                return (
                  <div
                    key={member._id}
                    className="flex flex-col gap-4 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    {/* Member */}
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                        {initial}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {member.name}
                        </p>

                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                          <Mail size={13} />
                          <span className="truncate">
                            {member.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Team */}
                    <div className="flex items-center gap-2 sm:min-w-[220px] sm:justify-end">
                      <UsersRound
                        size={16}
                        className="text-slate-400"
                      />

                      <span className="text-sm text-slate-600">
                        {member.team?.name || "No team"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}