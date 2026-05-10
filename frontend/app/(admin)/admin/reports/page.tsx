"use client";

import { useMemo, useState, Suspense } from "react";
import { Eye } from "lucide-react";
import type { ReportRow } from "@/types/admin";
import DataTable, { Column } from "@/components/admin/DataTable";
import Pagination from "@/components/admin/Pagination";
import SearchInput from "@/components/admin/SearchInput";
import Badge from "@/components/admin/Badge";

const DUMMY_REPORTS: ReportRow[] = [
  {
    id: "RPT-1001",
    user: { name: "Sarah Ahmed", email: "sarah.ahmed@example.com" },
    type: "CONTENT",
    date: "2026-04-21T10:30:00Z",
    status: "OPEN",
  },
  {
    id: "RPT-1002",
    user: { name: "Rakib Hasan", email: "rakib.hasan@example.com" },
    type: "USER",
    date: "2026-04-21T14:15:00Z",
    status: "IN_REVIEW",
  },
  {
    id: "RPT-1003",
    user: { name: "Nusrat Jahan", email: "nusrat.jahan@example.com" },
    type: "PAYMENT",
    date: "2026-04-20T08:45:00Z",
    status: "RESOLVED",
  },
  {
    id: "RPT-1004",
    user: { name: "Tanvir Hossain", email: "tanvir.hossain@example.com" },
    type: "COURSE",
    date: "2026-04-20T12:10:00Z",
    status: "REJECTED",
  },
  {
    id: "RPT-1005",
    user: { name: "Maliha Rahman", email: "maliha.rahman@example.com" },
    type: "CONTENT",
    date: "2026-04-19T16:40:00Z",
    status: "OPEN",
  },
  {
    id: "RPT-1006",
    user: { name: "Arif Chowdhury", email: "arif.chowdhury@example.com" },
    type: "OTHER",
    date: "2026-04-19T09:20:00Z",
    status: "IN_REVIEW",
  },
  {
    id: "RPT-1007",
    user: { name: "Farzana Kabir", email: "farzana.kabir@example.com" },
    type: "USER",
    date: "2026-04-18T11:05:00Z",
    status: "RESOLVED",
  },
  {
    id: "RPT-1008",
    user: { name: "Sabbir Islam", email: "sabbir.islam@example.com" },
    type: "COURSE",
    date: "2026-04-18T15:50:00Z",
    status: "OPEN",
  },
  {
    id: "RPT-1009",
    user: { name: "Jannatul Ferdous", email: "jannatul.ferdous@example.com" },
    type: "PAYMENT",
    date: "2026-04-17T13:25:00Z",
    status: "REJECTED",
  },
  {
    id: "RPT-1010",
    user: { name: "Nayeem Akter", email: "nayeem.akter@example.com" },
    type: "CONTENT",
    date: "2026-04-17T17:30:00Z",
    status: "IN_REVIEW",
  },
  {
    id: "RPT-1011",
    user: { name: "Shaila Noor", email: "shaila.noor@example.com" },
    type: "OTHER",
    date: "2026-04-16T10:00:00Z",
    status: "OPEN",
  },
  {
    id: "RPT-1012",
    user: { name: "Imran Sarker", email: "imran.sarker@example.com" },
    type: "USER",
    date: "2026-04-16T18:12:00Z",
    status: "RESOLVED",
  },
  {
    id: "RPT-1013",
    user: { name: "Mim Tasnim", email: "mim.tasnim@example.com" },
    type: "COURSE",
    date: "2026-04-15T09:48:00Z",
    status: "OPEN",
  },
  {
    id: "RPT-1014",
    user: { name: "Ahsan Habib", email: "ahsan.habib@example.com" },
    type: "PAYMENT",
    date: "2026-04-15T14:32:00Z",
    status: "IN_REVIEW",
  },
  {
    id: "RPT-1015",
    user: { name: "Nabila Karim", email: "nabila.karim@example.com" },
    type: "CONTENT",
    date: "2026-04-14T12:18:00Z",
    status: "RESOLVED",
  },
  {
    id: "RPT-1016",
    user: { name: "Shakib Raihan", email: "shakib.raihan@example.com" },
    type: "OTHER",
    date: "2026-04-14T19:40:00Z",
    status: "REJECTED",
  },
  {
    id: "RPT-1017",
    user: { name: "Tania Sultana", email: "tania.sultana@example.com" },
    type: "USER",
    date: "2026-04-13T08:22:00Z",
    status: "OPEN",
  },
  {
    id: "RPT-1018",
    user: { name: "Mahmudul Hasan", email: "mahmudul.hasan@example.com" },
    type: "COURSE",
    date: "2026-04-13T16:05:00Z",
    status: "IN_REVIEW",
  },
];

