"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  ChevronDown,
  Clock,
  Loader2,
  Send,
  UsersRound,
} from "lucide-react";

type Student = {
  _id: string;
  name: string;
  email: string;
  team: {
    _id: string;
    name: string;
  };
};

type NotificationItem = {
  _id: string;
  title: string;
  message: string;
  type:
    | "GENERAL"
    | "LEARNING"
    | "TASK"
    | "PROJECT"
    | "TEAM"
    | "SYSTEM";
  read: boolean;
  link?: string;
  createdAt: string;
  recipient?: {
    _id: string;
    name: string;
    email: string;
  };
};

const notificationTypes = [
  "GENERAL",
  "LEARNING",
  "TASK",
  "PROJECT",
  "TEAM",
  "SYSTEM",
] as const;

export default function MentorNotificationsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [notifications, setNotifications] = useState<
    NotificationItem[]
  >([]);

  const [selectedStudents, setSelectedStudents] = useState<string[]>(
    []
  );

  const [selectedTeam, setSelectedTeam] = useState("ALL");
  const [search, setSearch] = useState("");

  const [title, setTitle] = useState("");
  const [type, setType] =
    useState<(typeof notificationTypes)[number]>("GENERAL");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/mentor/notifications",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load mentor notifications."
        );
      }

      setStudents(data.students || []);
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error(
        "Failed to load mentor notifications:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }

  const teams = useMemo(() => {
    const map = new Map<string, string>();

    students.forEach((student) => {
      map.set(student.team._id, student.team.name);
    });

    return Array.from(map.entries()).map(
      ([id, name]) => ({
        id,
        name,
      })
    );
  }, [students]);

  const filteredStudents = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesTeam =
        selectedTeam === "ALL" ||
        student.team._id === selectedTeam;

      const matchesSearch =
        !searchValue ||
        student.name.toLowerCase().includes(searchValue) ||
        student.email.toLowerCase().includes(searchValue);

      return matchesTeam && matchesSearch;
    });
  }, [students, selectedTeam, search]);

  const visibleStudentIds = filteredStudents.map(
    (student) => student._id
  );

  const allVisibleSelected =
    visibleStudentIds.length > 0 &&
    visibleStudentIds.every((id) =>
      selectedStudents.includes(id)
    );

  function toggleStudent(id: string) {
    setSelectedStudents((current) =>
      current.includes(id)
        ? current.filter((studentId) => studentId !== id)
        : [...current, id]
    );
  }

  function toggleVisibleStudents() {
    if (allVisibleSelected) {
      setSelectedStudents((current) =>
        current.filter(
          (id) => !visibleStudentIds.includes(id)
        )
      );
    } else {
      setSelectedStudents((current) => [
        ...new Set([
          ...current,
          ...visibleStudentIds,
        ]),
      ]);
    }
  }

  function clearSelection() {
    setSelectedStudents([]);
  }

  async function sendNotification() {
    try {
      setSending(true);
      setError("");
      setSuccess("");

      if (selectedStudents.length === 0) {
        throw new Error(
          "Please select at least one student."
        );
      }

      if (!title.trim()) {
        throw new Error(
          "Notification title is required."
        );
      }

      if (!message.trim()) {
        throw new Error(
          "Notification message is required."
        );
      }

      const response = await fetch(
        "/api/mentor/notifications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipientIds: selectedStudents,
            title: title.trim(),
            message: message.trim(),
            type,
            link: link.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to send notification."
        );
      }

      setSuccess(
        data.message ||
          "Notification sent successfully."
      );

      setTitle("");
      setMessage("");
      setLink("");
      setType("GENERAL");
      setSelectedStudents([]);

      await fetchNotifications();
    } catch (error) {
      console.error(
        "Send notification error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to send notification."
      );
    } finally {
      setSending(false);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function getTypeClasses(
    notificationType: NotificationItem["type"]
  ) {
    switch (notificationType) {
      case "LEARNING":
        return "bg-blue-50 text-blue-700";

      case "TASK":
        return "bg-amber-50 text-amber-700";

      case "PROJECT":
        return "bg-violet-50 text-violet-700";

      case "TEAM":
        return "bg-emerald-50 text-emerald-700";

      case "SYSTEM":
        return "bg-slate-100 text-slate-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-violet-600">
            <Bell size={17} />
            Notifications
          </div>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Student Notifications
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Send announcements and updates to students
            from your assigned teams.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {success}
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <UsersRound size={18} />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Assigned Students
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {students.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Bell size={18} />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Sent Notifications
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {notifications.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCheck size={18} />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Selected
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {selectedStudents.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Send Notification */}
        <section className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Send size={18} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Send Notification
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Select students and send them an update.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-5 sm:p-6">
            {/* Student Selection */}
            <div>
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <label className="text-sm font-semibold text-slate-800">
                    Recipients
                  </label>

                  <p className="mt-1 text-xs text-slate-400">
                    {selectedStudents.length} student
                    {selectedStudents.length !== 1
                      ? "s"
                      : ""}{" "}
                    selected
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={toggleVisibleStudents}
                    disabled={
                      filteredStudents.length === 0
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {allVisibleSelected
                      ? "Deselect visible"
                      : "Select visible"}
                  </button>

                  {selectedStudents.length > 0 && (
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-3 grid gap-3 sm:grid-cols-2">
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search students..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                <div className="relative">
                  <select
                    value={selectedTeam}
                    onChange={(event) =>
                      setSelectedTeam(event.target.value)
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  >
                    <option value="ALL">
                      All Teams
                    </option>

                    {teams.map((team) => (
                      <option
                        key={team.id}
                        value={team.id}
                      >
                        {team.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-8">
                  <Loader2
                    size={22}
                    className="animate-spin text-violet-600"
                  />
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <UsersRound
                    size={24}
                    className="mx-auto text-slate-400"
                  />

                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    No students found
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Try changing the search or team filter.
                  </p>
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200">
                  <div className="divide-y divide-slate-100">
                    {filteredStudents.map((student) => {
                      const selected =
                        selectedStudents.includes(
                          student._id
                        );

                      return (
                        <button
                          type="button"
                          key={student._id}
                          onClick={() =>
                            toggleStudent(student._id)
                          }
                          className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                            selected
                              ? "bg-violet-50"
                              : "bg-white hover:bg-slate-50"
                          }`}
                        >
                          <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                              selected
                                ? "border-violet-600 bg-violet-600 text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {selected && (
                              <Check size={13} />
                            )}
                          </div>

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                            {student.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {student.name}
                            </p>

                            <p className="truncate text-xs text-slate-400">
                              {student.email}
                            </p>
                          </div>

                          <span className="hidden rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500 sm:block">
                            {student.team.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Form */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="Enter notification title"
                  maxLength={120}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Type
                </label>

                <div className="relative">
                  <select
                    value={type}
                    onChange={(event) =>
                      setType(
                        event.target.value as (typeof notificationTypes)[number]
                      )
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  >
                    {notificationTypes.map(
                      (notificationType) => (
                        <option
                          key={notificationType}
                          value={notificationType}
                        >
                          {notificationType}
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Portal Link
                  <span className="ml-1 font-normal text-slate-400">
                    (Optional)
                  </span>
                </label>

                <input
                  type="text"
                  value={link}
                  onChange={(event) =>
                    setLink(event.target.value)
                  }
                  placeholder="/student/tasks"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Message
                </label>

                <textarea
                  value={message}
                  onChange={(event) =>
                    setMessage(event.target.value)
                  }
                  placeholder="Write your notification message..."
                  rows={5}
                  maxLength={2000}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {message.length}/2000
                </p>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={sendNotification}
                disabled={sending || selectedStudents.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={17} />
                    Send Notification
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Sent History */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div>
              <h2 className="font-semibold text-slate-900">
                Sent Notifications
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Recent notifications sent to students in
                your teams.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center">
              <Loader2
                size={26}
                className="mx-auto animate-spin text-violet-600"
              />

              <p className="mt-3 text-sm text-slate-500">
                Loading notification history...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Bell size={24} />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                No notifications sent
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Notifications you send will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className="p-5 sm:p-6"
                >
                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <Bell size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-slate-900">
                              {notification.title}
                            </h3>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getTypeClasses(
                                notification.type
                              )}`}
                            >
                              {notification.type}
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {notification.recipient && (
                              <span className="text-xs font-medium text-slate-500">
                                To:{" "}
                                {
                                  notification
                                    .recipient.name
                                }
                              </span>
                            )}

                            <span className="flex items-center gap-1 text-xs text-slate-400">
                              <Clock size={12} />
                              {formatDate(
                                notification.createdAt
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {notification.message}
                      </p>

                      {notification.link && (
                        <p className="mt-3 break-all text-xs font-medium text-violet-600">
                          {notification.link}
                        </p>
                      )}

                      <div className="mt-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            notification.read
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {notification.read ? (
                            <CheckCheck size={12} />
                          ) : (
                            <Clock size={12} />
                          )}

                          {notification.read
                            ? "Read by student"
                            : "Unread"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}