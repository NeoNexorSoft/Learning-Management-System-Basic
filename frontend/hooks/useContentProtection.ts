"use client"

import { useEffect } from "react"

export function useContentProtection() {
  useEffect(() => {
    // 1. Disable right click
    const handleRightClick = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    // 2. Disable keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block: Ctrl+S, Ctrl+U, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, F12, PrintScreen
      if (
        (e.ctrlKey && e.key === "s") ||
        (e.ctrlKey && e.key === "u") ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "J") ||
        (e.ctrlKey && e.shiftKey && e.key === "C") ||
        e.key === "F12" ||
        e.key === "PrintScreen"
      ) {
        e.preventDefault()
        return false
      }
    }

    // 3. Disable text selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault()
      return false
    }

    // 4. Disable drag
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault()
      return false
    }

    // 5. Detect screen recording / visibility change — pause and blur videos when tab is hidden
    const handleVisibilityChange = () => {
      const videos = document.querySelectorAll("video")
      if (document.hidden) {
        videos.forEach(v => {
          v.pause()
          v.style.filter = "blur(10px)"
        })
      } else {
        videos.forEach(v => {
          v.style.filter = "none"
        })
      }
    }

    document.addEventListener("contextmenu", handleRightClick)
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("selectstart", handleSelectStart)
    document.addEventListener("dragstart", handleDragStart)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("contextmenu", handleRightClick)
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("selectstart", handleSelectStart)
      document.removeEventListener("dragstart", handleDragStart)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])
}
