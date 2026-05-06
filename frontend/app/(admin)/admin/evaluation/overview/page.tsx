"use client";
import dynamic from "next/dynamic";

const AdminOverviewClient = dynamic(() => import("./AdminOverviewClient"), { ssr: false });

export default function AdminOverviewPage() {
  return <AdminOverviewClient />;
}
