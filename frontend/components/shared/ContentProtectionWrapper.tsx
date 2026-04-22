"use client"

import { useContentProtection } from "@/hooks/useContentProtection"

export default function ContentProtectionWrapper({ children }: { children: React.ReactNode }) {
  useContentProtection()
  return <>{children}</>
}
