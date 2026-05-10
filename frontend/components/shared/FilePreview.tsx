"use client"
import { fixCloudinaryUrl, getFileType } from "@/lib/cloudinary"
import { FileIcon, Download } from "lucide-react"
import SecureVideoPlayer from "../ui/SecureVideoPlayer";
import SecurePDFViewer from "../ui/SecurePDFViewer";

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
      <SecureVideoPlayer url={fixedUrl} allowFullscreen={true} />
    </div>
  )

  if (type === "DOCUMENT" || fileType === "pdf") return (
    <div className={`rounded-xl overflow-hidden bg-black border border-slate-200 ${className}`}>
      <SecurePDFViewer
        url={fixedUrl}
        allowFullscreen
      />
    </div>
  )

  if (fileType === "image") return (
    <img src={fixedUrl} alt={fileName}
      className={`w-full max-h-64 object-contain rounded-xl border border-slate-200 ${className}`} />
  )

  return null
}
