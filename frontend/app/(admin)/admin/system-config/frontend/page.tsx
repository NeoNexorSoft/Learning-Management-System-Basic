"use client";

import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

type FrontendForm = {
  hero_title: string;
  hero_subtitle: string;
  hero_banner_url: string;
  show_hero_banner: string;
  featured_courses_enabled: string;
  featured_courses_limit: string;
  show_testimonials: string;
  show_stats: string;
  total_students_count: string;
  total_courses_count: string;
  total_instructors_count: string;
  footer_text: string;
  announcement_bar_enabled: string;
  announcement_bar_text: string;
  announcement_bar_color: string;
};

export default function FrontendManagementPage() {
  const [form, setForm] = useState<FrontendForm>({
    hero_title: "",
    hero_subtitle: "",
    hero_banner_url: "",
    show_hero_banner: "true",
    featured_courses_enabled: "true",
    featured_courses_limit: "6",
    show_testimonials: "true",
    show_stats: "true",
    total_students_count: "",
    total_courses_count: "",
    total_instructors_count: "",
    footer_text: "",
    announcement_bar_enabled: "false",
    announcement_bar_text: "",
    announcement_bar_color: "#6366f1",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const token = localStorage.getItem("admin_token");
        // ✅ FIX 1: নতুন endpoint
        const res = await fetch(`${API}/api/system-config?group=frontend`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        // ✅ FIX 2: data.success + data.data → data.frontend
        if (data.frontend) {
          setForm((prev) => ({ ...prev, ...data.frontend }));
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
      // ✅ FIX 3: PUT → PATCH, নতুন endpoint
      const res = await fetch(`${API}/api/system-config`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ group: "frontend", settings: form }),
      });
      const data = await res.json();
      setMessage(data.frontend ? "✓ Settings saved!" : "✗ Failed to save.");
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
          Frontend Management
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Control homepage content, banners and layout
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Announcement Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Announcement Bar
            </h2>
            <select
              name="announcement_bar_enabled"
              value={form.announcement_bar_enabled}
              onChange={handleChange}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>

          {form.announcement_bar_enabled === "true" && (
            <>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Announcement Text
                </label>
                <input
                  name="announcement_bar_text"
                  value={form.announcement_bar_text}
                  onChange={handleChange}
                  placeholder="🎉 New courses available! Enroll now."
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Bar Color
                </label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="color"
                    name="announcement_bar_color"
                    value={form.announcement_bar_color}
                    onChange={handleChange}
                    className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer"
                  />
                  <input
                    name="announcement_bar_color"
                    value={form.announcement_bar_color}
                    onChange={handleChange}
                    placeholder="#6366f1"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Hero Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Hero Banner
            </h2>
            <select
              name="show_hero_banner"
              value={form.show_hero_banner}
              onChange={handleChange}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>

          {form.show_hero_banner === "true" && (
            <>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Hero Title
                </label>
                <input
                  name="hero_title"
                  value={form.hero_title}
                  onChange={handleChange}
                  placeholder="Learn Without Limits"
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Hero Subtitle
                </label>
                <textarea
                  name="hero_subtitle"
                  value={form.hero_subtitle}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Start, switch, or advance your career with courses from world-class instructors."
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Banner Image URL
                </label>
                <input
                  name="hero_banner_url"
                  value={form.hero_banner_url}
                  onChange={handleChange}
                  placeholder="https://yoursite.com/banner.jpg"
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </>
          )}
        </div>

        {/* Featured Courses */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Featured Courses
            </h2>
            <select
              name="featured_courses_enabled"
              value={form.featured_courses_enabled}
              onChange={handleChange}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>

          {form.featured_courses_enabled === "true" && (
            <div>
              <label className="text-sm font-medium text-slate-700">
                Number of Courses to Show
              </label>
              <input
                name="featured_courses_limit"
                type="number"
                min={1}
                max={24}
                value={form.featured_courses_limit}
                onChange={handleChange}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Stats Section
            </h2>
            <select
              name="show_stats"
              value={form.show_stats}
              onChange={handleChange}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>

          {form.show_stats === "true" && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Total Students
                </label>
                <input
                  name="total_students_count"
                  value={form.total_students_count}
                  onChange={handleChange}
                  placeholder="10,000+"
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Total Courses
                </label>
                <input
                  name="total_courses_count"
                  value={form.total_courses_count}
                  onChange={handleChange}
                  placeholder="500+"
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Instructors
                </label>
                <input
                  name="total_instructors_count"
                  value={form.total_instructors_count}
                  onChange={handleChange}
                  placeholder="200+"
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Testimonials */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Testimonials Section
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Show student reviews on the homepage
              </p>
            </div>
            <select
              name="show_testimonials"
              value={form.show_testimonials}
              onChange={handleChange}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Footer
          </h2>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Footer Text
            </label>
            <input
              name="footer_text"
              value={form.footer_text}
              onChange={handleChange}
              placeholder="© 2025 NeoNexor. All rights reserved."
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
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