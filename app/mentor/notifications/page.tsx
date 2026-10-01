"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Bell,
  Check,
  ChevronDown,
  Clock,
  Send,
  Users,
  X,
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
  recipient?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
};

const notificationTypes = [
  {
    value: "GENERAL",
    label: "General",
  },
  {
    value: "LEARNING",
    label: "Learning",
  },
  {
    value: "TASK",
    label: "Task",
  },
  {
    value: "PROJECT",
    label: "Project",
  },
  {
    value: "TEAM",
    label: "Team",
  },
  {
    value: "SYSTEM",
    label: "System",
  },
] as const;

export default function MentorNotificationsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [notifications, setNotifications] = useState<
    NotificationItem[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [selectedStudents, setSelectedStudents] =
    useState<string[]>([]);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<
    NotificationItem["type"]
  >("GENERAL");
  const [link, setLink] = useState("");

  const [search, setSearch] = useState("");
  const [showStudentList, setShowStudentList] =
    useState(false);

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
            "Failed to load notifications."
        );
      }

      setStudents(data.students || []);
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error(
        "Failed to load notifications:",
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

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return students;
    }

    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        student.team.name
          .toLowerCase()
          .includes(query)
    );
  }, [students, search]);

  function toggleStudent(studentId: string) {
    setSelectedStudents((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId]
    );
  }

  function selectAllStudents() {
    setSelectedStudents(
      filteredStudents.map((student) => student._id)
    );
  }

  function clearSelectedStudents() {
    setSelectedStudents([]);
  }

  async function handleSendNotification(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSending(true);
    setError("");
    setSuccess("");

    if (selectedStudents.length === 0) {
      setError(
        "Please select at least one student."
      );
      setSending(false);
      return;
    }

    if (!title.trim()) {
      setError(
        "Please enter a notification title."
      );
      setSending(false);
      return;
    }

    if (!message.trim()) {
      setError(
        "Please enter a notification message."
      );
      setSending(false);
      return;
    }

    try {
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

      setSelectedStudents([]);
      setTitle("");
      setMessage("");
      setType("GENERAL");
      setLink("");

      await fetchNotifications();
    } catch (error) {
      console.error(
        "Failed to send notification:",
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

  const selectedStudentNames = students
    .filter((student) =>
      selectedStudents.includes(student._id)
    )
    .map((student) => student.name);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-violet-600">
            <Bell size={17} />
            Notifications
          </div>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Mentor Notifications
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Send important updates and messages to
            students in your teams.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {success && (
          <div className="flex items-start justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <span>{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="shrink-0"
            >
              <X size={17} />
            </button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          {/* Send Notification */}
          <section className="rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Send size={18} />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Send Notification
                  </h2>

                  <p className="text-sm text-slate-500">
                    Message your assigned students.
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSendNotification}
              className="space-y-5 p-5 sm:p-6"
            >
              {/* Students */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Recipients
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setShowStudentList(
                      (current) => !current
                    )
                  }
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm transition hover:border-violet-300"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Users
                      size={17}
                      className="shrink-0 text-slate-400"
                    />

                    <span className="truncate text-slate-600">
                      {selectedStudents.length === 0
                        ? "Select students"
                        : `${selectedStudents.length} student${
                            selectedStudents.length === 1
                              ? ""
                              : "s"
                          } selected`}
                    </span>
                  </div>

                  <ChevronDown
                    size={17}
                    className={`shrink-0 text-slate-400 transition ${
                      showStudentList
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {showStudentList && (
                  <div className="mt-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    {/* Search */}
                    <input
                      type="text"
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      placeholder="Search students..."
                      className="mb-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:bg-white"
                    />

                    {/* Select actions */}
                    <div className="mb-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={selectAllStudents}
                        className="text-xs font-semibold text-violet-600 hover:text-violet-700"
                      >
                        Select visible
                      </button>

                      <button
                        type="button"
                        onClick={clearSelectedStudents}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="max-h-56 space-y-1 overflow-y-auto">
                      {filteredStudents.length === 0 ? (
                        <p className="px-2 py-4 text-center text-xs text-slate-400">
                          No students found.
                        </p>
                      ) : (
                        filteredStudents.map(
                          (student) => {
                            const selected =
                              selectedStudents.includes(
                                student._id
                              );

                            return (
                              <button
                                key={student._id}
                                type="button"
                                onClick={() =>
                                  toggleStudent(
                                    student._id
                                  )
                                }
                                className={`flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition ${
                                  selected
                                    ? "bg-violet-50"
                                    : "hover:bg-slate-50"
                                }`}
                              >
                                <div
                                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                                    selected
                                      ? "border-violet-600 bg-violet-600 text-white"
                                      : "border-slate-300"
                                  }`}
                                >
                                  {selected && (
                                    <Check size={13} />
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-slate-700">
                                    {student.name}
                                  </p>

                                  <p className="truncate text-xs text-slate-400">
                                    {student.team.name}
                                  </p>
                                </div>
                              </button>
                            );
                          }
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Selected names */}
                {selectedStudentNames.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedStudentNames
                      .slice(0, 4)
                      .map((studentName) => (
                        <span
                          key={studentName}
                          className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700"
                        >
                          {studentName}
                        </span>
                      ))}

                    {selectedStudentNames.length > 4 && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                        +
                        {selectedStudentNames.length -
                          4}{" "}
                        more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label
                  htmlFor="notification-title"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Title
                </label>

                <input
                  id="notification-title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="e.g. Task submission reminder"
                  maxLength={120}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              {/* Type */}
              <div>
                <label
                  htmlFor="notification-type"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Type
                </label>

                <select
                  id="notification-type"
                  value={type}
                  onChange={(event) =>
                    setType(
                      event.target.value as NotificationItem["type"]
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                >
                  {notificationTypes.map(
                    (notificationType) => (
                      <option
                        key={notificationType.value}
                        value={notificationType.value}
                      >
                        {notificationType.label}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="notification-message"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Message
                </label>

                <textarea
                  id="notification-message"
                  value={message}
                  onChange={(event) =>
                    setMessage(event.target.value)
                  }
                  rows={5}
                  maxLength={1000}
                  required
                  placeholder="Write your message..."
                  className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {message.length}/1000
                </p>
              </div>

              {/* Link */}
              <div>
                <label
                  htmlFor="notification-link"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Portal Link{" "}
                  <span className="font-normal text-slate-400">
                    (Optional)
                  </span>
                </label>

                <input
                  id="notification-link"
                  type="text"
                  value={link}
                  onChange={(event) =>
                    setLink(event.target.value)
                  }
                  placeholder="/student/tasks"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Example: /student/tasks
                </p>
              </div>

              {/* Send */}
              <button
                type="submit"
                disabled={
                  sending ||
                  students.length === 0
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={17} />

                {sending
                  ? "Sending..."
                  : "Send Notification"}
              </button>
            </form>
          </section>

          {/* Sent Notifications */}
          <section className="rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Sent Notifications
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Recent notifications sent to your
                  students.
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Bell size={18} />
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-10 text-center">
                  <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-violet-600" />

                  <p className="mt-3 text-sm text-slate-500">
                    Loading notifications...
                  </p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                    <Bell size={20} />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-slate-800">
                    No notifications yet
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Notifications you send will appear
                    here.
                  </p>
                </div>
              ) : (
                notifications.map(
                  (notification) => (
                    <div
                      key={notification._id}
                      className="p-5 transition hover:bg-slate-50 sm:p-6"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                          <Bell size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-slate-900">
                                {notification.title}
                              </h3>

                              <p className="mt-1 text-xs text-slate-400">
                                To:{" "}
                                <span className="font-medium text-slate-500">
                                  {notification.recipient
                                    ?.name ||
                                    "Student"}
                                </span>
                              </p>
                            </div>

                            <span
                              className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold ${getTypeClasses(
                                notification.type
                              )}`}
                            >
                              {notification.type}
                            </span>
                          </div>

                          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                            {notification.message}
                          </p>

                          {notification.link && (
                            <p className="mt-2 truncate text-xs font-medium text-violet-600">
                              {notification.link}
                            </p>
                          )}

                          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
                            <Clock size={13} />

                            <span>
                              {formatDate(
                                notification.createdAt
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}