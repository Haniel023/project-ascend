"use client";

import { useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";

export type MuscleBalancePoint = { muscleGroup: string; sets: number };

export function MuscleBalanceRadar({
  data7d,
  data30d,
}: {
  data7d: MuscleBalancePoint[];
  data30d: MuscleBalancePoint[];
}) {
  const [range, setRange] = useState<"7d" | "30d">("7d");
  const data = range === "7d" ? data7d : data30d;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wide text-zinc-400 uppercase">Muscle Balance</h3>
        <div className="flex gap-1">
          {(["7d", "30d"] as const).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setRange(w)}
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                range === w ? "bg-violet-500 text-white" : "bg-white/10 text-zinc-400"
              )}
            >
              {w}
            </button>
          ))}
        </div>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="70%">
            <PolarGrid stroke="#2c2c2a" />
            <PolarAngleAxis dataKey="muscleGroup" tick={{ fill: "#898781", fontSize: 12 }} />
            <Radar
              name="Sets"
              dataKey="sets"
              stroke="#9085e9"
              fill="#9085e9"
              fillOpacity={0.35}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{ background: "#1a1a19", border: "1px solid #383835", borderRadius: 8 }}
              labelStyle={{ color: "#ffffff" }}
              itemStyle={{ color: "#c3c2b7" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
