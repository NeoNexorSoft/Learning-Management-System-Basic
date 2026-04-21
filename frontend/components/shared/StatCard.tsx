import type { ElementType } from "react"
import { TrendingUp } from "lucide-react"

export default function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  iconBg,
  iconColor,
}: {
  icon: ElementType
  label: string
  value: string | number
  sub: string
  iconBg: string
  iconColor: string
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-slate-300 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <TrendingUp className="w-4 h-4 text-emerald-500" />
      </div>
      <p className="text-2xl font-extrabold text-slate-900 mb-1">{value}</p>
      <p className="text-sm font-semibold text-slate-700 mb-0.5">{label}</p>
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
  )
}
