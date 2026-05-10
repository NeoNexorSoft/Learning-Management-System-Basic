import type { ReactNode } from "react"

export interface Column<T> {
  header: string
  className?: string
  render: (row: T) => ReactNode
}

export default function DataTable<T>({
  columns,
  data,
  loading,
  emptyMessage = "No records found.",
  keyFn,
}: {
  columns: Column<T>[]
  data: T[]
  loading: boolean
  emptyMessage?: string
  keyFn: (row: T) => string
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            {columns.map((col, i) => (
              <th
                key={i}
                className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50 first:rounded-tl-xl last:rounded-tr-xl ${col.className ?? ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map((_, j) => (
                  <td key={j} className="px-4 py-3">
                    <div className="h-4 bg-slate-100 rounded-lg animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400 text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={keyFn(row)} className="hover:bg-slate-50/50 transition-colors">
                {columns.map((col, i) => (
                  <td key={i} className={`px-4 py-3 text-slate-700 ${col.className ?? ""}`}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
