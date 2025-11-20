"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = { secondary: "#10B981" }; 

export default function CourseRevenueBar({ data }: { data: Report[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={data}
                layout="vertical"
                margin={{ left: 0, right: 30 }}
              >
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop
                      offset="0%"
                      stopColor={COLORS.secondary}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="100%"
                      stopColor={COLORS.secondary}
                      stopOpacity={1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  opacity={0.5}
                />
                <XAxis
                  type="number"
                  stroke="#6b7280"
                  tick={{ fill: "#fff", fontSize: 12 }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <YAxis
                  dataKey="course"
                  type="category"
                  width={150}
                  stroke="#6b7280"
                  tick={{ fill: "#fff", fontSize: 10, fontWeight: 500 }}
                />
                <Tooltip
                  formatter={(value) => `₹${Number(value).toLocaleString()}`}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow:
                      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                    padding: "12px",
                  }}
                  labelStyle={{
                    color: "#111827",
                    fontWeight: 600,
                    marginBottom: "4px",
                  }}
                  itemStyle={{ color: "#6b7280", padding: "2px 0" }}
                />
                <Bar
                  dataKey="revenue"
                  fill="url(#revenueGradient)"
                  name="Revenue"
                  radius={[0, 8, 8, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
  );
}
