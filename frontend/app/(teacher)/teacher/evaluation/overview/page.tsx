"use client";
import dynamic from "next/dynamic";

const TeacherOverviewClient = dynamic(() => import("./TeacherOverviewClient"), { ssr: false });

export default function TeacherOverviewPage() {
  return <TeacherOverviewClient />;
}
