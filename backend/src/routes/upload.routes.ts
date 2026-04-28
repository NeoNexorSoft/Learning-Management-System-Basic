import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import {
  uploadAvatar as uploadAvatarStorage,
  uploadThumbnail as uploadThumbnailStorage,
  uploadVideo as uploadVideoStorage,
  uploadDocument as uploadDocumentStorage,
  uploadLogo as uploadLogoStorage,
  uploadIntroVideo as uploadIntroVideoStorage,
} from '../middlewares/upload.middleware';
import * as uploadController from '../controllers/upload.controller';

const router = Router();

function handleMulterError(upload: ReturnType<typeof multer>) {
  return (field: string) =>
      (req: Request, res: Response, next: NextFunction) => {
        upload.single(field)(req, res, (err) => {
          if (!err) return next();
          if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ status: 'error', message: 'File too large' });
          }
          if (err instanceof Error) {
            return res.status(400).json({ status: 'error', message: err.message });
          }
          next(err);
        });
      };
}

const avatar     = handleMulterError(uploadAvatarStorage)('avatar');
const thumbnail  = handleMulterError(uploadThumbnailStorage)('thumbnail');
const video      = handleMulterError(uploadVideoStorage)('video');
const introVideo = handleMulterError(uploadIntroVideoStorage)('intro_video');
const document   = handleMulterError(uploadDocumentStorage)('document');
const logo       = handleMulterError(uploadLogoStorage)('logo');

router.get('/config',                                                          uploadController.getUploadConfig);
router.post('/avatar',      authenticate,                         avatar,      uploadController.uploadAvatar);
router.post('/thumbnail',   authenticate, requireRole('TEACHER'), thumbnail,   uploadController.uploadThumbnail);
router.post('/video',       authenticate, requireRole('TEACHER'), video,       uploadController.uploadVideo);
router.post('/intro-video', authenticate, requireRole('TEACHER'), introVideo,  uploadController.uploadIntroVideo);
router.post('/document',    authenticate,                         document,    uploadController.uploadDocument);
router.post('/logo',        authenticate, requireRole('ADMIN'),   logo,        uploadController.uploadLogo);
router.delete('/delete',    authenticate,                                      uploadController.deleteUpload);

export default router;