"use client";

import {
  BookOpen,
  CheckSquare,
  FolderKanban,
  UserRoundCog,
  Users,
} from "lucide-react";

const stats = [
  {
    title: "Total Students",
    value: "30",
    description: "Active students",
    icon: Users,
  },
  {
    title: "Mentors",
    value: "6",
    description: "Active mentors",
    icon: UserRoundCog,
  },
  {
    title: "Teams",
    value: "8",
    description: "Active teams",
    icon: Users,
  },
  {
    title: "Projects",
    value: "12",
    description: "6 currently in progress",
    icon: FolderKanban,
  },
];

export default function AdminDashboard() {
  return (
    <div className="mx-auto max-w-[1600px] px-5 py-8 lg:px-8">
      {/* Welcome */}
      <section className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Welcome back, Admin 👋
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Here's an overview of what's happening across the AI Club.
        </p>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {stat.value}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {stat.description}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Icon size={21} />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Main Grid */}
      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        {/* Activity */}
        <div className="rounded-2xl border border-slate-200 bg-white xl:col-span-2">
          <div className="border-b border-slate-100 px-6 py-5">
            <h3 className="font-semibold">
              Recent Activity
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Latest activity across the club
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            <Activity
              title="New student added"
              description="A new student account was created."
              time="10 min ago"
            />

            <Activity
              title="Learning report submitted"
              description="A student submitted a report for mentor review."
              time="1 hour ago"
            />

            <Activity
              title="Project milestone completed"
              description="Team Alpha completed a project milestone."
              time="2 hours ago"
            />

            <Activity
              title="New team created"
              description="A new project team was created."
              time="Yesterday"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-semibold">
            Quick Actions
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Common administration actions
          </p>

          <div className="mt-5 space-y-3">
            <QuickAction
              icon={<Users size={19} />}
              title="Add Member"
              description="Create a student or mentor"
              iconClass="bg-violet-50 text-violet-600"
            />

            <QuickAction
              icon={<FolderKanban size={19} />}
              title="Create Project"
              description="Start a new team project"
              iconClass="bg-cyan-50 text-cyan-600"
            />

            <QuickAction
              icon={<BookOpen size={19} />}
              title="Add Learning"
              description="Create a learning resource"
              iconClass="bg-emerald-50 text-emerald-600"
            />

            <QuickAction
              icon={<CheckSquare size={19} />}
              title="Create Task"
              description="Assign a practical task"
              iconClass="bg-amber-50 text-amber-600"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function Activity({
  title,
  description,
  time,
}: {
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="flex gap-4 px-6 py-5">
      <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-violet-500" />

      <div>
        <p className="text-sm font-medium">
          {title}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>

        <p className="mt-2 text-xs text-slate-400">
          {time}
        </p>
      </div>
    </div>
  );
}

function QuickAction({
  icon,
  title,
  description,
  iconClass,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconClass: string;
}) {
  return (
    <button className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3.5 text-left transition hover:border-violet-200 hover:bg-slate-50">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
      >
        {icon}
      </div>

      <div>
        <p className="text-sm font-semibold">
          {title}
        </p>

        <p className="text-xs text-slate-400">
          {description}
        </p>
      </div>
    </button>
  );
}