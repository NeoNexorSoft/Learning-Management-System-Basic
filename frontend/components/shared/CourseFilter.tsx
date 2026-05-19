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

    const [categories, setCategories] = useState<Category[]>([])

    // These reflect the APPLIED filter (what's actually filtering the results)
    const [categoryId,    setCategoryId]    = useState(searchParams.get("categoryId")    ?? "")
    const [subcategoryId, setSubcategoryId] = useState(searchParams.get("subcategoryId") ?? "")
    const [sort,          setSort]          = useState(searchParams.get("sort")          ?? "oldest")

    // Dropdown state — separate from filter state
    const [openDropdown, setOpenDropdown] = useState<string | null>(null)
    const [dropdownPos,  setDropdownPos]  = useState<{ top: number; left: number } | null>(null)

    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        api.get("/api/categories")
            .then((res) => {
                const cats: Category[] = res.data.data.categories ?? []
                setCategories(cats)
            })
            .catch(() => {})
    }, [])

    // Close dropdown when clicking outside
    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            // Check if click is inside the fixed dropdown too
            const dropdown = document.getElementById("course-filter-dropdown")
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node) &&
                (!dropdown || !dropdown.contains(e.target as Node))
            ) {
                setOpenDropdown(null)
                setDropdownPos(null)
            }
        }
        document.addEventListener("mousedown", onClickOutside)
        return () => document.removeEventListener("mousedown", onClickOutside)
    }, [])

    // Close dropdown on scroll
    useEffect(() => {
        if (!openDropdown) return
        function onScroll() {
            setOpenDropdown(null)
            setDropdownPos(null)
        }
        window.addEventListener("scroll", onScroll, true)
        return () => window.removeEventListener("scroll", onScroll, true)
    }, [openDropdown])

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

    // ─── "All" pill ───────────────────────────────────────────────────────────
    function handleAllClick() {
        setCategoryId("")
        setSubcategoryId("")
        setOpenDropdown(null)
        setDropdownPos(null)
        pushParams({ categoryId: "", subcategoryId: "", sort })
    }

    // ─── Category tab click → ONLY open dropdown, NO filter applied ──────────
    function handleCategoryTabClick(cat: Category, btn: HTMLButtonElement) {
        if (openDropdown === cat.id) {
            // Already open → close it
            setOpenDropdown(null)
            setDropdownPos(null)
        } else {
            // Open dropdown positioned below this button
            const rect = btn.getBoundingClientRect()
            setDropdownPos({ top: rect.bottom + 6, left: rect.left })
            setOpenDropdown(cat.id)
        }
        // ⚠️ NO pushParams here — clicking the tab never filters
    }

    // ─── "All [CategoryName]" inside dropdown ────────────────────────────────
    function handleDropdownAllClick(cat: Category) {
        setCategoryId(cat.id)
        setSubcategoryId("")
        setOpenDropdown(null)
        setDropdownPos(null)
        pushParams({ categoryId: cat.id, subcategoryId: "", sort })
    }

    // ─── Subcategory click inside dropdown ───────────────────────────────────
    function handleSubcategoryClick(catId: string, subId: string) {
        setCategoryId(catId)
        setSubcategoryId(subId)
        setOpenDropdown(null)
        setDropdownPos(null)
        pushParams({ categoryId: catId, subcategoryId: subId, sort })
    }

    // ─── Sort change ─────────────────────────────────────────────────────────
    function handleSortChange(value: string) {
        setSort(value)
        pushParams({ categoryId, subcategoryId, sort: value })
    }

    const openCat = openDropdown ? categories.find((c) => c.id === openDropdown) ?? null : null

    return (
        <>
            {/* ── Tab bar ── */}
            <div
                ref={containerRef}
                className="flex items-center justify-between border-b border-slate-200 w-full"
            >
                <div className="flex items-center flex-wrap gap-x-1">

                    {/* All */}
                    <button
                        onClick={handleAllClick}
                        className={`
                            relative px-4 py-3 text-sm whitespace-nowrap transition-colors
                            after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full
                            ${!categoryId
                            ? "text-slate-900 font-semibold after:bg-slate-900"
                            : "text-slate-500 hover:text-slate-700 after:bg-transparent"
                        }
                        `}
                    >
                        All
                    </button>

                    {/* Category tabs — clicking ONLY opens dropdown */}
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={(e) => handleCategoryTabClick(cat, e.currentTarget)}
                            className={`
                                relative px-4 py-3 text-sm whitespace-nowrap transition-colors
                                after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full
                                ${categoryId === cat.id
                                ? "text-slate-900 font-semibold after:bg-slate-900"
                                : "text-slate-500 hover:text-slate-700 after:bg-transparent"
                            }
                            `}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Sort — no arrow */}
                <div className="flex-shrink-0 pl-4 self-center pb-1">
                    <select
                        value={sort}
                        onChange={(e) => handleSortChange(e.target.value)}
                        style={{ appearance: "none", WebkitAppearance: "none", MozAppearance: "none" }}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-600 focus:outline-none cursor-pointer"
                    >
                        <option value="oldest">Oldest First</option>
                        <option value="newest">Newest First</option>
                    </select>
                </div>
            </div>

            {/* ── Dropdown (fixed, escapes overflow) ── */}
            {openCat && dropdownPos && (
                <div
                    id="course-filter-dropdown"
                    style={{
                        position: "fixed",
                        top:      dropdownPos.top,
                        left:     dropdownPos.left,
                        zIndex:   9999,
                    }}
                    className="bg-white border border-slate-200 rounded-xl shadow-lg min-w-[200px] py-1"
                >
                    {/* All [CategoryName] */}
                    <button
                        onClick={() => handleDropdownAllClick(openCat)}
                        className={`
                            w-full text-left px-4 py-2.5 text-sm rounded-t-xl transition-colors hover:bg-slate-50
                            ${categoryId === openCat.id && !subcategoryId
                            ? "text-indigo-600 font-semibold bg-indigo-50"
                            : "text-slate-700"
                        }
                        `}
                    >
                        All
                    </button>

                    {openCat.children.length > 0 && (
                        <div className="border-t border-slate-100 my-1" />
                    )}

                    {/* Subcategories */}
                    {openCat.children.map((sub, i) => (
                        <button
                            key={sub.id}
                            onClick={() => handleSubcategoryClick(openCat.id, sub.id)}
                            className={`
                                w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-slate-50
                                ${i === openCat.children.length - 1 ? "rounded-b-xl" : ""}
                                ${subcategoryId === sub.id && categoryId === openCat.id
                                ? "text-indigo-600 font-semibold bg-indigo-50"
                                : "text-slate-700"
                            }
                            `}
                        >
                            {sub.name}
                        </button>
                    ))}
                </div>
            )}
        </>
    )
}