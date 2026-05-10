"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const data = [
  { month: "Nov", earnings: 12000 },
  { month: "Dec", earnings: 18000 },
  { month: "Jan", earnings: 15000 },
  { month: "Feb", earnings: 22000 },
  { month: "Mar", earnings: 28000 },
  { month: "Apr", earnings: 35000 },
  { month: "May", earnings: 31000 },
  { month: "Jun", earnings: 42000 },
]

export default function EarningsChart() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <h3 className="text-base font-bold text-slate-900 mb-4">Monthly Earnings</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(v) => [`TK${Number(v).toLocaleString()} BDT`, "Earnings"]}
            labelStyle={{ fontSize: 12, color: "#475569" }}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="earnings"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#earningsGrad)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
