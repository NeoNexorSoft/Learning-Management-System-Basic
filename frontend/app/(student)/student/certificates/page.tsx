"use client"

import { useEffect, useState } from "react"
import { Award, ExternalLink, Loader2, Download } from "lucide-react"

import api from "@/lib/axios"

interface Certificate {
  id: string
  certificate_code: string
  issued_at: string
  course: {
    id: string
    title: string
    slug: string
    thumbnail?: string | null
  }
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    api.get("/api/certificates/my")
      .then(({ data }) => setCertificates(data.data?.certificates ?? data.data ?? []))
      .catch(() => setCertificates([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col flex-1">

        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1">

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900">My Certificates</h1>
          <p className="text-slate-500 mt-1">
            {certificates.length} certificate{certificates.length !== 1 ? "s" : ""} earned
          </p>
        </div>

        {certificates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
              <Award className="w-8 h-8 text-indigo-400" />
            </div>
            <p className="text-slate-700 font-semibold mb-1">No certificates yet</p>
            <p className="text-slate-400 text-sm">Complete a course to earn your first certificate.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {certificates.map((cert) => (
              <div key={cert.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all">
                {cert.course.thumbnail ? (
                  <img src={cert.course.thumbnail} alt={cert.course.title} className="w-full h-32 object-cover" />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center">
                    <Award className="w-12 h-12 text-white/80" />
                  </div>
                )}

                <div className="p-5">
                  <h3 className="font-bold text-slate-900 mb-1 line-clamp-2">{cert.course.title}</h3>

                  <div className="flex items-center gap-1.5 mb-4">
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                      Certificate of Completion
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 mb-4 space-y-1">
                    <p>
                      <span className="font-semibold text-slate-700">Issued:</span>{" "}
                      {new Date(cert.issued_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-700">Code:</span>{" "}
                      <span className="font-mono">{cert.certificate_code}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <a
                      href={`/certificates/verify/${cert.certificate_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Verify
                    </a>
                    <button
                      onClick={() => {
                        const text = `Certificate of Completion\nCourse: ${cert.course.title}\nCode: ${cert.certificate_code}\nIssued: ${new Date(cert.issued_at).toLocaleDateString()}`
                        const blob = new Blob([text], { type: "text/plain" })
                        const url  = URL.createObjectURL(blob)
                        const a    = document.createElement("a")
                        a.href = url; a.download = `certificate-${cert.certificate_code}.txt`; a.click()
                        URL.revokeObjectURL(url)
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
