"use client";

import {
  Mail,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { useState } from "react";

export default function MentorsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-8 lg:px-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Mentors
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage mentors and their assigned responsibilities.
          </p>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          className="flex w-fit items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
        >
          <Plus size={18} />
          Add Mentor
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Total Mentors */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Users size={21} />
            </div>

            <div>
              <p className="text-sm text-slate-500">Total Mentors</p>
              <p className="text-2xl font-bold text-slate-900">6</p>
            </div>
          </div>
        </div>

        {/* Active Mentors */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck size={21} />
            </div>

            <div>
              <p className="text-sm text-slate-500">Active Mentors</p>
              <p className="text-2xl font-bold text-slate-900">6</p>
            </div>
          </div>
        </div>

        {/* Assigned Students */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <UserRound size={21} />
            </div>

            <div>
              <p className="text-sm text-slate-500">Assigned Students</p>
              <p className="text-2xl font-bold text-slate-900">24</p>
            </div>
          </div>
        </div>
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
              View and manage AI Club mentors.
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
              placeholder="Search mentors..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>
        </div>

        {/* Empty State */}
        <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <UserRound size={25} />
          </div>

          <h3 className="mt-4 font-semibold text-slate-900">
            No mentors loaded yet
          </h3>

          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Mentors will appear here once we connect this page to MongoDB.
          </p>

          <button
            onClick={() => setShowCreateForm(true)}
            className="mt-5 flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            <Plus size={17} />
            Add First Mentor
          </button>
        </div>
      </div>

      {/* Create Mentor Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-5">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="text-lg font-bold text-slate-900">
                Create New Mentor
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Create a mentor account for the AI Club.
              </p>
            </div>

            {/* Form */}
            <form className="space-y-5 p-6">
              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Enter mentor name"
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
                    placeholder="mentor@aiclub.com"
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
                  placeholder="Create a password"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  The password will be securely hashed before being stored.
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
                  Create Mentor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}