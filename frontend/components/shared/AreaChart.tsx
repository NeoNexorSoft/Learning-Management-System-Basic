"use client"

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export default function AreaChart({
  data,
  xKey,
  dataKey,
  title,
  subtitle,
  badge,
  height = 200,
  gradientId,
  showDots = true,
  yTickSuffix,
  tooltipSuffix,
  tooltipLabel,
}: {
  data: Record<string, string | number>[]
  xKey: string
  dataKey: string
  title: string
  subtitle?: string
  badge?: string
  height?: number
  gradientId: string
  showDots?: boolean
  yTickSuffix?: string
  tooltipSuffix?: string
  tooltipLabel?: string
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
        {badge && (
          <span className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={yTickSuffix ? (v: number) => `${v}${yTickSuffix}` : undefined}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              fontSize: "13px",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            }}
            formatter={tooltipSuffix || tooltipLabel
              ? (v: number) => [`${v}${tooltipSuffix ?? ""}`, tooltipLabel ?? ""]
              : undefined}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke="#6366f1"
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            dot={showDots ? { r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" } : false}
            activeDot={showDots ? { r: 6, fill: "#6366f1" } : undefined}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  )
}
