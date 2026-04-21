"use client"

import { useState, useEffect } from "react"
import api from "@/lib/axios"

export function useEnrollments() {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)

  useEffect(() => {
    api.get("/api/enrollments/my")
      .then(({ data }) => {
        setEnrollments(data.data.enrollments ?? [])
        setError(null)
      })
      .catch(() => setError("Failed to load enrollments"))
      .finally(() => setLoading(false))
  }, [])

  return { enrollments, loading, error }
}
