"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BellRing,
  BookOpen,
  Check,
  CheckCheck,
  ClipboardList,
  FolderKanban,
  Settings,
  Users,
} from "lucide-react";

type NotificationType =
  | "GENERAL"
  | "LEARNING"
  | "TASK"
  | "PROJECT"
  | "TEAM"
  | "SYSTEM";

type Notification = {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  createdAt: string;
};

const typeConfig: Record<
  NotificationType,
  {
    icon: typeof Bell;
    bg: string;
    text: string;
  }
> = {
  GENERAL: {
    icon: Bell,
    bg: "bg-slate-100",
    text: "text-slate-600",
  },
  LEARNING: {
    icon: BookOpen,
    bg: "bg-violet-50",
    text: "text-violet-600",
  },
  TASK: {
    icon: ClipboardList,
    bg: "bg-cyan-50",
    text: "text-cyan-600",
  },
  PROJECT: {
    icon: FolderKanban,
    bg: "bg-emerald-50",
    text: "text-emerald-600",
  },
  TEAM: {
    icon: Users,
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
  SYSTEM: {
    icon: Settings,
    bg: "bg-slate-100",
    text: "text-slate-600",
  },
};

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await fetch("/api/student/notifications");
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load notifications.");
          return;
        }

        setNotifications(data.notifications || []);
      } catch (error) {
        console.error("Failed to load notifications:", error);
        setError("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const markAsRead = async (notificationId: string) => {
    setMarkingId(notificationId);

    try {
      const response = await fetch("/api/student/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update notification.");
        return;
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Failed to mark notification:", error);
      setError("Failed to update notification.");
    } finally {
      setMarkingId(null);
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    setMarkingAll(true);
    setError("");

    try {
      const response = await fetch("/api/student/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          markAll: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update notifications.");
        return;
      }

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    } catch (error) {
      console.error("Failed to mark all notifications:", error);
      setError("Failed to update notifications.");
    } finally {
      setMarkingAll(false);
    }
  };

  const formatDate = (date: string) => {
    const notificationDate = new Date(date);
    const now = new Date();

    const difference = now.getTime() - notificationDate.getTime();
    const minutes = Math.floor(difference / (1000 * 60));
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    if (hours < 24) {
      return `${hours}h ago`;
    }

    if (days < 7) {
      return `${days}d ago`;
    }

    return notificationDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-violet-600" />

            <p className="mt-4 text-sm text-slate-500">
              Loading notifications...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-violet-600">
                Updates
              </p>

              {unreadCount > 0 && (
                <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Notifications
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Stay updated with your learning, tasks, projects and team.
            </p>
          </div>

          <button
            type="button"
            onClick={markAllAsRead}
            disabled={markingAll || unreadCount === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck size={17} />

            {markingAll ? "Marking..." : "Mark all as read"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Notifications */}
        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <BellRing size={25} />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No notifications
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              You&apos;re all caught up. New updates from your club,
              mentor and team will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => {
                const config =
                  typeConfig[notification.type] ||
                  typeConfig.GENERAL;

                const Icon = config.icon;

                const content = (
                  <div
                    className={`flex gap-4 p-5 transition ${
                      notification.read
                        ? "bg-white"
                        : "bg-violet-50/40"
                    } hover:bg-slate-50`}
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${config.bg} ${config.text}`}
                    >
                      <Icon size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <div className="flex items-center gap-2">
                          <h2
                            className={`text-sm ${
                              notification.read
                                ? "font-semibold text-slate-800"
                                : "font-bold text-slate-900"
                            }`}
                          >
                            {notification.title}
                          </h2>

                          {!notification.read && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-violet-600" />
                          )}
                        </div>

                        <span className="shrink-0 text-xs text-slate-400">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {notification.message}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        {!notification.read && (
                          <button
                            type="button"
                            disabled={markingId === notification._id}
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              markAsRead(notification._id);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 transition hover:text-violet-800 disabled:opacity-50"
                          >
                            <Check size={14} />

                            {markingId === notification._id
                              ? "Updating..."
                              : "Mark as read"}
                          </button>
                        )}

                        {notification.link && (
                          <span className="text-xs font-medium text-slate-400">
                            View details →
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );

                if (notification.link) {
                  return (
                    <Link
                      key={notification._id}
                      href={notification.link}
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <div key={notification._id}>
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}