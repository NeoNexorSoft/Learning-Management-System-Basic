export const uploadConfig = {
  video: {
    maxSizeMB:    parseInt(process.env.VIDEO_MAX_SIZE_MB ?? "500"),
    maxSizeBytes: parseInt(process.env.VIDEO_MAX_SIZE_MB ?? "500") * 1024 * 1024,
    allowedFormats: (process.env.VIDEO_ALLOWED_FORMATS ?? "mp4,webm,mkv").split(","),
  },
  image: {
    maxSizeMB:    parseInt(process.env.IMAGE_MAX_SIZE_MB ?? "5"),
    maxSizeBytes: parseInt(process.env.IMAGE_MAX_SIZE_MB ?? "5") * 1024 * 1024,
    allowedFormats: (process.env.IMAGE_ALLOWED_FORMATS ?? "jpg,jpeg,png,webp,gif").split(","),
  },
  document: {
    maxSizeMB:    parseInt(process.env.DOCUMENT_MAX_SIZE_MB ?? "50"),
    maxSizeBytes: parseInt(process.env.DOCUMENT_MAX_SIZE_MB ?? "50") * 1024 * 1024,
    allowedFormats: (process.env.DOCUMENT_ALLOWED_FORMATS ?? "pdf").split(","),
  },
  thumbnail: {
    maxSizeMB:    parseInt(process.env.THUMBNAIL_MAX_SIZE_MB ?? "5"),
    maxSizeBytes: parseInt(process.env.THUMBNAIL_MAX_SIZE_MB ?? "5") * 1024 * 1024,
    allowedFormats: (process.env.THUMBNAIL_ALLOWED_FORMATS ?? "jpg,jpeg,png,webp,gif").split(","),
  },
  introVideo: {
    maxSizeMB:    parseInt(process.env.INTRO_VIDEO_MAX_SIZE_MB ?? "200"),
    maxSizeBytes: parseInt(process.env.INTRO_VIDEO_MAX_SIZE_MB ?? "200") * 1024 * 1024,
    allowedFormats: (process.env.INTRO_VIDEO_ALLOWED_FORMATS ?? "mp4,webm,mkv").split(","),
  },
}
