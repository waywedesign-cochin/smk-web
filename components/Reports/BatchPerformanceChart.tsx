"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = {
  primary: "#3b82f6",
  info: "#06b6d4",
  success: "#10b981",
};

export default function BatchPerformanceChart({ data }: { data: Report[] }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        barGap={4}
      >
        <defs>
          <linearGradient id="enrolledGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.9} />
            <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.6} />
          </linearGradient>
          <linearGradient id="capacityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.info} stopOpacity={0.9} />
            <stop offset="100%" stopColor={COLORS.info} stopOpacity={0.6} />
          </linearGradient>
          <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.success} stopOpacity={0.9} />
            <stop offset="100%" stopColor={COLORS.success} stopOpacity={0.6} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis
          dataKey="batchName"
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
          dataKey="enrolled"
          name="Enrolled"
          fill={COLORS.primary}
          radius={[8, 8, 0, 0]}
          maxBarSize={50}
        />
        <Bar
          dataKey="capacity"
          name="Capacity"
          fill={COLORS.info}
          radius={[8, 8, 0, 0]}
          maxBarSize={50}
        />
        <Bar
          dataKey="completionRate"
          name="Completion Rate"
          fill={COLORS.success}
          radius={[8, 8, 0, 0]}
          maxBarSize={50}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
