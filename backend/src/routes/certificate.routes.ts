import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { certificateController } from '../controllers/certificate.controller';

export const certificateRouter = Router();

// Static path first to avoid collision with /:code
certificateRouter.get('/my', authenticate, requireRole('STUDENT'), certificateController.getMyCertificates);

// Public — verify by code
certificateRouter.get('/verify/:code', certificateController.verifyCertificate);
