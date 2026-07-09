"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";

export type FrequencyPoint = { date: string; sets: number };

export function WorkoutFrequencyChart({ data }: { data: FrequencyPoint[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold tracking-wide text-zinc-400 uppercase">Training Frequency (14 days)</h3>
      <div className="mt-2 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#2c2c2a" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#898781", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#383835" }}
              tickFormatter={(d: string) => d.slice(5)}
              minTickGap={16}
            />
            <Tooltip
              contentStyle={{ background: "#1a1a19", border: "1px solid #383835", borderRadius: 8 }}
              labelStyle={{ color: "#ffffff" }}
              itemStyle={{ color: "#c3c2b7" }}
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
            />
            <Bar dataKey="sets" fill="#eb6834" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
