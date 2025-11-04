"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = {
  primary: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
};

export default function RevenueChart({ data }: { data: Report[] }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="revenueBarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.9} />
            <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.6} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis
          dataKey="month"
          tick={{ fill: "#fff", fontSize: 12 }}
          stroke="rgba(255,255,255,0.2)"
        />
        <YAxis
          tick={{ fill: "#fff", fontSize: 12 }}
          stroke="rgba(255,255,255,0.2)"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            border: "none",
            borderRadius: "12px",
            boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
            padding: "12px 16px",
          }}
          labelStyle={{
            color: "#fff",
            fontWeight: 600,
            marginBottom: "8px",
          }}
          itemStyle={{ color: "#fff", padding: "4px 0" }}
        />
        <Legend
          wrapperStyle={{ paddingTop: "20px" }}
          iconType="circle"
          formatter={(value, entry) => (
            <span style={{ color: entry.color }}>{value}</span>
          )}
        />

        <Bar
          dataKey="revenue"
          barSize={32}
          fill={COLORS.primary}
          name="Revenue"
          radius={[8, 8, 0, 0]}
        />
        <Line
          type="monotone"
          dataKey="collections"
          stroke={COLORS.success}
          strokeWidth={3}
          name="Collections"
          dot={{ fill: COLORS.success, r: 5 }}
          activeDot={{ r: 7 }}
        />
        <Line
          type="monotone"
          dataKey="outstanding"
          stroke={COLORS.warning}
          strokeWidth={3}
          name="Outstanding"
          dot={{ fill: COLORS.warning, r: 5 }}
          activeDot={{ r: 7 }}
          strokeDasharray="5 5"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
