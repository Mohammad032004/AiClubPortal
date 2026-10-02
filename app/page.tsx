import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Code2,
  FolderKanban,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

const features = [
  {
    icon: GraduationCap,
    title: "Structured Learning",
    description:
      "Access curated learning resources, updates, and guidance from mentors.",
  },
  {
    icon: CheckCircle2,
    title: "Tasks & Progress",
    description:
      "Stay organized with assigned tasks, deadlines, and learning progress.",
  },
  {
    icon: FolderKanban,
    title: "Project Management",
    description:
      "Build and manage projects with your team from one central workspace.",
  },
  {
    icon: UsersRound,
    title: "Team Collaboration",
    description:
      "Connect with mentors and teammates and stay aligned throughout your journey.",
  },
];

const domains = [
  {
    icon: BrainCircuit,
    title: "AI & Machine Learning",
  },
  {
    icon: Code2,
    title: "Web Development",
  },
  {
    icon: ShieldCheck,
    title: "Cybersecurity",
  },
  {
    icon: Sparkles,
    title: "Innovation & Projects",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-180px] h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="absolute right-[-120px] top-[35%] h-[300px] w-[300px] rounded-full bg-cyan-200/20 blur-3xl" />
      </div>

      {/* Navbar */}
      <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center">
              <Image
                src="/ai-club-logo.png"
                alt="AI Club Logo"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
                priority
              />
            </div>

            <div>
              <p className="text-sm font-bold tracking-tight text-slate-900">
                AI CLUB
              </p>
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Learning Portal
              </p>
            </div>
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            Login
            <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 pb-20 pt-20 sm:px-8 sm:pb-28 sm:pt-28 lg:pt-32">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-2 text-xs font-semibold text-violet-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-600" />
              </span>
              AI Club Learning & Project Portal
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Learn.
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                {" "}
                Build.
              </span>
              <br />
              Grow Together.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg sm:leading-8">
              A centralized workspace for AI Club members to learn
              new skills, complete tasks, collaborate with teams,
              work on projects, and connect with mentors.
            </p>

            {/* CTA */}
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/login"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700 sm:w-auto"
              >
                Enter Portal
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>

              <a
                href="#features"
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
              >
                Explore Features
              </a>
            </div>
          </div>

          {/* Hero dashboard preview */}
          <div className="relative mx-auto mt-16 max-w-5xl sm:mt-20">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-violet-200/40 via-transparent to-cyan-200/40 blur-2xl" />

            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/30">
              {/* Window bar */}
              <div className="flex h-12 items-center gap-2 border-b border-slate-100 bg-slate-50 px-5">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />

                <div className="ml-4 h-7 flex-1 rounded-lg border border-slate-200 bg-white" />
              </div>

              {/* Dashboard preview */}
              <div className="grid min-h-[300px] grid-cols-1 sm:grid-cols-[180px_1fr]">
                {/* Sidebar */}
                <div className="hidden border-r border-slate-100 bg-white p-4 sm:block">
                  <div className="mb-6 flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-violet-100" />
                    <div className="h-3 w-16 rounded bg-slate-200" />
                  </div>

                  <div className="space-y-2">
                    <div className="h-9 rounded-lg bg-violet-50" />
                    <div className="h-9 rounded-lg bg-slate-50" />
                    <div className="h-9 rounded-lg bg-slate-50" />
                    <div className="h-9 rounded-lg bg-slate-50" />
                    <div className="h-9 rounded-lg bg-slate-50" />
                  </div>
                </div>

                {/* Content */}
                <div className="bg-slate-50/70 p-5 sm:p-7">
                  <div className="mb-6">
                    <div className="h-4 w-24 rounded bg-slate-200" />
                    <div className="mt-3 h-7 w-48 rounded bg-slate-800/10" />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                      <div className="h-9 w-9 rounded-lg bg-violet-100" />
                      <div className="mt-5 h-3 w-20 rounded bg-slate-200" />
                      <div className="mt-2 h-6 w-12 rounded bg-slate-300" />
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                      <div className="h-9 w-9 rounded-lg bg-cyan-100" />
                      <div className="mt-5 h-3 w-20 rounded bg-slate-200" />
                      <div className="mt-2 h-6 w-12 rounded bg-slate-300" />
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                      <div className="h-9 w-9 rounded-lg bg-emerald-100" />
                      <div className="mt-5 h-3 w-20 rounded bg-slate-200" />
                      <div className="mt-2 h-6 w-12 rounded bg-slate-300" />
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
                    <div className="h-3 w-28 rounded bg-slate-200" />
                    <div className="mt-5 h-3 w-full rounded bg-slate-100" />
                    <div className="mt-3 h-3 w-4/5 rounded bg-slate-100" />
                    <div className="mt-3 h-3 w-3/5 rounded bg-slate-100" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="border-y border-slate-200 bg-white"
      >
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
              One Workspace
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything your club needs
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base">
              A single platform designed to keep learning,
              collaboration, and project work organized.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-slate-200/40"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition group-hover:bg-violet-600 group-hover:text-white">
                    <Icon size={20} />
                  </div>

                  <h3 className="mt-5 font-semibold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Domains */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                Explore & Build
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Grow across technology domains
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
                Learn practical skills, participate in projects,
                collaborate with other members, and turn ideas
                into working solutions.
              </p>

              <Link
                href="/login"
                className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-violet-600 transition hover:text-violet-700"
              >
                Start your journey
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {domains.map((domain) => {
                const Icon = domain.icon;

                return (
                  <div
                    key={domain.title}
                    className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-violet-600">
                      <Icon size={21} />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        {domain.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Learn • Practice • Build
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8 lg:py-24">
          <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-14 text-center sm:px-12">
            <div className="absolute left-1/2 top-0 h-40 w-80 -translate-x-1/2 rounded-full bg-violet-600/25 blur-3xl" />

            <div className="relative">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
                <Sparkles size={23} />
              </div>

              <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to build something?
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                Sign in to your AI Club workspace and continue
                learning, collaborating, and building.
              </p>

              <Link
                href="/login"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Enter Portal
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-2">
            <Image
              src="/ai-club-logo.png"
              alt="AI Club"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />

            <span className="text-sm font-semibold text-slate-800">
              AI CLUB
            </span>
          </div>

          <p className="text-xs text-slate-400">
            AI Club Learning & Project Portal
          </p>
        </div>
      </footer>
    </main>
  );
}