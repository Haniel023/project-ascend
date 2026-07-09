"use client";

import { motion } from "motion/react";
import { HeartPulse } from "lucide-react";
import { suggestedRecoveryAction } from "@/server/game/recovery/recoveryScore";
import { RecoveryCheckinDialog, type RecoveryCheckinDefaults } from "./RecoveryCheckinDialog";

export type RecoveryCardData = {
  recoveryScore: number;
  sleepHours: number;
  waterIntakeLiters: number;
  energyLevel: number;
  sorenessLevel: number;
  stressLevel: number;
  moodLevel: number;
} | null;

function scoreColor(score: number): { bar: string; text: string } {
  if (score < 40) return { bar: "bg-red-500", text: "text-red-300" };
  if (score < 60) return { bar: "bg-amber-500", text: "text-amber-300" };
  if (score < 80) return { bar: "bg-sky-500", text: "text-sky-300" };
  return { bar: "bg-emerald-500", text: "text-emerald-300" };
}

export function RecoveryCard({ checkin }: { checkin: RecoveryCardData }) {
  if (!checkin) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-white/2 p-5 text-center">
        <HeartPulse className="mx-auto size-6 text-zinc-600" />
        <p className="mt-2 font-medium text-zinc-300">No check-in today</p>
        <p className="mt-1 text-sm text-muted-foreground">
          A quick 6-tap check-in tunes today&apos;s XP to how recovered you actually are.
        </p>
        <div className="mt-3">
          <RecoveryCheckinDialog isEdit={false} />
        </div>
      </div>
    );
  }

  const colors = scoreColor(checkin.recoveryScore);
  const defaults: RecoveryCheckinDefaults = {
    sleepHours: checkin.sleepHours,
    waterIntakeLiters: checkin.waterIntakeLiters,
    energyLevel: checkin.energyLevel,
    sorenessLevel: checkin.sorenessLevel,
    stressLevel: checkin.stressLevel,
    moodLevel: checkin.moodLevel,
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <HeartPulse className={`size-5 ${colors.text}`} />
        <div>
          <p className="font-semibold text-zinc-100">Recovery: {checkin.recoveryScore} / 100</p>
          <p className="text-xs text-muted-foreground">{suggestedRecoveryAction(checkin.recoveryScore)}</p>
        </div>
      </div>
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-zinc-800">
        <motion.div
          className={`h-full rounded-full ${colors.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${checkin.recoveryScore}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <div className="mt-3">
        <RecoveryCheckinDialog isEdit defaults={defaults} />
      </div>
    </div>
  );
}
