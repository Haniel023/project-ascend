"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const DISMISSED_KEY = "ascend:notif:optInDismissed";
const LAST_NUDGE_KEY = "ascend:notif:lastNudge";

// Tier 1 notifications: no server push, no cron -- just the browser Notification API
// fired from an open tab, plus an opt-in prompt. Good enough given this project has
// no scheduled background trigger yet (see the roadmap's Tier 2 for real Web Push).
export function NotificationsClient({
  shouldNudgeLog,
  shouldNudgeRecovery,
  today,
}: {
  shouldNudgeLog: boolean;
  shouldNudgeRecovery: boolean;
  today: string;
}) {
  const [showOptIn, setShowOptIn] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    if (Notification.permission === "default" && localStorage.getItem(DISMISSED_KEY) !== "1") {
      setShowOptIn(true);
      return;
    }

    if (Notification.permission !== "granted") return;
    if (!shouldNudgeLog && !shouldNudgeRecovery) return;
    if (localStorage.getItem(LAST_NUDGE_KEY) === today) return;

    if (shouldNudgeRecovery) {
      new Notification("Recovery check-in waiting", {
        body: "A quick 6-tap check-in tunes today's XP to how recovered you actually are.",
        icon: "/icon-192",
      });
    } else if (shouldNudgeLog) {
      new Notification("Haven't logged today yet", {
        body: "Every set moves your character forward -- log a workout before the day ends.",
        icon: "/icon-192",
      });
    }
    localStorage.setItem(LAST_NUDGE_KEY, today);
  }, [shouldNudgeLog, shouldNudgeRecovery, today]);

  if (!showOptIn) return null;

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setShowOptIn(false);
  }

  function enable() {
    Notification.requestPermission().finally(() => setShowOptIn(false));
  }

  return (
    <div className="mt-3 flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
      <Bell className="size-4 shrink-0 text-amber-400" />
      <p className="flex-1 text-sm text-zinc-300">
        Enable notifications for a nudge when you haven&apos;t logged or checked in yet.
      </p>
      <Button size="sm" onClick={enable}>
        Enable
      </Button>
      <button
        type="button"
        onClick={dismiss}
        className="text-muted-foreground hover:text-zinc-200"
        aria-label="Dismiss"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
