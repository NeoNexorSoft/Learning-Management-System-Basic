import { Request, Response, NextFunction } from 'express';
import { certificateService } from '../services/certificate.service';

export const certificateController = {
  async getMyCertificates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const certificates = await certificateService.getMyCertificates(req.user!.userId);
      res.json({ status: 'success', data: { certificates } });
    } catch (err) {
      next(err);
    }
  },

  async verifyCertificate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const certificate = await certificateService.verifyCertificate(req.params.code as string);
      res.json({ status: 'success', data: { certificate } });
    } catch (err) {
      next(err);
    }
  },
};
