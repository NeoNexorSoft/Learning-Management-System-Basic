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
  { week: "Week 1", hours: 4 },
  { week: "Week 2", hours: 6 },
  { week: "Week 3", hours: 5 },
  { week: "Week 4", hours: 9 },
  { week: "Week 5", hours: 7 },
  { week: "Week 6", hours: 11 },
  { week: "Week 7", hours: 8 },
  { week: "Week 8", hours: 13 },
]

export default function ProgressChart() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">Learning Activity</h3>
          <p className="text-sm text-slate-500">Hours studied per week</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">
          Last 8 Weeks
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              fontSize: "13px",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            }}
            formatter={(value) => [`${value}h`, "Study time"]}
          />
          <Area
            type="monotone"
            dataKey="hours"
            stroke="#6366f1"
            strokeWidth={2.5}
            fill="url(#colorHours)"
            dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 6, fill: "#6366f1" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
