"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  ShieldCheck,
  UserRound,
  Bell,
  Save,
} from "lucide-react";

type SettingsData = {
  _id?: string;
  clubName: string;
  description: string;
  notifications: boolean;
  emailNotifications: boolean;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({
    clubName: "",
    description: "",
    notifications: true,
    emailNotifications: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function loadSettings() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/settings", {
        cache: "no-store",
      });

      if (!response.ok) {
        const text = await response.text();

        console.error("Settings API response:", text);

        throw new Error(
          `Settings API failed with status ${response.status}`
        );
      }

      const data = await response.json();

      setSettings({
        clubName: data.settings?.clubName || "AI Club",
        description: data.settings?.description || "",
        notifications:
          data.settings?.notifications ?? true,
        emailNotifications:
          data.settings?.emailNotifications ?? true,
      });
    } catch (error) {
      console.error("Failed to load settings:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load settings."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function handleSave() {
    try {
      setSaving(true);
      setError("");
      setSaved(false);

      if (!settings.clubName.trim()) {
        setError("Club name cannot be empty.");
        return;
      }

      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save settings."
        );
      }

      setSettings({
        clubName: data.settings.clubName,
        description: data.settings.description || "",
        notifications:
          data.settings.notifications ?? true,
        emailNotifications:
          data.settings.emailNotifications ?? true,
      });

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      console.error("Save settings error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to save settings."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading settings...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Settings
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage your AI Club portal preferences and information.
        </p>
      </div>

      {/* Success */}
      {saved && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Settings saved successfully.
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Club Information */}
      <section className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
            <Settings size={19} />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">
              Club Information
            </h2>

            <p className="text-xs text-slate-500">
              Basic information displayed across the portal.
            </p>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Club Name
            </label>

            <input
              value={settings.clubName}
              onChange={(event) =>
                setSettings((previous) => ({
                  ...previous,
                  clubName: event.target.value,
                }))
              }
              className="w-full max-w-xl rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              value={settings.description}
              onChange={(event) =>
                setSettings((previous) => ({
                  ...previous,
                  description: event.target.value,
                }))
              }
              rows={4}
              className="w-full max-w-xl resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>
        </div>
      </section>

      {/* Admin Account */}
      <section className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <UserRound size={19} />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">
              Admin Account
            </h2>

            <p className="text-xs text-slate-500">
              Current administrator account information.
            </p>
          </div>
        </div>

        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Name
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              AI Club Admin
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Email
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              admin@aiclub.com
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Role
            </p>

            <span className="mt-1 inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
              ADMIN
            </span>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <Bell size={19} />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">
              Notifications
            </h2>

            <p className="text-xs text-slate-500">
              Control how portal notifications are handled.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          <ToggleRow
            title="Portal Notifications"
            description="Receive important updates inside the portal."
            checked={settings.notifications}
            onChange={(value) =>
              setSettings((previous) => ({
                ...previous,
                notifications: value,
              }))
            }
          />

          <ToggleRow
            title="Email Notifications"
            description="Receive important club updates by email."
            checked={settings.emailNotifications}
            onChange={(value) =>
              setSettings((previous) => ({
                ...previous,
                emailNotifications: value,
              }))
            }
          />
        </div>
      </section>

      {/* Security */}
      <section className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <ShieldCheck size={19} />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">
              Security
            </h2>

            <p className="text-xs text-slate-500">
              Security-related account controls.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Account Password
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Password management will be connected to the
              authentication system.
            </p>
          </div>

          <button
            type="button"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Change Password
          </button>
        </div>
      </section>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={17} />

          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 px-6 py-5">
      <div>
        <p className="text-sm font-semibold text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-violet-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}