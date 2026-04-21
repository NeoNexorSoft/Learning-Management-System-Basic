// ============================================================
//  BRAND CONFIG — edit this file to change your logo icon
//  Pick any icon name from https://lucide.dev/icons
// ============================================================

import {
  // 🎓 Education
  GraduationCap,
  BookOpen,
  BookMarked,
  Library,
  School,
  // 🚀 Tech / general
  Rocket,
  Zap,
  Globe,
  Layers,
  Star,
  Sparkles,
  // 💡 other popular choices
  Brain,
  Lightbulb,
  Target,
  Award,
  FlameKindling,
} from "lucide-react"

// ✏️  ← Change this line to swap the icon everywhere on the site
export const BrandIcon = GraduationCap

// ✏️  ← Change the brand name here
export const BRAND_NAME = "Neo Nexor"

// ✏️  ← Tailwind bg class for the icon container
export const BRAND_ICON_BG = "bg-indigo-600"

// ✏️  ← Tailwind text color for the icon itself
export const BRAND_ICON_COLOR = "text-white"

// ─────────────────────────────────────────────────────────────
//  Available icons (just copy the name to BrandIcon above):
//
//  Education:   GraduationCap | BookOpen | BookMarked |
//               Library | School
//
//  Tech:        Rocket | Zap | Globe | Layers | Star | Sparkles
//
//  Other:       Brain | Lightbulb | Target | Award | FlameKindling
//
//  Or import any other icon from lucide-react at the top ↑
// ─────────────────────────────────────────────────────────────

// Keeps the unused imports valid so TypeScript won't complain
export const _allIcons = {
  GraduationCap, BookOpen, BookMarked, Library, School,
  Rocket, Zap, Globe, Layers, Star, Sparkles,
  Brain, Lightbulb, Target, Award, FlameKindling,
}
