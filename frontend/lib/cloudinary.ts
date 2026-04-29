export function fixCloudinaryUrl(url: string, type: string): string {
  if (!url || !url.includes("cloudinary.com")) return url
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase() ?? ""
  const videoExts = ["mp4","webm","mkv","avi","mov","flv","wmv","m4v","ogv","3gp"]
  if (type === "VIDEO" || videoExts.includes(ext)) {
    return url
      .replace("/raw/upload/", "/video/upload/")
      .replace("/image/upload/", "/video/upload/")
  }
  if (ext === "pdf") {
    return url
      .replace("/raw/upload/", "/image/upload/fl_attachment:false/")
      .replace("/video/upload/", "/image/upload/fl_attachment:false/")
  }
  return url
}

export function getFileType(url: string): "video" | "image" | "pdf" | "office" | "other" {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase() ?? ""
  if (["mp4","webm","mkv","avi","mov","flv","wmv","m4v","ogv","3gp"].includes(ext)) return "video"
  if (["jpg","jpeg","png","webp","gif","bmp","svg","tiff"].includes(ext))            return "image"
  if (ext === "pdf")                                                                  return "pdf"
  if (["doc","docx","ppt","pptx","xls","xlsx","odt","odp","ods"].includes(ext))     return "office"
  return "other"
}
