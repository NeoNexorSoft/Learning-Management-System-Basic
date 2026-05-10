"use client"

import { useState, useEffect } from "react"
import api from "@/lib/axios"

interface CourseFilters {
  category?: string
  level?: string
  search?: string
  sort?: string
  limit?: number
  page?: number
}

export function useCourses(filters: CourseFilters = {}) {
  const [courses, setCourses]   = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [pagination, setPagination] = useState<any>(null)

  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.category) params.set("category", filters.category)
    if (filters.level)    params.set("level",    filters.level)
    if (filters.search)   params.set("search",   filters.search)
    if (filters.sort)     params.set("sort",     filters.sort)
    if (filters.limit)    params.set("limit",    String(filters.limit))
    if (filters.page)     params.set("page",     String(filters.page))

    setLoading(true)
    api.get(`/api/courses?${params.toString()}`)
      .then(({ data }) => {
        const result = data.data
        const list = Array.isArray(result) ? result : (result.data ?? [])
        setCourses(list)
        if (!Array.isArray(result)) {
          setPagination({ total: result.total, page: result.page, totalPages: result.totalPages })
        }
        setError(null)
      })
      .catch(() => setError("Failed to load courses"))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, filters.level, filters.search, filters.sort, filters.limit, filters.page])

  return { courses, loading, error, pagination }
}
