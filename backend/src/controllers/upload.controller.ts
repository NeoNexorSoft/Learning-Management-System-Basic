import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { deleteFile } from '../utils/deleteFile';
import { uploadConfig } from '../config/upload.config';

interface CloudinaryFile extends Express.Multer.File {
  path: string;
  filename: string;
}

function getFile(req: Request): CloudinaryFile {
  if (!req.file) throw Object.assign(new Error('No file uploaded'), { statusCode: 400 });
  return req.file as CloudinaryFile;
}

export async function uploadAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const file   = getFile(req);
    const userId = req.user!.userId;
    const user   = await prisma.user.findUnique({ where: { id: userId }, select: { avatar: true } });

    if (user?.avatar) {
      const segments        = user.avatar.split('/');
      const publicIdWithExt = segments.slice(-2).join('/');
      const publicId        = publicIdWithExt.replace(/\.[^/.]+$/, '');
      await deleteFile(publicId, 'image').catch(() => null);
    }

    await prisma.user.update({ where: { id: userId }, data: { avatar: file.path } });
    res.json({ status: 'success', data: { url: file.path, public_id: file.filename } });
  } catch (err) { next(err); }
}

export async function uploadThumbnail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = getFile(req);
    res.json({ status: 'success', data: { url: file.path, public_id: file.filename } });
  } catch (err) { next(err); }
}

export async function uploadVideo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const file     = getFile(req);
    const duration = (file as any).duration ?? null;
    res.json({ status: 'success', data: { url: file.path, public_id: file.filename, duration } });
  } catch (err) { next(err); }
}

// NEW
export async function uploadIntroVideo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const file     = getFile(req);
    const duration = (file as any).duration ?? null;
    res.json({ status: 'success', data: { url: file.path, public_id: file.filename, duration } });
  } catch (err) { next(err); }
}

export async function uploadDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = getFile(req);
    res.json({ status: 'success', data: { url: file.path, public_id: file.filename } });
  } catch (err) { next(err); }
}

export async function uploadLogo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = getFile(req);
    await prisma.systemSetting.upsert({
      where:  { key: 'logo' },
      update: { value: file.path },
      create: { key: 'logo', value: file.path, group: 'general' },
    });
    res.json({ status: 'success', data: { url: file.path, public_id: file.filename } });
  } catch (err) { next(err); }
}

export function getUploadConfig(_req: Request, res: Response): void {
  res.json({
    status: 'success',
    data: {
      video:      { maxSizeMB: uploadConfig.video.maxSizeMB,      allowedFormats: uploadConfig.video.allowedFormats },
      image:      { maxSizeMB: uploadConfig.image.maxSizeMB,      allowedFormats: uploadConfig.image.allowedFormats },
      document:   { maxSizeMB: uploadConfig.document.maxSizeMB,   allowedFormats: uploadConfig.document.allowedFormats },
      thumbnail:  { maxSizeMB: uploadConfig.thumbnail.maxSizeMB,  allowedFormats: uploadConfig.thumbnail.allowedFormats },
      introVideo: { maxSizeMB: uploadConfig.introVideo.maxSizeMB, allowedFormats: uploadConfig.introVideo.allowedFormats },
    },
  });
}

export async function deleteUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { public_id, resource_type } = req.body as { public_id?: string; resource_type?: string };
    if (!public_id) {
      res.status(400).json({ status: 'error', message: 'public_id is required' });
      return;
    }
    const validTypes = ['image', 'video', 'raw'] as const;
    type RT = typeof validTypes[number];
    const rt: RT = validTypes.includes(resource_type as RT) ? (resource_type as RT) : 'image';
    await deleteFile(public_id, rt);
    res.json({ status: 'success', message: 'Deleted successfully' });
  } catch (err) { next(err); }
}