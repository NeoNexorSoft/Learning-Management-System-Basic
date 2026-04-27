"use client";

import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

type LanguageForm = {
  default_language: string;
  default_direction: string;
  date_locale: string;
  time_format: string;
  week_starts_on: string;
  number_format: string;
  decimal_separator: string;
  thousands_separator: string;
};

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "bn", label: "বাংলা (Bengali)" },
  { code: "ar", label: "العربية (Arabic)" },
  { code: "fr", label: "Français (French)" },
  { code: "de", label: "Deutsch (German)" },
  { code: "es", label: "Español (Spanish)" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "zh", label: "中文 (Chinese)" },
];

const DATE_LOCALES = [
  "en-US",
  "en-GB",
  "bn-BD",
  "ar-SA",
  "fr-FR",
  "de-DE",
  "es-ES",
  "hi-IN",
  "zh-CN",
];

export default function LanguageSettingsPage() {
  const [form, setForm] = useState<LanguageForm>({
    default_language: "en",
    default_direction: "ltr",
    date_locale: "en-US",
    time_format: "12h",
    week_starts_on: "sunday",
    number_format: "1,000.00",
    decimal_separator: ".",
    thousands_separator: ",",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const token = localStorage.getItem("admin_token");
        // ✅ FIX 1: নতুন endpoint
        const res = await fetch(`${API}/api/system-config?group=language`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        // ✅ FIX 2: data.success + data.data → data.language
        if (data.language) {
          setForm((prev) => ({ ...prev, ...data.language }));
        }
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const token = localStorage.getItem("admin_token");
      // ✅ FIX 3: PUT → PATCH, নতুন endpoint
      const res = await fetch(`${API}/api/system-config`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ group: "language", settings: form }),
      });
      const data = await res.json();
      setMessage(data.language ? "✓ Settings saved!" : "✗ Failed to save.");
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
          Language Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Set site language and configure localization options
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Language & Direction */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Language & Direction
          </h2>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Default Language
            </label>
            <select
              name="default_language"
              value={form.default_language}
              onChange={handleChange}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Text Direction
            </label>
            <select
              name="default_direction"
              value={form.default_direction}
              onChange={handleChange}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ltr">
                LTR — Left to Right (English, Bengali)
              </option>
              <option value="rtl">RTL — Right to Left (Arabic, Urdu)</option>
            </select>
          </div>
        </div>

        {/* Date & Time */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Date & Time
          </h2>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Date Locale
            </label>
            <select
              name="date_locale"
              value={form.date_locale}
              onChange={handleChange}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {DATE_LOCALES.map((locale) => (
                <option key={locale}>{locale}</option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Preview:{" "}
              {new Date().toLocaleDateString(form.date_locale, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Time Format
            </label>
            <select
              name="time_format"
              value={form.time_format}
              onChange={handleChange}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="12h">12-hour (2:30 PM)</option>
              <option value="24h">24-hour (14:30)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Week Starts On
            </label>
            <select
              name="week_starts_on"
              value={form.week_starts_on}
              onChange={handleChange}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="sunday">Sunday</option>
              <option value="monday">Monday</option>
              <option value="saturday">Saturday</option>
            </select>
          </div>
        </div>

        {/* Number Format */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Number Format
          </h2>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Format Style
            </label>
            <select
              name="number_format"
              value={form.number_format}
              onChange={handleChange}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="1,000.00">1,000.00 (English)</option>
              <option value="1.000,00">1.000,00 (European)</option>
              <option value="1 000,00">1 000,00 (French)</option>
            </select>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700">
                Decimal Separator
              </label>
              <input
                name="decimal_separator"
                value={form.decimal_separator}
                onChange={handleChange}
                maxLength={1}
                placeholder="."
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700">
                Thousands Separator
              </label>
              <input
                name="thousands_separator"
                value={form.thousands_separator}
                onChange={handleChange}
                maxLength={1}
                placeholder=","
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Save */}
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