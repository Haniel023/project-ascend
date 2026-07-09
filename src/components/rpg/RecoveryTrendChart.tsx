"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type RecoveryTrendPoint = { date: string; score: number | null };

export function RecoveryTrendChart({ data }: { data: RecoveryTrendPoint[] }) {
  const hasAnyData = data.some((d) => d.score != null);

  return (
    <div>
      <h3 className="text-sm font-semibold tracking-wide text-zinc-400 uppercase">Recovery Trend</h3>
      {!hasAnyData ? (
        <p className="mt-2 text-sm text-muted-foreground">
          No recovery check-ins yet -- check in daily to see your trend here.
        </p>
      ) : (
        <div className="mt-2 h-56 w-full">
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
                domain={[0, 100]}
                tick={{ fill: "#898781", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{ background: "#1a1a19", border: "1px solid #383835", borderRadius: 8 }}
                labelStyle={{ color: "#ffffff" }}
                itemStyle={{ color: "#c3c2b7" }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3987e5"
                strokeWidth={2}
                dot={{ r: 3, fill: "#3987e5" }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
