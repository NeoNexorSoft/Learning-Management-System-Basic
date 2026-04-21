import type { LucideIcon } from "lucide-react"

export default function StatusBadge({
  label,
  bg,
  text,
  icon: Icon,
}: {
  label: string
  bg: string
  text: string
  icon?: LucideIcon
}) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${bg} ${text}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </span>
  )
}
