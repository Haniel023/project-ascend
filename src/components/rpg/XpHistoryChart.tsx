"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";

export type XpHistoryPoint = { date: string; xp: number };

export function XpHistoryChart({ data }: { data: XpHistoryPoint[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold tracking-wide text-zinc-400 uppercase">XP History (30 days)</h3>
      <div className="mt-2 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3987e5" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#3987e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#2c2c2a" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#898781", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#383835" }}
              tickFormatter={(d: string) => d.slice(5)}
              minTickGap={24}
            />
            <Tooltip
              contentStyle={{ background: "#1a1a19", border: "1px solid #383835", borderRadius: 8 }}
              labelStyle={{ color: "#ffffff" }}
              itemStyle={{ color: "#c3c2b7" }}
            />
            <Area type="monotone" dataKey="xp" stroke="#3987e5" strokeWidth={2} fill="url(#xpFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
