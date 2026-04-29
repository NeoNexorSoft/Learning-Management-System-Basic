"use client"
import { fixCloudinaryUrl, getFileType } from "@/lib/cloudinary"
import { FileIcon, Download } from "lucide-react"

export default function FilePreview({
  url, type = "DOCUMENT", className = ""
}: {
  url: string; type?: string; className?: string
}) {
  if (!url) return null
  const fixedUrl = fixCloudinaryUrl(url, type)
  const fileType = type === "VIDEO" ? "video" : getFileType(url)
  const fileName = url.split("/").pop()?.split("?")[0] ?? "file"

  if (fileType === "video") return (
    <div className={`rounded-xl overflow-hidden bg-black border border-slate-200 ${className}`}>
      <video key={fixedUrl} controls preload="auto" className="w-full max-h-64">
        <source src={fixedUrl} />
        <source src={fixedUrl} type="video/mp4" />
        <source src={fixedUrl} type="video/webm" />
        Your browser does not support this video.
      </video>
    </div>
  )

  if (fileType === "image") return (
    <img src={fixedUrl} alt={fileName}
      className={`w-full max-h-64 object-contain rounded-xl border border-slate-200 ${className}`} />
  )

  if (fileType === "pdf") return (
    <div className={`space-y-1 ${className}`}>
      <iframe
        src={`https://docs.google.com/viewer?url=${encodeURIComponent(fixedUrl)}&embedded=true`}
        className="w-full h-80 rounded-xl border border-slate-200"
      />
      <a href={fixedUrl} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-semibold hover:underline">
        <Download className="w-3.5 h-3.5" /> Open PDF in new tab
      </a>
    </div>
  )

  if (fileType === "office") return (
    <div className={`flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 ${className}`}>
      <FileIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
      <a href={fixedUrl} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-semibold hover:underline flex-shrink-0">
        <Download className="w-3.5 h-3.5" /> Download
      </a>
    </div>
  )

  return null
}
