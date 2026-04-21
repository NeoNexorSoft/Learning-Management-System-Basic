import { Prisma, CourseStatus, EnrollmentStatus, SubmissionStatus } from '@prisma/client';
import { prisma } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const notify = (user_id: string, title: string, message: string): void => {
  prisma.notification.create({ data: { id: uuidv4(), user_id, title, message } }).catch(() => {});
};

const recalcProgress = async (enrollmentId: string, courseId: string) => {
  const [total, completed] = await Promise.all([
    prisma.lesson.count({ where: { section: { course_id: courseId } } }),
    prisma.lessonProgress.count({ where: { enrollment_id: enrollmentId, completed: true } }),
  ]);
  return total > 0 ? Math.round((completed / total) * 100) : 0;
};

// ─── Enrollment ───────────────────────────────────────────────────────────────

export const enrollmentService = {
  async enrollStudent(studentId: string, courseId: string) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw Object.assign(new Error('Course not found'), { statusCode: 404 });
    if (course.status !== CourseStatus.APPROVED) {
      throw Object.assign(new Error('Course is not available for enrollment'), { statusCode: 400 });
    }

    const existing = await prisma.enrollment.findUnique({
      where: { student_id_course_id: { student_id: studentId, course_id: courseId } },
    });
    if (existing) throw Object.assign(new Error('Already enrolled in this course'), { statusCode: 409 });

    const enrollment = await prisma.enrollment.create({
      data: { id: uuidv4(), student_id: studentId, course_id: courseId },
      include: {
        course: { select: { id: true, title: true, slug: true, thumbnail: true } },
      },
    });

    notify(studentId, 'Enrollment Successful', `Welcome to "${course.title}"! Start learning now.`);

    return enrollment;
  },

  async getMyEnrollments(studentId: string) {
    return prisma.enrollment.findMany({
      where:   { student_id: studentId },
      orderBy: { enrolled_at: 'desc' },
      select: {
        id: true,
        progress: true,
        status: true,
        enrolled_at: true,
        completed_at: true,
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            level: true,
            duration: true,
            teacher: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    });
  },

  async getEnrollmentDetail(enrollmentId: string, viewerId: string, viewerRole: string) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            sections: {
              orderBy: { order: 'asc' },
              include: {
                lessons: {
                  orderBy: { order: 'asc' },
                  select: {
                    id: true, title: true, type: true,
                    duration: true, order: true, content: true, video_url: true,
                  },
                },
              },
            },
            teacher: { select: { id: true, name: true, avatar: true } }, // id needed for ownership check
          },
        },
        lessonProgress: {
          select: { lesson_id: true, completed: true, watch_seconds: true, updated_at: true },
        },
      },
    });

    if (!enrollment) throw Object.assign(new Error('Enrollment not found'), { statusCode: 404 });

    const isOwner   = enrollment.student_id === viewerId;
    const isAdmin   = viewerRole === 'ADMIN';
    // A teacher may only see enrollments for courses they own, not every enrollment.
    const isTeacherOfCourse =
      viewerRole === 'TEACHER' && enrollment.course.teacher.id === viewerId;

    if (!isOwner && !isAdmin && !isTeacherOfCourse) {
      throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
    }

    return enrollment;
  },

  async completeLesson(studentId: string, lessonId: string) {
    const lesson = await prisma.lesson.findUnique({
      where:   { id: lessonId },
      include: { section: { select: { course_id: true } } },
    });
    if (!lesson) throw Object.assign(new Error('Lesson not found'), { statusCode: 404 });

    const courseId = lesson.section.course_id;

    const enrollment = await prisma.enrollment.findUnique({
      where: { student_id_course_id: { student_id: studentId, course_id: courseId } },
    });
    if (!enrollment) throw Object.assign(new Error('Not enrolled in this course'), { statusCode: 403 });

    const lessonProgress = await prisma.lessonProgress.upsert({
      where:  { enrollment_id_lesson_id: { enrollment_id: enrollment.id, lesson_id: lessonId } },
      create: { id: uuidv4(), enrollment_id: enrollment.id, lesson_id: lessonId, completed: true },
      update: { completed: true },
    });

    const progress = await recalcProgress(enrollment.id, courseId);

    const isNowComplete = progress === 100 && enrollment.status !== EnrollmentStatus.COMPLETED;

    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progress,
        ...(isNowComplete && { status: EnrollmentStatus.COMPLETED, completed_at: new Date() }),
      },
    });

    let certificate = null;
    if (isNowComplete) {
      const existingCert = await prisma.certificate.findUnique({
        where: { enrollment_id: enrollment.id },
      });
      if (!existingCert) {
        certificate = await prisma.certificate.create({
          data: {
            id:               uuidv4(),
            enrollment_id:    enrollment.id,
            student_id:       studentId,
            course_id:        courseId,
            certificate_code: `CERT-${uuidv4().replace(/-/g, '').slice(0, 10).toUpperCase()}`,
          },
        });
      } else {
        certificate = existingCert;
      }

      const course = await prisma.course.findUnique({
        where: { id: courseId }, select: { title: true },
      });
      if (course) {
        notify(
          studentId,
          'Course Completed!',
          `Congratulations! You've completed "${course.title}". Your certificate is ready.`,
        );
      }
    }

    return { progress, lessonProgress, certificate };
  },

  async getEnrolledStudents(
    courseId: string,
    viewerId: string,
    viewerRole: string,
    { page = 1, limit = 20 }: { page?: number; limit?: number },
  ) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw Object.assign(new Error('Course not found'), { statusCode: 404 });

    if (viewerRole === 'TEACHER' && course.teacher_id !== viewerId) {
      throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
    }

    const skip = (page - 1) * limit;

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where:   { course_id: courseId },
        skip,
        take:    limit,
        orderBy: { enrolled_at: 'desc' },
        select: {
          id: true,
          progress: true,
          status: true,
          enrolled_at: true,
          completed_at: true,
          student: {
            select: {
              id: true, name: true, username: true, avatar: true, email: true,
            },
          },
        },
      }),
      prisma.enrollment.count({ where: { course_id: courseId } }),
    ]);

    return { data: enrollments, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  // ─── Assignments ─────────────────────────────────────────────────────────────

  async createAssignment(
    lessonId: string,
    teacherId: string,
    data: { title: string; description?: string; due_date?: Date; total_marks?: number },
  ) {
    const lesson = await prisma.lesson.findUnique({
      where:   { id: lessonId },
      include: { section: { include: { course: { select: { teacher_id: true } } } } },
    });
    if (!lesson) throw Object.assign(new Error('Lesson not found'), { statusCode: 404 });
    if (lesson.section.course.teacher_id !== teacherId) {
      throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
    }

    return prisma.assignment.create({
      data: { id: uuidv4(), lesson_id: lessonId, ...data },
    });
  },

  async getMyAssignments(studentId: string) {
    const assignments = await prisma.assignment.findMany({
      where: {
        lesson: {
          section: {
            course: { enrollments: { some: { student_id: studentId } } },
          },
        },
      },
      orderBy: [{ due_date: 'asc' }, { created_at: 'desc' }],
      include: {
        submissions: {
          where:  { student_id: studentId },
          select: { id: true, status: true, submitted_at: true, grade: true },
        },
        lesson: {
          select: {
            id: true,
            title: true,
            section: {
              select: {
                course: { select: { id: true, title: true, slug: true } },
              },
            },
          },
        },
      },
    });

    return assignments.map(({ submissions, ...a }) => ({
      ...a,
      submissionStatus: submissions[0]?.status ?? null,
      submission:       submissions[0] ?? null,
    }));
  },

  async submitAssignment(
    studentId: string,
    assignmentId: string,
    data: { content?: string; file_url?: string },
  ) {
    const assignment = await prisma.assignment.findUnique({
      where:   { id: assignmentId },
      include: { lesson: { include: { section: { select: { course_id: true } } } } },
    });
    if (!assignment) throw Object.assign(new Error('Assignment not found'), { statusCode: 404 });

    const courseId = assignment.lesson.section.course_id;
    const enrollment = await prisma.enrollment.findUnique({
      where: { student_id_course_id: { student_id: studentId, course_id: courseId } },
    });
    if (!enrollment) throw Object.assign(new Error('Not enrolled in this course'), { statusCode: 403 });

    const existing = await prisma.submission.findFirst({
      where: { assignment_id: assignmentId, student_id: studentId },
    });
    if (existing) throw Object.assign(new Error('Assignment already submitted'), { statusCode: 409 });

    return prisma.submission.create({
      data: { id: uuidv4(), assignment_id: assignmentId, student_id: studentId, ...data },
    });
  },

  async getAssignmentSubmissions(assignmentId: string, teacherId: string) {
    const assignment = await prisma.assignment.findUnique({
      where:   { id: assignmentId },
      include: {
        lesson: {
          include: { section: { include: { course: { select: { teacher_id: true, title: true } } } } },
        },
      },
    });
    if (!assignment) throw Object.assign(new Error('Assignment not found'), { statusCode: 404 });
    if (assignment.lesson.section.course.teacher_id !== teacherId) {
      throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
    }

    return prisma.submission.findMany({
      where:   { assignment_id: assignmentId },
      orderBy: { submitted_at: 'desc' },
      include: {
        student: { select: { id: true, name: true, username: true, avatar: true, email: true } },
      },
    });
  },

  async gradeSubmission(
    submissionId: string,
    teacherId: string,
    data: { grade: number; feedback?: string },
  ) {
    const submission = await prisma.submission.findUnique({
      where:   { id: submissionId },
      include: {
        assignment: {
          include: {
            lesson: {
              include: {
                section: { include: { course: { select: { teacher_id: true, title: true } } } },
              },
            },
          },
        },
      },
    });
    if (!submission) throw Object.assign(new Error('Submission not found'), { statusCode: 404 });
    if (submission.assignment.lesson.section.course.teacher_id !== teacherId) {
      throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
    }
    if (data.grade < 0 || data.grade > 100) {
      throw Object.assign(new Error('Grade must be between 0 and 100'), { statusCode: 400 });
    }

    const updated = await prisma.submission.update({
      where: { id: submissionId },
      data:  { grade: data.grade, feedback: data.feedback, status: SubmissionStatus.GRADED },
    });

    const courseTitle = submission.assignment.lesson.section.course.title;
    notify(
      submission.student_id,
      'Assignment Graded',
      `Your submission for "${submission.assignment.title}" in "${courseTitle}" has been graded. Grade: ${data.grade}/100`,
    );

    return updated;
  },

  // ─── Reviews ─────────────────────────────────────────────────────────────────

  async createReview(
    studentId: string,
    courseId: string,
    data: { rating: number; comment?: string },
  ) {
    if (data.rating < 1 || data.rating > 5) {
      throw Object.assign(new Error('Rating must be between 1 and 5'), { statusCode: 400 });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { student_id_course_id: { student_id: studentId, course_id: courseId } },
    });
    if (!enrollment) throw Object.assign(new Error('You must be enrolled to review this course'), { statusCode: 403 });
    if (enrollment.progress < 20) {
      throw Object.assign(new Error('Complete at least 20% of the course before reviewing'), { statusCode: 403 });
    }

    const existing = await prisma.review.findUnique({
      where: { course_id_student_id: { course_id: courseId, student_id: studentId } },
    });
    if (existing) throw Object.assign(new Error('You have already reviewed this course'), { statusCode: 409 });

    return prisma.review.create({
      data: { id: uuidv4(), course_id: courseId, student_id: studentId, ...data },
      include: {
        student: { select: { id: true, name: true, avatar: true } },
      },
    });
  },

  async getCourseReviews(courseId: string, { page = 1, limit = 20 }: { page?: number; limit?: number }) {
    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
    if (!course) throw Object.assign(new Error('Course not found'), { statusCode: 404 });

    const skip = (page - 1) * limit;

    const [reviews, total, ratingAgg, breakdown] = await Promise.all([
      prisma.review.findMany({
        where:   { course_id: courseId },
        skip,
        take:    limit,
        orderBy: { created_at: 'desc' },
        include: { student: { select: { id: true, name: true, avatar: true } } },
      }),
      prisma.review.count({ where: { course_id: courseId } }),
      prisma.review.aggregate({
        where: { course_id: courseId },
        _avg:  { rating: true },
      }),
      prisma.review.groupBy({
        by:    ['rating'],
        where: { course_id: courseId },
        _count: { _all: true },
      }),
    ]);

    const ratingBreakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    breakdown.forEach(r => { ratingBreakdown[r.rating] = r._count._all; });

    return {
      data: reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      avgRating:       ratingAgg._avg.rating ?? 0,
      ratingBreakdown,
    };
  },
};
