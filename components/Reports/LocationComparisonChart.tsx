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

export default function LocationComparisonChart({ data }: { data: Report[] }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={data}
        barGap={6}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="studentsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8884d8" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#8884d8" stopOpacity={0.6} />
          </linearGradient>
          <linearGradient id="batchesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#82ca9d" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#82ca9d" stopOpacity={0.6} />
          </linearGradient>
          <linearGradient
            id="locationRevenueGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="#00C49F" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#00C49F" stopOpacity={0.6} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis
          dataKey="location"
          stroke="rgba(255,255,255,0.2)"
          tick={{ fill: "#fff", fontSize: 12 }}
        />
        <YAxis
          yAxisId="left"
          stroke="rgba(255,255,255,0.2)"
          tick={{ fill: "#fff", fontSize: 12 }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="rgba(255,255,255,0.2)"
          tick={{ fill: "#fff", fontSize: 12 }}
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
          yAxisId="left"
          dataKey="batches"
          name="Batches"
          fill="#82ca9d"
          radius={[8, 8, 0, 0]}
          maxBarSize={60}
        />
        <Bar
          yAxisId="left"
          dataKey="students"
          name="Students"
          fill="#8884d8"
          radius={[8, 8, 0, 0]}
          maxBarSize={60}
        />
        <Bar
          yAxisId="right"
          dataKey="revenue"
          name="Revenue"
          fill="#00C49F"
          radius={[8, 8, 0, 0]}
          maxBarSize={60}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
