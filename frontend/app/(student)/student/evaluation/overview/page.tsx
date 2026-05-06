"use client";
import dynamic from "next/dynamic";

const StudentOverviewClient = dynamic(() => import("./StudentOverviewClient"), { ssr: false });

export default function StudentOverviewPage() {
  return <StudentOverviewClient />;
}
