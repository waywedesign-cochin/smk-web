"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

export default function PaymentMethodPie({ data }: { data: [] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            `${name} ${((percent as number) * 100).toFixed(0)}%`
          }
          outerRadius={110}
          innerRadius={70}
          fill="#8884d8"
          dataKey="value"
          paddingAngle={3}
          strokeWidth={0}
          
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={PIE_COLORS[index % PIE_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => `₹${Number(value).toLocaleString()}`}
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.98)",
            border: "1px solid rgba(0, 0, 0, 0.08)",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
            padding: "12px 16px",
          }}
          itemStyle={{
            color: "#1f2937",
            fontWeight: 600,
            fontSize: "14px",
          }}
          labelStyle={{
            color: "#6b7280",
            fontWeight: 500,
            fontSize: "13px",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
