"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, Upload, X } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function LogoFaviconPage() {
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [faviconPreview, setFaviconPreview] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch(`${API}/api/system-config?group=appearance`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.appearance) {
          if (data.appearance.logo_url) setLogoPreview(data.appearance.logo_url);
          if (data.appearance.favicon_url) setFaviconPreview(data.appearance.favicon_url);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  function handleFaviconChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFaviconFile(file);
    setFaviconPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const token = localStorage.getItem("admin_token");

      // File upload to get URLs (via existing upload endpoint)
      let logo_url = logoPreview;
      let favicon_url = faviconPreview;

      if (logoFile) {
        const formData = new FormData();
        formData.append("logo", logoFile);
        const uploadRes = await fetch(`${API}/api/upload/logo`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.data?.url) logo_url = uploadData.data.url;
      }

      if (faviconFile) {
        const formData = new FormData();
        formData.append("logo", faviconFile);
        const uploadRes = await fetch(`${API}/api/upload/logo`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.data?.url) favicon_url = uploadData.data.url;
      }

      // Save URLs to system config
      const res = await fetch(`${API}/api/system-config`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          group: "appearance",
          settings: {
            logo_url,
            favicon_url,
          },
        }),
      });
      const data = await res.json();
      setMessage(data.success ? "✓ Saved successfully!" : "✗ Failed to save.");
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
        <h1 className="text-xl font-semibold text-slate-800">Logo & Favicon</h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload your site logo and browser favicon
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Logo Upload */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Site Logo
          </h2>
          <p className="text-xs text-slate-400">
            Recommended size: 200x60px. Supported: JPG, PNG, SVG, WEBP (max 2MB)
          </p>

          {logoPreview ? (
            <div className="relative inline-block">
              <img
                src={logoPreview}
                alt="Logo Preview"
                className="h-16 object-contain border border-slate-200 rounded-lg p-2 bg-slate-50"
              />
              <button
                type="button"
                onClick={() => {
                  setLogoPreview("");
                  setLogoFile(null);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all">
              <Upload className="w-6 h-6 text-slate-400 mb-2" />
              <span className="text-sm text-slate-500">Click to upload logo</span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.svg,.webp"
                onChange={handleLogoChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Favicon Upload */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Favicon
          </h2>
          <p className="text-xs text-slate-400">
            Recommended size: 32x32px or 64x64px. Supported: PNG, ICO (max 1MB)
          </p>

          {faviconPreview ? (
            <div className="relative inline-block">
              <img
                src={faviconPreview}
                alt="Favicon Preview"
                className="h-12 w-12 object-contain border border-slate-200 rounded-lg p-1 bg-slate-50"
              />
              <button
                type="button"
                onClick={() => {
                  setFaviconPreview("");
                  setFaviconFile(null);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all">
              <Upload className="w-6 h-6 text-slate-400 mb-2" />
              <span className="text-xs text-slate-500 text-center">
                Click to upload favicon
              </span>
              <input
                type="file"
                accept=".png,.ico"
                onChange={handleFaviconChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Save */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving || (!logoFile && !faviconFile && !logoPreview && !faviconPreview)}
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