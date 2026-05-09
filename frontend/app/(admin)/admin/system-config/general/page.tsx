"use client";

import { useEffect, useState , Suspense } from "react";
import { Save, Loader2 } from "lucide-react";
import { CURRENCY_LIST, getCurrencyByCode } from "@/lib/currencyList";

const API = process.env.NEXT_PUBLIC_API_URL;

type GeneralForm = {
  site_name: string;
  site_email: string;
  site_phone: string;
  site_address: string;
  timezone: string;
  date_format: string;
  currency: string;
  currency_symbol: string;
};

const TIMEZONES = [
  "UTC",
  "Asia/Dhaka",
  "Asia/Kolkata",
  "America/New_York",
  "Europe/London",
];
const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];

function GeneralSettingsPage() {
  const [form, setForm] = useState<GeneralForm>({
    site_name: "",
    site_email: "",
    site_phone: "",
    site_address: "",
    timezone: "UTC",
    date_format: "DD/MM/YYYY",
    currency: "BDT",
    currency_symbol: "৳",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch(`${API}/api/system-config?group=general`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.general) {
          setForm((prev) => ({ ...prev, ...data.general }));
        }
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

 function handleChange(
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API}/api/system-config`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ group: "general", settings: form }),
      });
      const data = await res.json();
      setMessage(data.success ? "✓ Settings saved!" : "✗ Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800">
          General Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Basic site information and regional settings
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Site Information
          </h2>
          <div>
            <label className="text-sm font-medium text-slate-700">Site Name</label>
            <input
              name="site_name"
              value={form.site_name}
              onChange={handleChange}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Contact Email</label>
            <input
              name="site_email"
              type="email"
              value={form.site_email}
              onChange={handleChange}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Phone Number</label>
            <input
              name="site_phone"
              value={form.site_phone}
              onChange={handleChange}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Address</label>
            <textarea
              name="site_address"
              value={form.site_address}
              onChange={handleChange}
              rows={2}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Regional
          </h2>
          <div>
            <label className="text-sm font-medium text-slate-700">Timezone</label>
            <select
              name="timezone"
              value={form.timezone}
              onChange={handleChange}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz}>{tz}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Date Format</label>
            <select
              name="date_format"
              value={form.date_format}
              onChange={handleChange}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {DATE_FORMATS.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700">Currency</label>
              <select
                name="currency"
                value={form.currency}
                onChange={(e) => {
                  const selected = getCurrencyByCode(e.target.value);
                  setForm((prev) => ({
                    ...prev,
                    currency: selected.code,
                    currency_symbol: selected.symbol,
                  }));
                }}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CURRENCY_LIST.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-32">
              <label className="text-sm font-medium text-slate-700">Symbol (Auto)</label>
              <div className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-700 text-center font-medium">
                {form.currency_symbol}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
          {message && <span className="text-sm text-slate-600">{message}</span>}
        </div>
      </form>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <GeneralSettingsPage />
    </Suspense>
  )
}
