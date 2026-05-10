"use client";

import { useEffect, useMemo, useState , Suspense } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const DEFAULT_TEMPLATE = `
<div style="width: 900px; min-height: 620px; padding: 56px; border: 12px solid #4f46e5; font-family: Georgia, serif; text-align: center; background: #ffffff;">
  <h1 style="font-size: 42px; color: #1e1b4b; margin-bottom: 8px;">Certificate of Completion</h1>
  <p style="font-size: 18px; color: #64748b;">This certificate is proudly presented to</p>
  <h2 style="font-size: 36px; color: #111827; margin: 28px 0;">{{student_name}}</h2>
  <p style="font-size: 18px; color: #475569;">for successfully completing the course</p>
  <h3 style="font-size: 28px; color: #4338ca; margin: 24px 0;">{{course_name}}</h3>
  <p style="font-size: 16px; color: #475569;">Date: {{date}}</p>
  <p style="font-size: 14px; color: #64748b; margin-top: 36px;">Certificate Code: {{certificate_code}}</p>
</div>
`.trim();

const SAMPLE_DATA = {
  student_name: "John Doe",
  course_name: "Complete React Developer Bootcamp",
  date: "April 24, 2026",
  certificate_code: "CERT-NEON-2026-001",
};

function renderTemplate(template: string) {
  return template
    .replaceAll("{{student_name}}", SAMPLE_DATA.student_name)
    .replaceAll("{{course_name}}", SAMPLE_DATA.course_name)
    .replaceAll("{{date}}", SAMPLE_DATA.date)
    .replaceAll("{{certificate_code}}", SAMPLE_DATA.certificate_code);
}

function CertificateTemplatePage() {
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const previewHtml = useMemo(() => renderTemplate(template), [template]);

  useEffect(() => {
    async function loadTemplate() {
      try {
        const token = localStorage.getItem("admin_token");

        const response = await fetch(
          `${API_BASE_URL}/api/admin/settings?group=certificate`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to load certificate template.");
        }

        const result = await response.json();
        const savedTemplate = result?.data?.certificate_template;

        if (savedTemplate) {
          setTemplate(savedTemplate);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    loadTemplate();
  }, []);

  async function handleSave() {
    setError("");
    setMessage("");

    if (!template.trim()) {
      setError("Certificate template cannot be empty.");
      return;
    }

    const requiredPlaceholders = [
      "{{student_name}}",
      "{{course_name}}",
      "{{date}}",
      "{{certificate_code}}",
    ];

    const missing = requiredPlaceholders.filter(
      (placeholder) => !template.includes(placeholder),
    );

    if (missing.length > 0) {
      setError(`Missing required placeholders: ${missing.join(", ")}`);
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("admin_token");

      const response = await fetch(`${API_BASE_URL}/api/admin/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          group: "certificate",
          settings: {
            certificate_template: template,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save certificate template.");
      }

      setMessage("Certificate template saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex-1 p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Certificate Template
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Design the certificate template used when students complete a course.
        </p>
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">HTML Template Editor</h2>
            <p className="text-xs text-slate-500 mt-1">
              Required placeholders: {"{{student_name}}"}, {"{{course_name}}"},{" "}
              {"{{date}}"}, {"{{certificate_code}}"}
            </p>
          </div>

          <div className="p-4 space-y-4">
            {loading ? (
              <div className="text-sm text-slate-500">Loading template...</div>
            ) : (
              <textarea
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full min-h-[520px] p-4 border border-slate-200 rounded-xl bg-slate-50 font-mono text-sm text-slate-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                spellCheck={false}
              />
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                type="button"
                onClick={() => setTemplate(DEFAULT_TEMPLATE)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Reset Default
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
              >
                {saving ? "Saving..." : "Save Template"}
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Live Preview</h2>
            <p className="text-xs text-slate-500 mt-1">
              Preview uses sample student and course data.
            </p>
          </div>

          <div className="p-4 overflow-auto bg-slate-100">
            <div
              className="origin-top-left scale-[0.55] sm:scale-[0.7] lg:scale-[0.8] 2xl:scale-[0.65]"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense>
      <CertificateTemplatePage />
    </Suspense>
  )
}