const PAGE_SIZE = 8;
const STATUS_OPTIONS: Array<ReportRow["status"] | "ALL"> = [
  "ALL",
  "OPEN",
  "IN_REVIEW",
  "RESOLVED",
  "REJECTED",
];
const TYPE_OPTIONS: Array<ReportRow["type"] | "ALL"> = [
  "ALL",
  "USER",
  "COURSE",
  "CONTENT",
  "PAYMENT",
  "OTHER",
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function AdminReportsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_OPTIONS)[number]>("ALL");
  const [typeFilter, setTypeFilter] =
    useState<(typeof TYPE_OPTIONS)[number]>("ALL");
  const [page, setPage] = useState(1);

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return DUMMY_REPORTS.filter((report) => {
      const matchesSearch =
        !query ||
        [
          report.id,
          report.user.name,
          report.user.email,
          report.type,
          report.status,
        ].some((value) => value.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "ALL" || report.status === statusFilter;
      const matchesType = typeFilter === "ALL" || report.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [search, statusFilter, typeFilter]);

  const total = filteredReports.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const columns: Column<ReportRow>[] = [
    {
      header: "Report ID",
      className: "min-w-[120px]",
      render: (report) => (
        <span className="font-mono text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
          {report.id}
        </span>
      ),
    },
    {
      header: "User",
      className: "min-w-[220px]",
      render: (report) => (
        <div>
          <p className="font-semibold text-slate-800 text-sm">
            {report.user.name}
          </p>
          <p className="text-xs text-slate-400 break-all">
            {report.user.email}
          </p>
        </div>
      ),
    },
    {
      header: "Type",
      className: "hidden md:table-cell",
      render: (report) => <Badge label={report.type} />,
    },
    {
      header: "Date",
      className: "hidden lg:table-cell",
      render: (report) => (
        <span className="text-slate-500 text-sm">
          {formatDate(report.date)}
        </span>
      ),
    },
    {
      header: "Status",
      className: "min-w-[120px]",
      render: (report) => <Badge label={report.status.replace("_", " ")} />,
    },
    {
      header: "Action",
      className: "w-[90px]",
      render: () => (
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
          title="View report"
        >
          <Eye className="w-4 h-4" />
          <span className="text-xs font-medium">View</span>
        </button>
      ),
    },
  ];

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusChange(value: (typeof STATUS_OPTIONS)[number]) {
    setStatusFilter(value);
    setPage(1);
  }

  function handleTypeChange(value: (typeof TYPE_OPTIONS)[number]) {
    setTypeFilter(value);
    setPage(1);
  }

  return (
    <main className="flex-1 p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review user-submitted reports across the platform —{" "}
          {total.toLocaleString()} total
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center gap-3">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by report ID, user, type or status…"
            className="w-full xl:max-w-sm"
          />

          <div className="flex flex-col sm:flex-row gap-3 xl:ml-auto w-full xl:w-auto">
            <select
              value={typeFilter}
              onChange={(e) =>
                handleTypeChange(
                  e.target.value as (typeof TYPE_OPTIONS)[number],
                )
              }
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all w-full sm:w-[180px]"
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === "ALL" ? "All Types" : option}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                handleStatusChange(
                  e.target.value as (typeof STATUS_OPTIONS)[number],
                )
              }
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all w-full sm:w-[180px]"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === "ALL" ? "All Status" : option.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={paginatedReports}
          loading={false}
          keyFn={(report) => report.id}
          emptyMessage="No reports found."
        />

        <div className="p-4 border-t border-slate-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-400">
            Showing {paginatedReports.length} of {total} report
            {total !== 1 ? "s" : ""}
          </p>
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onChange={setPage}
          />
        </div>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense>
      <AdminReportsPage />
    </Suspense>
  );
}
