const colorMap: Record<string, string> = {
  APPROVED:   "bg-emerald-100 text-emerald-700",
  ACTIVE:     "bg-emerald-100 text-emerald-700",
  COMPLETED:  "bg-emerald-100 text-emerald-700",
  VERIFIED:   "bg-emerald-100 text-emerald-700",
  PENDING:    "bg-amber-100 text-amber-700",
  DRAFT:      "bg-slate-100 text-slate-600",
  REJECTED:   "bg-red-100 text-red-700",
  FAILED:     "bg-red-100 text-red-700",
  BANNED:     "bg-red-100 text-red-700",
  ADMIN:      "bg-purple-100 text-purple-700",
  TEACHER:    "bg-indigo-100 text-indigo-700",
  STUDENT:    "bg-blue-100 text-blue-700",
  YES:        "bg-emerald-100 text-emerald-700",
  NO:         "bg-slate-100 text-slate-500",
}

export default function Badge({ label }: { label: string }) {
  const key = label.toUpperCase().replace(/\s+/g, "_")
  const color = colorMap[key] ?? "bg-slate-100 text-slate-600"
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>
      {label}
    </span>
  )
}
