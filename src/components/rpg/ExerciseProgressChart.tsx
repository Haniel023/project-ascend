"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type ExerciseProgressPoint = { date: string; weightKg: number; reps: number; estimated1Rm: number };

export function ExerciseProgressChart({ data }: { data: ExerciseProgressPoint[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No logged sets with weight and reps for this exercise yet.</p>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#2c2c2a" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#898781", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#383835" }}
            tickFormatter={(d: string) => d.slice(5)}
            minTickGap={24}
          />
          <YAxis
            domain={["dataMin - 2", "dataMax + 2"]}
            tick={{ fill: "#898781", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={36}
          />
          <Tooltip
            contentStyle={{ background: "#1a1a19", border: "1px solid #383835", borderRadius: 8 }}
            labelStyle={{ color: "#ffffff" }}
            itemStyle={{ color: "#c3c2b7" }}
          />
          <Line
            type="monotone"
            dataKey="estimated1Rm"
            name="Est. 1RM"
            stroke="#9085e9"
            strokeWidth={2}
            dot={{ r: 3, fill: "#9085e9" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
