"use client";

import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

type SeoForm = {
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_title: string;
  og_description: string;
  og_image: string;
  google_analytics_id: string;
  google_search_console: string;
};

export default function SeoSettingsPage() {
  const [form, setForm] = useState<SeoForm>({
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    og_title: "",
    og_description: "",
    og_image: "",
    google_analytics_id: "",
    google_search_console: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const token = localStorage.getItem("admin_token");
        // ✅ FIX 1: নতুন endpoint
        const res = await fetch(`${API}/api/system-config?group=seo`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        // ✅ FIX 2: data.success + data.data → data.seo
        if (data.seo) {
          setForm((prev) => ({ ...prev, ...data.seo }));
        }
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
        body: JSON.stringify({ group: "seo", settings: form }),
      });
      const data = await res.json();
      setMessage(data.seo ? "✓ Settings saved!" : "✗ Failed to save.");
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
          SEO Configuration
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Meta title, description and keywords for search engines
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Meta Tags */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Meta Tags
          </h2>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Meta Title
            </label>
            <input
              name="meta_title"
              value={form.meta_title}
              onChange={handleChange}
              placeholder="My Awesome LMS"
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-slate-400 mt-1">
              Recommended: 50–60 characters
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Meta Description
            </label>
            <textarea
              name="meta_description"
              value={form.meta_description}
              onChange={handleChange}
              rows={3}
              placeholder="A brief description of your site for search engines..."
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            <p className="text-xs text-slate-400 mt-1">
              Recommended: 150–160 characters
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Meta Keywords
            </label>
            <input
              name="meta_keywords"
              value={form.meta_keywords}
              onChange={handleChange}
              placeholder="online courses, learning, education"
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-slate-400 mt-1">
              Comma-separated keywords
            </p>
          </div>
        </div>

        {/* Open Graph */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Open Graph (Social Sharing)
          </h2>
          <div>
            <label className="text-sm font-medium text-slate-700">
              OG Title
            </label>
            <input
              name="og_title"
              value={form.og_title}
              onChange={handleChange}
              placeholder="Title shown when shared on social media"
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              OG Description
            </label>
            <textarea
              name="og_description"
              value={form.og_description}
              onChange={handleChange}
              rows={2}
              placeholder="Description shown when shared on social media"
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              OG Image URL
            </label>
            <input
              name="og_image"
              value={form.og_image}
              onChange={handleChange}
              placeholder="https://yoursite.com/og-image.jpg"
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-slate-400 mt-1">
              Recommended size: 1200×630px
            </p>
          </div>
        </div>

        {/* Analytics */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Analytics & Verification
          </h2>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Google Analytics ID
            </label>
            <input
              name="google_analytics_id"
              value={form.google_analytics_id}
              onChange={handleChange}
              placeholder="G-XXXXXXXXXX"
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Google Search Console Verification
            </label>
            <input
              name="google_search_console"
              value={form.google_search_console}
              onChange={handleChange}
              placeholder="Verification meta tag content"
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
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