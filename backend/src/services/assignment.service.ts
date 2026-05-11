import { AssignmentStatus, AssignmentTarget, SubmissionStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/db';

const err = (msg: string, statusCode: number) =>
  Object.assign(new Error(msg), { statusCode });

export const assignmentService = {

  // ─── Teacher ────────────────────────────────────────────────────────────────

  async createAssignment(
    teacherId: string,
    data: {
      course_id?: string;
      title: string;
      description?: string;
      file_url?: string;
      target?: AssignmentTarget;
      due_date: Date | string;
      total_marks?: number;
    },
  ) {
    const target = data.target ?? AssignmentTarget.COURSE;

    if (target === AssignmentTarget.COURSE && !data.course_id) {
      throw err('course_id is required when target is COURSE', 400);
    }

    if (data.course_id) {
      const course = await prisma.course.findFirst({
        where: { id: data.course_id, teacher_id: teacherId },
      });
      if (!course) throw err('Course not found or not owned by this teacher', 404);
    }

    return prisma.assignment.create({
      data: {
        id:          uuidv4(),
        teacher_id:  teacherId,
        course_id:   data.course_id ?? null,
        title:       data.title,
        description: data.description,
        file_url:    data.file_url,
        target,
        status:      AssignmentStatus.PENDING_APPROVAL,
        due_date:    new Date(data.due_date),
        total_marks: data.total_marks ?? 100,
      },
    });
  },

  async getTeacherAssignments(teacherId: string) {
    const assignments = await prisma.assignment.findMany({
      where:   { teacher_id: teacherId, is_deleted: false },
      include: { course: { select: { title: true } } },
      orderBy: { created_at: 'desc' },
    });

    const counts = await Promise.all(
      assignments.map((a) =>
        prisma.submission.count({
          where: { assignment_id: a.id, deleted_at: null },
        }),
      ),
    );

    return assignments.map((a, i) => ({ ...a, submission_count: counts[i] }));
  },

  // ─── Admin ───────────────────────────────────────────────────────────────────

  async getAdminAssignments(filter: 'all' | 'pending' | 'approved') {
    const statusMap: Record<typeof filter, AssignmentStatus | undefined> = {
      all:      undefined,
      pending:  AssignmentStatus.PENDING_APPROVAL,
      approved: AssignmentStatus.APPROVED,
    };

    return prisma.assignment.findMany({
      where: {
        is_deleted: false,
        ...(statusMap[filter] ? { status: statusMap[filter] } : {}),
      },
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        course:  { select: { id: true, title: true } },
        _count:  { select: { submissions: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  },

  async approveAssignment(assignmentId: string) {
    const assignment = await prisma.assignment.findFirst({
      where: { id: assignmentId, is_deleted: false },
    });
    if (!assignment) throw err('Assignment not found', 404);
    if (assignment.status === AssignmentStatus.APPROVED) {
      throw err('Assignment is already approved', 400);
    }

    return prisma.assignment.update({
      where: { id: assignmentId },
      data:  { status: AssignmentStatus.APPROVED },
    });
  },

  async rejectAssignment(assignmentId: string) {
    const assignment = await prisma.assignment.findFirst({
      where: { id: assignmentId, is_deleted: false },
    });
    if (!assignment) throw err('Assignment not found', 404);
    if (assignment.status === AssignmentStatus.REJECTED) {
      throw err('Assignment is already rejected', 400);
    }

    return prisma.assignment.update({
      where: { id: assignmentId },
      data:  { status: AssignmentStatus.REJECTED },
    });
  },

  async editAssignment(
    assignmentId: string,
    data: {
      title?: string;
      description?: string;
      due_date?: Date | string;
      total_marks?: number;
      file_url?: string;
      target?: AssignmentTarget;
      course_id?: string;
    },
  ) {
    const assignment = await prisma.assignment.findFirst({
      where: { id: assignmentId, is_deleted: false },
    });
    if (!assignment) throw err('Assignment not found', 404);

    return prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        ...(data.title       !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.due_date    !== undefined && { due_date: new Date(data.due_date) }),
        ...(data.total_marks !== undefined && { total_marks: data.total_marks }),
        ...(data.file_url    !== undefined && { file_url: data.file_url }),
        ...(data.target      !== undefined && { target: data.target }),
        ...(data.course_id   !== undefined && { course_id: data.course_id }),
      },
    });
  },

  async softDeleteAssignment(assignmentId: string) {
    const assignment = await prisma.assignment.findFirst({
      where: { id: assignmentId, is_deleted: false },
    });
    if (!assignment) throw err('Assignment not found', 404);

    return prisma.assignment.update({
      where: { id: assignmentId },
      data:  { is_deleted: true },
    });
  },

  // ─── Student ─────────────────────────────────────────────────────────────────

  async getStudentAssignments(studentId: string) {
    // Courses the student is actively enrolled in
    const enrollments = await prisma.enrollment.findMany({
      where:  { student_id: studentId, status: 'ACTIVE' },
      select: { course_id: true },
    });
    const enrolledCourseIds = enrollments.map((e) => e.course_id);

    const assignments = await prisma.assignment.findMany({
      where: {
        is_deleted: false,
        status:     AssignmentStatus.APPROVED,
        OR: [
          { target: AssignmentTarget.COURSE, course_id: { in: enrolledCourseIds } },
          // ALL_ENROLLED: any active enrollment qualifies — no course-id restriction
          ...(enrolledCourseIds.length > 0 ? [{ target: AssignmentTarget.ALL_ENROLLED }] : []),
        ],
      },
      include: {
        course: { select: { id: true, title: true } },
        submissions: {
          where: { student_id: studentId, deleted_at: null },
          take:  1,
        },
      },
      orderBy: { due_date: 'asc' },
    });

    return assignments.map((a) => {
      const { submissions, ...rest } = a;
      return { ...rest, my_submission: submissions[0] ?? null };
    });
  },

  async getUnreadAssignmentCount(studentId: string) {
    const enrollments = await prisma.enrollment.findMany({
      where:  { student_id: studentId, status: 'ACTIVE' },
      select: { course_id: true },
    });
    const enrolledCourseIds = enrollments.map((e) => e.course_id);

    if (enrolledCourseIds.length === 0) return 0;

    const assignments = await prisma.assignment.findMany({
      where: {
        is_deleted: false,
        status:     AssignmentStatus.APPROVED,
        OR: [
          { target: AssignmentTarget.COURSE, course_id: { in: enrolledCourseIds } },
          { target: AssignmentTarget.ALL_ENROLLED },
        ],
      },
      select: { id: true },
    });
    const assignmentIds = assignments.map((a) => a.id);
    if (assignmentIds.length === 0) return 0;

    // Assignments where student has NO active submission
    const submittedIds = await prisma.submission.findMany({
      where:  { assignment_id: { in: assignmentIds }, student_id: studentId, deleted_at: null },
      select: { assignment_id: true },
    });
    const submittedSet = new Set(submittedIds.map((s) => s.assignment_id));

    return assignmentIds.filter((id) => !submittedSet.has(id)).length;
  },

  async getStudentScoreHistory(studentId: string) {
    return prisma.submission.findMany({
      where: {
        student_id: studentId,
        status:     SubmissionStatus.GRADED,
        deleted_at: null,
        assignment: { score_released: true, is_deleted: false },
      },
      select: {
        id:          true,
        grade:       true,
        feedback:    true,
        status:      true,
        submitted_at: true,
        assignment: {
          select: {
            id:          true,
            title:       true,
            total_marks: true,
            course: { select: { id: true, title: true } },
          },
        },
      },
      orderBy: { submitted_at: 'desc' },
    });
  },

  // ─── Submissions ─────────────────────────────────────────────────────────────

  async submitAssignment(
    studentId: string,
    assignmentId: string,
    content?: string,
    file_url?: string,
  ) {
    const assignment = await prisma.assignment.findFirst({
      where: { id: assignmentId, is_deleted: false, status: AssignmentStatus.APPROVED },
    });
    if (!assignment) throw err('Assignment not found or not available', 404);
    if (new Date() > new Date(assignment.due_date)) {
      throw err('Submission deadline has passed', 400);
    }

    const existing = await prisma.submission.findUnique({
      where: { assignment_id_student_id: { assignment_id: assignmentId, student_id: studentId } },
    });

    if (existing) {
      return prisma.submission.update({
        where: { id: existing.id },
        data:  { content, file_url, status: SubmissionStatus.SUBMITTED, deleted_at: null },
      });
    }

    return prisma.submission.create({
      data: {
        id:            uuidv4(),
        assignment_id: assignmentId,
        student_id:    studentId,
        content,
        file_url,
        status:        SubmissionStatus.SUBMITTED,
      },
    });
  },

  async deleteSubmission(studentId: string, assignmentId: string) {
    const assignment = await prisma.assignment.findFirst({
      where: { id: assignmentId, is_deleted: false },
    });
    if (!assignment) throw err('Assignment not found', 404);
    if (new Date() > new Date(assignment.due_date)) {
      throw err('Cannot delete submission after the deadline', 400);
    }

    const submission = await prisma.submission.findUnique({
      where: { assignment_id_student_id: { assignment_id: assignmentId, student_id: studentId } },
    });
    if (!submission || submission.deleted_at !== null) {
      throw err('Submission not found', 404);
    }

    return prisma.submission.update({
      where: { id: submission.id },
      data:  { deleted_at: new Date() },
    });
  },

  async getAssignmentSubmissions(assignmentId: string, teacherId: string) {
    const assignment = await prisma.assignment.findFirst({
      where: { id: assignmentId, teacher_id: teacherId, is_deleted: false },
    });
    if (!assignment) throw err('Assignment not found or access denied', 404);

    return prisma.submission.findMany({
      where: { assignment_id: assignmentId, deleted_at: null },
      include: {
        student: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { submitted_at: 'asc' },
    });
  },

  async gradeSubmission(
    submissionId: string,
    teacherId: string,
    grade: number,
    feedback?: string,
  ) {
    const submission = await prisma.submission.findFirst({
      where:   { id: submissionId, deleted_at: null },
      include: { assignment: true },
    });
    if (!submission) throw err('Submission not found', 404);
    if (submission.assignment.teacher_id !== teacherId) {
      throw err('You do not own this assignment', 403);
    }
    if (grade < 0 || grade > submission.assignment.total_marks) {
      throw err(
        `Grade must be between 0 and ${submission.assignment.total_marks}`,
        400,
      );
    }

    return prisma.submission.update({
      where: { id: submissionId },
      data:  { grade, feedback, status: SubmissionStatus.GRADED },
    });
  },

  async releaseScores(assignmentId: string, teacherId: string) {
    const assignment = await prisma.assignment.findFirst({
      where: { id: assignmentId, teacher_id: teacherId, is_deleted: false },
    });
    if (!assignment) throw err('Assignment not found or access denied', 404);
    if (assignment.score_released) throw err('Scores are already released', 400);

    return prisma.assignment.update({
      where: { id: assignmentId },
      data:  { score_released: true },
    });
  },
};
