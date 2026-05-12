"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import api from "@/lib/axios"

interface Category {
    id: string
    name: string
    children: { id: string; name: string }[]
}

interface CourseFilterProps {
    onFilter: (params: {
        categoryId: string
        subcategoryId: string
        sort: string
    }) => void
}

export default function CourseFilter({ onFilter }: CourseFilterProps) {
    const router       = useRouter()
    const searchParams = useSearchParams()

    const onFilterRef = useRef(onFilter)
    useEffect(() => { onFilterRef.current = onFilter }, [onFilter])

    const [categories,        setCategories]        = useState<Category[]>([])
    const [loadingCategories, setLoadingCategories] = useState(true)

    // Single source of truth — plain state, no refs
    const [categoryId,       setCategoryId]       = useState(searchParams.get("categoryId")    ?? "")
    const [subcategoryId,    setSubcategoryId]    = useState(searchParams.get("subcategoryId") ?? "")
    const [sort,             setSort]             = useState(searchParams.get("sort")          ?? "oldest")
    // selectedCategory stored directly — updated in the same handler, same render cycle
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

    useEffect(() => {
        api.get("/api/categories")
            .then((res) => {
                const cats: Category[] = res.data.data.categories ?? []
                setCategories(cats)
                // If page loaded with a categoryId in the URL, pre-select the category
                const initial = searchParams.get("categoryId")
                if (initial) {
                    setSelectedCategory(cats.find((c) => c.id === initial) ?? null)
                }
            })
            .catch(() => {})
            .finally(() => setLoadingCategories(false))
    }, [])

    function pushParams(next: { categoryId: string; subcategoryId: string; sort: string }) {
        const params = new URLSearchParams(searchParams.toString())
        if (next.categoryId)    params.set("categoryId",    next.categoryId)
        else                    params.delete("categoryId")
        if (next.subcategoryId) params.set("subcategoryId", next.subcategoryId)
        else                    params.delete("subcategoryId")
        params.set("sort", next.sort)
        router.replace(`?${params.toString()}`, { scroll: false })
        onFilterRef.current(next)
    }

    function handleCategoryChange(value: string) {
        // Find the category object immediately from current categories list
        const found = categories.find((c) => c.id === value) ?? null
        // Update all state together — React 18 batches these into one render
        setCategoryId(value)
        setSubcategoryId("")
        setSelectedCategory(found)   // subcategory list updates THIS render, not next
        pushParams({ categoryId: value, subcategoryId: "", sort })
    }

    function handleSubcategoryChange(value: string) {
        setSubcategoryId(value)
        pushParams({ categoryId, subcategoryId: value, sort })
    }

    function handleSortChange(value: string) {
        setSort(value)
        pushParams({ categoryId, subcategoryId, sort: value })
    }

    const selectClass =
        "px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 " +
        "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"

    return (
        <div className="flex flex-wrap gap-3">
            <select
                value={categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className={`${selectClass} min-w-[180px]`}
            >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>

            <select
                value={subcategoryId}
                onChange={(e) => handleSubcategoryChange(e.target.value)}
                disabled={!categoryId || loadingCategories}
                className={`${selectClass} min-w-[180px] disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                <option value="">All Subcategories</option>
                {(selectedCategory?.children ?? []).map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
            </select>

            <select
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className={`${selectClass} min-w-[160px]`}
            >
                <option value="oldest">Oldest First</option>
                <option value="newest">Newest First</option>
            </select>
        </div>
    )
}