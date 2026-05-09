"use client";

import { useEffect, useState , Suspense } from "react";
import { Save, Loader2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

type CertificateForm = {
  certificate_title: string;
  certificate_subtitle: string;
  certificate_desc: string;
  signatory_name: string;
  signatory_title: string;
  verify_url: string;
  show_issue_date: string;
  show_course_name: string;
};

function CertificateSetupPage() {
  const [form, setForm] = useState<CertificateForm>({
    certificate_title: "Certificate of Completion",
    certificate_subtitle: "This is to certify that",
    certificate_desc: "has successfully completed the course",
    signatory_name: "",
    signatory_title: "",
    verify_url: "",
    show_issue_date: "true",
    show_course_name: "true",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch(`${API}/api/system-config?group=certificate`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.certificate) {
          setForm((prev) => ({ ...prev, ...data.certificate }));
        }
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
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
        body: JSON.stringify({ group: "certificate", settings: form }),
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
          Certificate Setup
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure course completion certificate details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Certificate Text */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Certificate Text
          </h2>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Certificate Title
            </label>
            <input
              name="certificate_title"
              value={form.certificate_title}
              onChange={handleChange}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Subtitle
            </label>
            <input
              name="certificate_subtitle"
              value={form.certificate_subtitle}
              onChange={handleChange}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              name="certificate_desc"
              value={form.certificate_desc}
              onChange={handleChange}
              rows={2}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        </div>

        {/* Signatory */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Signatory
          </h2>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Signatory Name
            </label>
            <input
              name="signatory_name"
              value={form.signatory_name}
              onChange={handleChange}
              placeholder="e.g. John Smith"
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Signatory Title
            </label>
            <input
              name="signatory_title"
              value={form.signatory_title}
              onChange={handleChange}
              placeholder="e.g. CEO, NeoNexor"
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Verification */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Verification
          </h2>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Verify URL
            </label>
            <input
              name="verify_url"
              value={form.verify_url}
              onChange={handleChange}
              placeholder="https://yourdomain.com/verify"
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Display Options */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Display Options
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">
                Show Issue Date
              </p>
              <p className="text-xs text-slate-400">
                Display date on certificate
              </p>
            </div>
            <select
              name="show_issue_date"
              value={form.show_issue_date}
              onChange={handleChange}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">
                Show Course Name
              </p>
              <p className="text-xs text-slate-400">
                Display course name on certificate
              </p>
            </div>
            <select
              name="show_course_name"
              value={form.show_course_name}
              onChange={handleChange}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
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

export default function Page() {
  return (
    <Suspense>
      <CertificateSetupPage />
    </Suspense>
  )
}
