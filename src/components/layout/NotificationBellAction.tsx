"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type UserNotification,
} from "@/lib/api/notifications";
import { cn } from "@/lib/utils/cn";

function countLabel(count: number) {
  return count > 99 ? "99+" : String(count);
}

function relativeTime(iso: string | null | undefined) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function NotificationBellAction() {
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<UserNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const inbox = await listNotifications({ size: 10 });
      setItems(inbox.items);
      setUnread(inbox.unreadCount);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);
    window.addEventListener("king-sparkon:notifications", refresh as EventListener);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("king-sparkon:notifications", refresh as EventListener);
    };
  }, [refresh]);

  useEffect(() => {
    if (open) void refresh();
  }, [open, refresh]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-notification-dropdown]")) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  async function acknowledge(notificationId: number) {
    try {
      await markNotificationRead(notificationId);
      setItems((current) =>
        current.map((item) => (item.id === notificationId ? { ...item, readAt: new Date().toISOString() } : item)),
      );
      setUnread((current) => Math.max(0, current - 1));
    } catch {
      // Keep the item unread; the next refresh reconciles.
    }
  }

  async function acknowledgeAll() {
    try {
      await markAllNotificationsRead();
      const now = new Date().toISOString();
      setItems((current) => current.map((item) => (item.readAt ? item : { ...item, readAt: now })));
      setUnread(0);
    } catch {
      // Keep state; the next refresh reconciles.
    }
  }

  const title = unread === 0 ? "No unread notifications" : `${unread} unread notification${unread === 1 ? "" : "s"}`;

  return (
    <div className="relative flex flex-col items-center gap-1" data-notification-dropdown>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={title}
        aria-expanded={open}
        aria-haspopup="menu"
        title="View notifications"
        className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-white text-[var(--ink)] shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-[var(--line-strong)] hover:bg-[var(--surface)]"
      >
        <Bell className={cn("h-4.5 w-4.5", unread > 0 ? "fill-amber-400 text-amber-500" : "text-[var(--steel)]")} />
        {unread > 0 ? (
          <span
            className="absolute -right-1.5 -top-1.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[0.62rem] font-black leading-none text-white shadow-md"
            aria-label={`${unread} unread`}
          >
            {countLabel(unread)}
          </span>
        ) : null}
        <span className="sr-only" aria-live="polite">{title}</span>
      </button>
      <span className={cn("text-[0.6rem] font-extrabold uppercase leading-none tracking-[0.08em] text-[var(--steel)]")} aria-hidden="true">Alerts</span>

      {open ? (
        <div className="absolute right-0 top-full z-40 w-80 pt-2">
          <div className="rounded-xl border border-[var(--line)] bg-white p-3 shadow-[var(--shadow-ledger)]" role="menu">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Notifications</p>
              {unread > 0 ? (
                <button
                  type="button"
                  onClick={() => void acknowledgeAll()}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[0.68rem] font-black uppercase tracking-wide text-[var(--signal)] hover:bg-[var(--surface)]"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </button>
              ) : null}
            </div>

            {failed && items.length === 0 ? (
              <p className="mt-3 rounded-lg border border-dashed border-[var(--line)] bg-[var(--surface)] p-3 text-center text-xs font-semibold text-[var(--muted)]">
                Couldn&apos;t load notifications right now.
              </p>
            ) : items.length === 0 ? (
              <p className="mt-3 rounded-lg border border-dashed border-[var(--line)] bg-[var(--surface)] p-3 text-center text-xs font-semibold text-[var(--muted)]">
                You&apos;re all caught up — new booking offers, payouts and shifts will appear here.
              </p>
            ) : (
              <ul className="mt-3 grid max-h-72 gap-1.5 overflow-auto pr-1">
                {items.map((item) => {
                  const isUnread = !item.readAt;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => void acknowledge(item.id)}
                        title={isUnread ? "Mark as read" : item.title}
                        className={cn(
                          "grid w-full gap-0.5 rounded-lg border px-3 py-2 text-left transition hover:bg-[var(--surface)]",
                          isUnread ? "border-[var(--gold)] bg-[var(--gold)]/10" : "border-[var(--line)]",
                        )}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-xs font-black text-[var(--ink)]">{item.title}</span>
                          {isUnread ? <span className="h-2 w-2 shrink-0 rounded-full bg-rose-500" aria-label="Unread" /> : null}
                        </span>
                        {item.body ? <span className="line-clamp-2 text-xs font-semibold text-[var(--steel)]">{item.body}</span> : null}
                        <span className="text-[0.65rem] font-bold uppercase tracking-wide text-[var(--muted)]">
                          {item.type.replace(/_/g, " ")} · {relativeTime(item.createdAt)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
