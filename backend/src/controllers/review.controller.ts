import { Request, Response, NextFunction } from 'express';
import { enrollmentService } from '../services/enrollment.service';

export const reviewController = {
  async createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { rating, comment } = req.body;
      if (!rating) {
        res.status(400).json({ status: 'error', message: 'rating is required' });
        return;
      }
      const review = await enrollmentService.createReview(
        req.user!.userId,
        req.params.id as string,
        { rating: Number(rating), comment },
      );
      res.status(201).json({ status: 'success', data: { review } });
    } catch (err) {
      next(err);
    }
  },

  async getCourseReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page  = req.query.page  as string | undefined;
      const limit = req.query.limit as string | undefined;

      const result = await enrollmentService.getCourseReviews(
        req.params.id as string,
        {
          page:  page  ? parseInt(page, 10)  : 1,
          limit: limit ? Math.min(parseInt(limit, 10), 100) : 20,
        },
      );
      res.json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },
};
