"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Search } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  user?: {
    name?: string;
    email?: string;
  };
}

export default function NotificationReportsPage() {
  const [data, setData] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  async function fetchData() {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/api/admin/reports/notifications", {
        params: {
          search: debouncedSearch || undefined,
          is_read: status === "all" ? undefined : status,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
          page,
          limit: 10,
        },
      });

      const payload = res.data?.data || {};
      setData(payload.notifications ?? []);
      setTotalPages(payload.pagination?.totalPages ?? 1);
    } catch (err) {
      console.error(err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  // refetch
  useEffect(() => {
    fetchData();
  }, [debouncedSearch, status, dateFrom, dateTo, page]);

  // reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, dateFrom, dateTo]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Notification Reports</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        {/* Search */}
        <div className="flex items-center border rounded-lg px-3 py-2 bg-white">
          <Search className="w-4 h-4 mr-2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user / title..."
            className="outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status */}
        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All</option>
          <option value="true">Read</option>
          <option value="false">Unread</option>
        </select>

        {/* Date range */}
        <input
          type="date"
          className="border rounded-lg px-3 py-2 text-sm"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />

        <input
          type="date"
          className="border rounded-lg px-3 py-2 text-sm"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Title</th>
              <th className="p-3">Message</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">
                  No notifications found
                </td>
              </tr>
            ) : (
              data.map((n) => (
                <tr key={n.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-medium">{n.user?.name || "N/A"}</div>
                    <div className="text-xs text-gray-500">
                      {n.user?.email || ""}
                    </div>
                  </td>

                  <td className="p-3">{n.title}</td>
                  <td className="p-3 line-clamp-2">{n.message}</td>

                  <td className="p-3">
                    {new Date(n.created_at).toLocaleString()}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        n.is_read
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {n.is_read ? "Read" : "Unread"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </button>

        <span className="text-sm">
          Page {page} of {totalPages}
        </span>

        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
