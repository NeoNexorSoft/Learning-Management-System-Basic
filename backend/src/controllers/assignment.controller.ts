import { Request, Response, NextFunction } from 'express';
import { assignmentService } from '../services/assignment.service';
import { prisma } from '../config/db';

export const assignmentController = {

  // ─── Teacher ────────────────────────────────────────────────────────────────

  async createAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.user!.userId;
      const { title, description, file_url, course_id, target, due_date, total_marks } = req.body;
      const assignment = await assignmentService.createAssignment(teacherId, {
        title,
        description,
        file_url,
        course_id,
        target,
        due_date,
        total_marks,
      });
      res.status(201).json({ status: 'success', data: { assignment } });
    } catch (err) {
      next(err);
    }
  },

  async getTeacherAssignments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.user!.userId;
      const assignments = await assignmentService.getTeacherAssignments(teacherId);
      res.json({ status: 'success', data: { assignments } });
    } catch (err) {
      next(err);
    }
  },

  async editTeacherAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.user!.userId;
      const id = req.params.id as string;
      const { title, description, file_url, course_id, target, due_date, total_marks } = req.body;
      const assignment = await prisma.assignment.findFirst({
        where: { id, teacher_id: teacherId, is_deleted: false },
      });
      if (!assignment) {
        res.status(404).json({ status: 'error', message: 'Assignment not found or access denied' });
        return;
      }
      const updated = await assignmentService.editAssignment(id, {
        title, description, file_url, course_id, target, due_date, total_marks,
      });
      res.json({ status: 'success', data: { assignment: updated } });
    } catch (err) {
      next(err);
    }
  },

  async getAssignmentSubmissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.user!.userId;
      const id = req.params.id as string;
      const submissions = await assignmentService.getAssignmentSubmissions(id, teacherId);
      res.json({ status: 'success', data: { submissions } });
    } catch (err) {
      next(err);
    }
  },

  async gradeSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.user!.userId;
      const submissionId = req.params.submissionId as string;
      const { grade, feedback } = req.body;
      const submission = await assignmentService.gradeSubmission(submissionId, teacherId, grade, feedback);
      res.json({ status: 'success', data: { submission } });
    } catch (err) {
      next(err);
    }
  },

  async releaseScores(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.user!.userId;
      const id = req.params.id as string;
      const assignment = await assignmentService.releaseScores(id, teacherId);
      res.json({ status: 'success', data: { assignment } });
    } catch (err) {
      next(err);
    }
  },

  // ─── Admin ───────────────────────────────────────────────────────────────────

  async getAdminAssignments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filter = (req.query.filter as 'all' | 'pending' | 'approved') ?? 'all';
      const assignments = await assignmentService.getAdminAssignments(filter);
      res.json({ status: 'success', data: { assignments } });
    } catch (err) {
      next(err);
    }
  },

  async approveAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const assignment = await assignmentService.approveAssignment(id);
      res.json({ status: 'success', data: { assignment } });
    } catch (err) {
      next(err);
    }
  },

  async rejectAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const assignment = await assignmentService.rejectAssignment(id);
      res.json({ status: 'success', data: { assignment } });
    } catch (err) {
      next(err);
    }
  },

  async editAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { title, description, due_date, total_marks, file_url, target, course_id } = req.body;
      const assignment = await assignmentService.editAssignment(id, {
        title, description, due_date, total_marks, file_url, target, course_id,
      });
      res.json({ status: 'success', data: { assignment } });
    } catch (err) {
      next(err);
    }
  },

  async softDeleteAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      await assignmentService.softDeleteAssignment(id);
      res.json({ status: 'success', data: null });
    } catch (err) {
      next(err);
    }
  },

  // ─── Student ─────────────────────────────────────────────────────────────────

  async getStudentAssignments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.user!.userId;
      const assignments = await assignmentService.getStudentAssignments(studentId);
      res.json({ status: 'success', data: { assignments } });
    } catch (err) {
      next(err);
    }
  },

  async submitAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.user!.userId;
      const id = req.params.id as string;
      const { content, file_url } = req.body;
      const submission = await assignmentService.submitAssignment(studentId, id, content, file_url);
      res.status(201).json({ status: 'success', data: { submission } });
    } catch (err) {
      next(err);
    }
  },

  async deleteSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.user!.userId;
      const id = req.params.id as string;
      await assignmentService.deleteSubmission(studentId, id);
      res.json({ status: 'success', data: null });
    } catch (err) {
      next(err);
    }
  },

  async getStudentScoreHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.user!.userId;
      const scores = await assignmentService.getStudentScoreHistory(studentId);
      res.json({ status: 'success', data: { scores } });
    } catch (err) {
      next(err);
    }
  },

  async getUnreadAssignmentCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.user!.userId;
      const count = await assignmentService.getUnreadAssignmentCount(studentId);
      res.json({ status: 'success', data: { count } });
    } catch (err) {
      next(err);
    }
  },
};