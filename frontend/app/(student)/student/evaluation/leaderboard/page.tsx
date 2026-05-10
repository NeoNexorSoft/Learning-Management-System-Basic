"use client";
import dynamic from "next/dynamic";

const StudentLeaderboardClient = dynamic(() => import("./LeaderboardClient"), { ssr: false });

export default function StudentLeaderboardPage() {
  return <StudentLeaderboardClient />;
}
