"use client";

import dynamic from "next/dynamic";

const TeacherRoutineTracker = dynamic(
  () => import("@/components/evaluation/routine-tracker/TeacherRoutineTracker"),
  { ssr: false },
);

export default function TeacherRoutineTrackerPage() {
  return <TeacherRoutineTracker />;
}
