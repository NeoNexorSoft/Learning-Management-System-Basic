import multer, { FileFilterCallback } from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { Request } from 'express';
import cloudinary from '../config/cloudinary';
import { uploadConfig } from '../config/upload.config';

function makeStorage(folder: string, params: Record<string, unknown>) {
  return new CloudinaryStorage({
    cloudinary,
    params: { folder, ...params } as never,
  });
}

function fileFilter(allowed: string[]) {
  return (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const ext = file.originalname.split('.').pop()?.toLowerCase() ?? '';
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed: ${allowed.join(', ')}`));
    }
  };
}

export const uploadAvatar = multer({
  storage: makeStorage('neonexor/avatars', {
    allowed_formats: uploadConfig.image.allowedFormats,
    transformation: [{ width: 200, height: 200, crop: 'fill', quality: 80 }],
  }),
  limits: { fileSize: uploadConfig.image.maxSizeBytes },
  fileFilter: fileFilter(uploadConfig.image.allowedFormats),
});

export const uploadThumbnail = multer({
  storage: makeStorage('neonexor/thumbnails', {
    allowed_formats: uploadConfig.thumbnail.allowedFormats,
    transformation: [{ width: 1280, height: 720, crop: 'fill', quality: 85 }],
  }),
  limits: { fileSize: uploadConfig.thumbnail.maxSizeBytes },
  fileFilter: fileFilter(uploadConfig.thumbnail.allowedFormats),
});

export const uploadVideo = multer({
  storage: makeStorage('neonexor/videos', {
    resource_type: 'video',
    allowed_formats: uploadConfig.video.allowedFormats,
  }),
  limits: { fileSize: uploadConfig.video.maxSizeBytes },
  fileFilter: fileFilter(uploadConfig.video.allowedFormats),
});

export const uploadDocument = multer({
  storage: makeStorage('neonexor/documents', {
    resource_type: 'raw',
  }),
  limits: { fileSize: uploadConfig.document.maxSizeBytes },
  fileFilter: (_req, _file, cb) => cb(null, true),
});

export const uploadIntroVideo = multer({
  storage: makeStorage('neonexor/intro-videos', {
    resource_type: 'video',
    allowed_formats: uploadConfig.introVideo.allowedFormats,
  }),
  limits: { fileSize: uploadConfig.introVideo.maxSizeBytes },
  fileFilter: fileFilter(uploadConfig.introVideo.allowedFormats),
});

export const uploadLogo = multer({
  storage: makeStorage('neonexor/system', {
    allowed_formats: uploadConfig.image.allowedFormats,
  }),
  limits: { fileSize: uploadConfig.image.maxSizeBytes },
  fileFilter: fileFilter(uploadConfig.image.allowedFormats),
});