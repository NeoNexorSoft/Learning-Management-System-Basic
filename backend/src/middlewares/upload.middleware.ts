import multer, { FileFilterCallback } from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { Request } from 'express';
import cloudinary from '../config/cloudinary';

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
      cb(new Error(`Invalid file type. Allowed types: ${allowed.join(', ')}`));
    }
  };
}

export const uploadAvatar = multer({
  storage: makeStorage('neonexor/avatars', {
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 200, height: 200, crop: 'fill', quality: 80 }],
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: fileFilter(['jpg', 'jpeg', 'png', 'webp']),
});

export const uploadThumbnail = multer({
  storage: makeStorage('neonexor/thumbnails', {
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1280, height: 720, crop: 'fill', quality: 85 }],
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter(['jpg', 'jpeg', 'png', 'webp']),
});

export const uploadVideo = multer({
  storage: makeStorage('neonexor/videos', {
    resource_type: 'video',
    allowed_formats: ['mp4', 'mkv', 'webm'],
  }),
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: fileFilter(['mp4', 'mkv', 'webm']),
});

export const uploadDocument = multer({
  storage: makeStorage('neonexor/documents', {
    resource_type: 'raw',
    allowed_formats: ['pdf', 'doc', 'docx', 'zip'],
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: fileFilter(['pdf', 'doc', 'docx', 'zip']),
});

export const uploadLogo = multer({
  storage: makeStorage('neonexor/system', {
    allowed_formats: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: fileFilter(['jpg', 'jpeg', 'png', 'svg', 'webp']),
});
