import { Prisma, CourseLevel, CourseStatus, LessonType, ObjectiveType } from '@prisma/client';
import { prisma } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

// ─── Slug Generators ──────────────────────────────────────────────────────────

const generateSlug = async (title: string): Promise<string> => {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'course';
  let slug = base;
  let attempt = 0;
  while (await prisma.course.findUnique({ where: { slug } })) {
    slug = `${base}-${++attempt}`;
  }
  return slug;
};

const generateCategorySlug = async (name: string): Promise<string> => {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'category';
  let slug = base;
  let attempt = 0;
  while (await prisma.category.findUnique({ where: { slug } })) {
    slug = `${base}-${++attempt}`;
  }
  return slug;
};

// ─── Rating Helper ─────────────────────────────────────────────────────────────

const buildRatingsMap = async (courseIds: string[]) => {
  if (courseIds.length === 0) return {} as Record<string, { avgRating: number; totalReviews: number }>;
  const rows = await prisma.review.groupBy({
    by: ['course_id'],
    where: { course_id: { in: courseIds } },
    _avg: { rating: true },
    _count: { _all: true },
  });
  return Object.fromEntries(
    rows.map(r => [r.course_id, { avgRating: r._avg.rating ?? 0, totalReviews: r._count._all }]),
  ) as Record<string, { avgRating: number; totalReviews: number }>;
};

// ─── Input Interfaces ──────────────────────────────────────────────────────────

interface CreateCourseInput {
  title: string;
  subtitle?: string;
  description?: string;
  category_id?: string;
  level?: CourseLevel;
  language?: string;
  price?: number;
  discount_price?: number;
  discount_type?: string;
  discount_ends_at?: Date;
  thumbnail?: string;
  intro_video?: string;
  welcome_message?: string;
  congrats_message?: string;
}

interface ListPublicCoursesQuery {
  category?: string;
  level?: CourseLevel;
  price_min?: number;
  price_max?: number;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
  is_popular?: boolean;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const courseService = {
  // ─── Public ───────────────────────────────────────────────────────────────

  async listPublicCourses({
    category, level, price_min, price_max, search, sort = 'newest', page = 1, limit = 12, is_popular,
  }: ListPublicCoursesQuery) {
    const skip = (page - 1) * limit;

    const priceFilter: Prisma.DecimalFilter = {};
    if (price_min !== undefined) priceFilter.gte = price_min;
    if (price_max !== undefined) priceFilter.lte = price_max;
    const hasPriceFilter = price_min !== undefined || price_max !== undefined;

    const where: Prisma.CourseWhereInput = {
      status: CourseStatus.APPROVED,
      ...(category && { category: { slug: category } }),
      ...(level && { level }),
      ...(hasPriceFilter && { price: priceFilter }),
      ...(is_popular && { is_popular: true }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { subtitle: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const sortMap: Record<string, Prisma.CourseOrderByWithRelationInput> = {
      newest:     { created_at: 'desc' },
      popular:    { enrollments: { _count: 'desc' } },
      price_asc:  { price: 'asc' },
      price_desc: { price: 'desc' },
    };
    const orderBy = sortMap[sort] ?? sortMap.newest;

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
          slug: true,
          subtitle: true,
          thumbnail: true,
          price: true,
          discount_price: true,
          discount_type: true,
          discount_ends_at: true,
          level: true,
          duration: true,
          is_popular: true,
          published_at: true,
          created_at: true,
          teacher:  { select: { id: true, name: true, avatar: true } },
          category: { select: { id: true, name: true, slug: true } },
          _count:   { select: { enrollments: true } },
        },
      }),
      prisma.course.count({ where }),
    ]);

    const ratingsMap = await buildRatingsMap(courses.map(c => c.id));

    const data = courses.map(({ _count, ...c }) => ({
      ...c,
      totalStudents: _count.enrollments,
      ...(ratingsMap[c.id] ?? { avgRating: 0, totalReviews: 0 }),
    }));

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async getCourseBySlug(slug: string, viewerUserId?: string, viewerRole?: string) {
    const course = await prisma.course.findUnique({
      where: { slug, status: CourseStatus.APPROVED },
      include: {
        teacher:    { select: { id: true, name: true, username: true, avatar: true, bio: true } },
        category:   { select: { id: true, name: true, slug: true } },
        objectives: { orderBy: { order: 'asc' } },
        sections: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              include: {
                lessonQuizzes: {
                  select: {
                    id: true,
                    title: true,
                    _count: { select: { questions: true } },
                  },
                },
              },
            },
          },
        },
        reviews: {
          take: 5,
          orderBy: { created_at: 'desc' },
          include: { student: { select: { id: true, name: true, avatar: true } } },
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) throw Object.assign(new Error('Course not found'), { statusCode: 404 });

    let canAccessContent =
      viewerRole === 'ADMIN' || course.teacher_id === viewerUserId;

    if (!canAccessContent && viewerUserId) {
      const enrollment = await prisma.enrollment.findUnique({
        where: { student_id_course_id: { student_id: viewerUserId, course_id: course.id } },
      });
      canAccessContent = !!enrollment;
    }

    const [ratingAgg] = await Promise.all([
      prisma.review.aggregate({
        where: { course_id: course.id },
        _avg: { rating: true },
        _count: { _all: true },
      }),
    ]);

    const { _count, ...courseRest } = course;

    const sections = courseRest.sections.map(section => ({
      ...section,
      lessons: section.lessons.map(({ video_urls, content, ...lesson }) => ({
        ...lesson,
        ...(canAccessContent ? { video_urls, content } : {}),
      })),
    }));

    return {
      ...courseRest,
      sections,
      totalStudents: _count.enrollments,
      totalSections: course.sections?.length ?? 0,
      totalLessons:  course.sections?.reduce((sum, s) => sum + s.lessons.length, 0) ?? 0,
      totalQuizzes:  course.sections?.reduce((sum, s) =>
        sum + s.lessons.reduce((ls, l) => ls + (l.lessonQuizzes?.length ?? 0), 0), 0) ?? 0,
      avgRating:    ratingAgg._avg.rating ?? 0,
      totalReviews: ratingAgg._count._all,
    };
  },

  async getCourseBySlugAdmin(slug: string) {
    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        teacher:    { select: { id: true, name: true, email: true, avatar: true, bio: true } },
        category:   { select: { id: true, name: true, parent: { select: { name: true } } } },
        objectives: { orderBy: { order: 'asc' } },
        sections: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              include: {
                lessonQuizzes: {
                  orderBy: { order: 'asc' },
                  include: {
                    questions: { orderBy: { order: 'asc' } },
                  },
                },
              },
            },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });
    if (!course) throw Object.assign(new Error('Not found'), { statusCode: 404 });
    return {
      ...course,
      totalSections: course.sections?.length ?? 0,
      totalLessons:  course.sections?.reduce((sum, s) => sum + s.lessons.length, 0) ?? 0,
      totalQuizzes:  course.sections?.reduce((sum, s) =>
        sum + s.lessons.reduce((ls, l) => ls + (l.lessonQuizzes?.length ?? 0), 0), 0) ?? 0,
    };
  },

  async getCourseBySlugTeacher(slug: string, teacherId: string) {
    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        teacher:    { select: { id: true, name: true, email: true, avatar: true, bio: true } },
        category:   { select: { id: true, name: true, parent: { select: { name: true } } } },
        objectives: { orderBy: { order: 'asc' } },
        sections: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              include: {
                lessonQuizzes: { select: { id: true, title: true } },
              },
            },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });
    if (!course) throw Object.assign(new Error('Not found'), { statusCode: 404 });
    if (course.teacher_id !== teacherId) throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
    return {
      ...course,
      totalSections: course.sections?.length ?? 0,
      totalLessons:  course.sections?.reduce((sum, s) => sum + s.lessons.length, 0) ?? 0,
      totalQuizzes:  course.sections?.reduce((sum, s) =>
        sum + s.lessons.reduce((ls, l) => ls + (l.lessonQuizzes?.length ?? 0), 0), 0) ?? 0,
    };
  },

  // ─── Categories ────────────────────────────────────────────────────────────

  async listCategories() {
    return prisma.category.findMany({
      where:   { parent_id: null },
      include: {
        children: { select: { id: true, name: true, slug: true }, orderBy: { name: 'asc' } },
        _count:   { select: { courses: true } },
      },
      orderBy: { name: 'asc' },
    });
  },

  async createCategory(name: string, parent_id?: string) {
    if (parent_id) {
      const parent = await prisma.category.findUnique({ where: { id: parent_id } });
      if (!parent) throw Object.assign(new Error('Parent category not found'), { statusCode: 404 });
    }
    const slug = await generateCategorySlug(name);
    return prisma.category.create({ data: { id: uuidv4(), name, slug, parent_id } });
  },

  async updateCategory(id: string, data: { name?: string; parent_id?: string | null }) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw Object.assign(new Error('Category not found'), { statusCode: 404 });

    const updateData: Prisma.CategoryUpdateInput = { ...data };
    if (data.name) updateData.slug = await generateCategorySlug(data.name);

    return prisma.category.update({ where: { id }, data: updateData });
  },

  async deleteCategory(id: string) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw Object.assign(new Error('Category not found'), { statusCode: 404 });
    await prisma.category.delete({ where: { id } });
  },

  // ─── Teacher: Own Courses ──────────────────────────────────────────────────

  async listTeacherCourses(teacherId: string, { page = 1, limit = 20 }: { page?: number; limit?: number }) {
    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      /*prisma.course.findMany({
        where:   { teacher_id: teacherId },
        skip,
        take:    limit,
        orderBy: { created_at: 'desc' },
        select: {
          id: true, title: true, slug: true, thumbnail: true,
          price: true, level: true, status: true, created_at: true, updated_at: true,
          category: { select: { id: true, name: true, slug: true } },
          _count:   { select: { enrollments: true } },
        },
      }),*/
      prisma.course.findMany({
        where:   { teacher_id: teacherId },
        skip,
        take:    limit,
        orderBy: { created_at: 'desc' },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          _count:   { select: { enrollments: true, sections: true } },
        },
      }),
      prisma.course.count({ where: { teacher_id: teacherId } }),
    ]);

    const courseIds = courses.map(c => c.id);

    const [ratingsMap, earningsRows] = await Promise.all([
      buildRatingsMap(courseIds),
      courseIds.length
        ? prisma.transaction.groupBy({
            by: ['course_id'],
            where: { course_id: { in: courseIds }, status: 'COMPLETED', type: 'PURCHASE' },
            _sum: { amount: true },
          })
        : Promise.resolve([]),
    ]);

    const earningsMap = Object.fromEntries(
      (earningsRows as Array<{ course_id: string | null; _sum: { amount: Prisma.Decimal | null } }>)
        .map(e => [e.course_id, e._sum.amount ?? 0]),
    );

    const [lessonCounts, quizCounts, sectionRows, lessonRows] = await Promise.all([
      prisma.lesson.groupBy({
        by: ['section_id'],
        where: { section: { course_id: { in: courseIds } } },
        _count: { _all: true },
      }),
      prisma.lessonQuiz.groupBy({
        by: ['lesson_id'],
        where: { lesson: { section: { course_id: { in: courseIds } } } },
        _count: { _all: true },
      }),
      prisma.section.findMany({
        where: { course_id: { in: courseIds } },
        select: { id: true, course_id: true },
      }),
      prisma.lesson.findMany({
        where: { section: { course_id: { in: courseIds } } },
        select: { id: true, section_id: true },
      }),
    ]);

    const sectionToCourse: Record<string, string> = {};
    for (const s of sectionRows) sectionToCourse[s.id] = s.course_id;
    const lessonToCourse: Record<string, string> = {};
    for (const l of lessonRows) lessonToCourse[l.id] = sectionToCourse[l.section_id];

    const lessonCountsPerCourse: Record<string, number> = {};
    for (const row of lessonCounts) {
      const cid = sectionToCourse[row.section_id];
      if (cid) lessonCountsPerCourse[cid] = (lessonCountsPerCourse[cid] ?? 0) + row._count._all;
    }
    const quizCountsPerCourse: Record<string, number> = {};
    for (const row of quizCounts) {
      const cid = lessonToCourse[row.lesson_id];
      if (cid) quizCountsPerCourse[cid] = (quizCountsPerCourse[cid] ?? 0) + row._count._all;
    }

    const data = courses.map(({ _count, ...c }) => ({
      ...c,
      totalStudents: _count.enrollments,
      totalSections: _count.sections,
      totalLessons:  lessonCountsPerCourse[c.id] ?? 0,
      totalQuizzes:  quizCountsPerCourse[c.id] ?? 0,
      totalEarnings: earningsMap[c.id] ?? 0,
      ...(ratingsMap[c.id] ?? { avgRating: 0, totalReviews: 0 }),
    }));

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async getTeacherCourseById(courseId: string, teacherId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        category:   { select: { id: true, name: true, parent: { select: { id: true, name: true } } } },
        objectives: { orderBy: { order: 'asc' } },
        sections: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              include: {
                lessonQuizzes: {
                  orderBy: { order: 'asc' },
                  include: {
                    questions: { orderBy: { order: 'asc' } },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!course) throw Object.assign(new Error('Not found'), { statusCode: 404 });
    if (course.teacher_id !== teacherId) throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
    return course;
  },

  async createCourse(teacherId: string, input: CreateCourseInput) {
    if (input.category_id) {
      const category = await prisma.category.findUnique({ where: { id: input.category_id } });
      if (!category) throw Object.assign(new Error('Category not found'), { statusCode: 404 });
    }

    const slug = await generateSlug(input.title);

    return prisma.course.create({
      data: {
        id:               uuidv4(),
        teacher_id:       teacherId,
        category_id:      input.category_id ?? null,
        title:            input.title,
        slug,
        subtitle:         input.subtitle,
        description:      input.description,
        language:         input.language,
        level:            input.level,
        price:            input.price ?? 0,
        discount_price:   input.discount_price,
        discount_type:    input.discount_type,
        discount_ends_at: input.discount_ends_at,
        thumbnail:        input.thumbnail,
        intro_video:      input.intro_video,
        welcome_message:  input.welcome_message,
        congrats_message: input.congrats_message,
        status:           CourseStatus.DRAFT,
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
  },

  async updateCourse(courseId: string, teacherId: string, data: Partial<CreateCourseInput>) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw Object.assign(new Error('Course not found'), { statusCode: 404 });
    if (course.teacher_id !== teacherId) throw Object.assign(new Error('Forbidden'), { statusCode: 403 });

    // Build an explicit whitelist so unknown request-body fields never reach Prisma
    const update: Prisma.CourseUpdateInput = {};
    if (data.title            !== undefined) update.title            = data.title;
    if (data.subtitle         !== undefined) update.subtitle         = data.subtitle;
    if (data.description      !== undefined) update.description      = data.description;
    if (data.language         !== undefined) update.language         = data.language;
    if (data.level            !== undefined) update.level            = data.level;
    if (data.price            !== undefined) update.price            = data.price;
    if (data.discount_price   !== undefined) update.discount_price   = data.discount_price;
    if (data.discount_type    !== undefined) update.discount_type    = data.discount_type;
    if (data.discount_ends_at !== undefined) update.discount_ends_at = data.discount_ends_at;
    if (data.thumbnail        !== undefined) update.thumbnail        = data.thumbnail;
    if (data.intro_video      !== undefined) update.intro_video      = data.intro_video;
    if (data.welcome_message  !== undefined) update.welcome_message  = data.welcome_message;
    if (data.congrats_message !== undefined) update.congrats_message = data.congrats_message;
    if (data.category_id !== undefined) {
      update.category = data.category_id
        ? { connect: { id: data.category_id } }
        : { disconnect: true };
    }

    return prisma.course.update({
      where: { id: courseId },
      data:  update,
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
  },

  async submitCourse(courseId: string, teacherId: string) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw Object.assign(new Error('Course not found'), { statusCode: 404 });
    if (course.teacher_id !== teacherId) throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
    if (course.status !== CourseStatus.DRAFT) {
      throw Object.assign(new Error('Only DRAFT courses can be submitted for review'), { statusCode: 400 });
    }
    return prisma.course.update({
      where: { id: courseId },
      data:  { status: CourseStatus.PENDING },
      select: { id: true, title: true, status: true },
    });
  },

  async replaceObjectives(
    courseId: string,
    teacherId: string,
    objectives: Array<{ type: ObjectiveType; content: string; order?: number }>,
  ) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw Object.assign(new Error('Course not found'), { statusCode: 404 });
    if (course.teacher_id !== teacherId) throw Object.assign(new Error('Forbidden'), { statusCode: 403 });

    await prisma.$transaction([
      prisma.courseObjective.deleteMany({ where: { course_id: courseId } }),
      prisma.courseObjective.createMany({
        data: objectives.map((obj, idx) => ({
          id:        uuidv4(),
          course_id: courseId,
          type:      obj.type,
          content:   obj.content,
          order:     obj.order ?? idx,
        })),
      }),
    ]);

    return prisma.courseObjective.findMany({
      where:   { course_id: courseId },
      orderBy: { order: 'asc' },
    });
  },

  // ─── Sections ─────────────────────────────────────────────────────────────

  async createSection(courseId: string, teacherId: string, data: { title: string; order?: number }) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw Object.assign(new Error('Course not found'), { statusCode: 404 });
    if (course.teacher_id !== teacherId) throw Object.assign(new Error('Forbidden'), { statusCode: 403 });

    const last = await prisma.section.findFirst({ where: { course_id: courseId }, orderBy: { order: 'desc' } });

    return prisma.section.create({
      data: {
        id:        uuidv4(),
        course_id: courseId,
        title:     data.title,
        order:     data.order ?? (last ? last.order + 1 : 0),
      },
    });
  },

  async updateSection(sectionId: string, teacherId: string, data: { title?: string; order?: number }) {
    const section = await prisma.section.findUnique({
      where:   { id: sectionId },
      include: { course: { select: { teacher_id: true } } },
    });
    if (!section) throw Object.assign(new Error('Section not found'), { statusCode: 404 });
    if (section.course.teacher_id !== teacherId) throw Object.assign(new Error('Forbidden'), { statusCode: 403 });

    return prisma.section.update({ where: { id: sectionId }, data });
  },

  async deleteSection(sectionId: string, teacherId: string) {
    const section = await prisma.section.findUnique({
      where:   { id: sectionId },
      include: { course: { select: { teacher_id: true } } },
    });
    if (!section) throw Object.assign(new Error('Section not found'), { statusCode: 404 });
    if (section.course.teacher_id !== teacherId) throw Object.assign(new Error('Forbidden'), { statusCode: 403 });

    await prisma.section.delete({ where: { id: sectionId } });
  },

  // ─── Lessons ──────────────────────────────────────────────────────────────

  async createLesson(
    sectionId: string,
    teacherId: string,
    data: { title: string; type: LessonType; content?: string; video_urls?: string[]; file_urls?: string[]; duration?: number; order?: number },
  ) {
    const section = await prisma.section.findUnique({
      where:   { id: sectionId },
      include: { course: { select: { teacher_id: true } } },
    });
    if (!section) throw Object.assign(new Error('Section not found'), { statusCode: 404 });
    if (section.course.teacher_id !== teacherId) throw Object.assign(new Error('Forbidden'), { statusCode: 403 });

    const last = await prisma.lesson.findFirst({ where: { section_id: sectionId }, orderBy: { order: 'desc' } });

    return prisma.lesson.create({
      data: {
        id:         uuidv4(),
        section_id: sectionId,
        title:      data.title,
        type:       data.type,
        content:    data.content,
        video_urls: data.video_urls,
        file_urls:  data.file_urls,
        duration:   data.duration ?? 0,
        order:      data.order ?? (last ? last.order + 1 : 0),
      },
    });
  },

  async updateLesson(
    lessonId: string,
    teacherId: string,
    data: { title?: string; type?: LessonType; content?: string; video_urls?: string[]; file_urls?: string[]; duration?: number; order?: number },
  ) {
    const lesson = await prisma.lesson.findUnique({
      where:   { id: lessonId },
      include: { section: { include: { course: { select: { teacher_id: true } } } } },
    });
    if (!lesson) throw Object.assign(new Error('Lesson not found'), { statusCode: 404 });
    if (lesson.section.course.teacher_id !== teacherId) throw Object.assign(new Error('Forbidden'), { statusCode: 403 });

    const lessonUpdate: Prisma.LessonUpdateInput = {};
    if (data.title    !== undefined) lessonUpdate.title    = data.title;
    if (data.type     !== undefined) lessonUpdate.type     = data.type;
    if (data.content  !== undefined) lessonUpdate.content  = data.content;
    if (data.video_urls !== undefined) lessonUpdate.video_urls = data.video_urls;
    if (data.file_urls  !== undefined) lessonUpdate.file_urls  = data.file_urls;
    if (data.duration !== undefined) lessonUpdate.duration = data.duration;
    if (data.order    !== undefined) lessonUpdate.order    = data.order;

    return prisma.lesson.update({ where: { id: lessonId }, data: lessonUpdate });
  },

  async deleteLesson(lessonId: string, teacherId: string) {
    const lesson = await prisma.lesson.findUnique({
      where:   { id: lessonId },
      include: { section: { include: { course: { select: { teacher_id: true } } } } },
    });
    if (!lesson) throw Object.assign(new Error('Lesson not found'), { statusCode: 404 });
    if (lesson.section.course.teacher_id !== teacherId) throw Object.assign(new Error('Forbidden'), { statusCode: 403 });

    await prisma.lesson.delete({ where: { id: lessonId } });
  },

  // ─── Admin ────────────────────────────────────────────────────────────────

  async getAdminCourseById(courseId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        teacher:    { select: { id: true, name: true, email: true, avatar: true, bio: true } },
        category:   { select: { id: true, name: true, slug: true, parent: { select: { id: true, name: true } } } },
        objectives: { orderBy: { order: 'asc' } },
        sections: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              select: { id: true, title: true, type: true, duration: true, order: true },
            },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });
    if (!course) throw Object.assign(new Error('Course not found'), { statusCode: 404 });
    const { _count, ...rest } = course;
    return { ...rest, totalStudents: _count.enrollments };
  },

  async listAllCourses({
    status, search, page = 1, limit = 20,
  }: { status?: CourseStatus; search?: string; page?: number; limit?: number }) {
    const skip = (page - 1) * limit;

    const where: Prisma.CourseWhereInput = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { teacher: { name: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take:    limit,
        orderBy: { created_at: 'desc' },
        select: {
          id: true, title: true, slug: true, status: true, level: true,
          price: true, is_popular: true, thumbnail: true, published_at: true, created_at: true,
          teacher:  { select: { id: true, name: true, email: true, avatar: true } },
          category: { select: { id: true, name: true, parent: { select: { name: true } } } },
          _count:   { select: { enrollments: true, sections: true } },
        },
      }),
      prisma.course.count({ where }),
    ]);

    const courseIds = courses.map(c => c.id);

    const [lessonCounts, quizCounts, sectionRows, lessonRows] = await Promise.all([
      prisma.lesson.groupBy({
        by: ['section_id'],
        where: { section: { course_id: { in: courseIds } } },
        _count: { _all: true },
      }),
      prisma.lessonQuiz.groupBy({
        by: ['lesson_id'],
        where: { lesson: { section: { course_id: { in: courseIds } } } },
        _count: { _all: true },
      }),
      prisma.section.findMany({
        where: { course_id: { in: courseIds } },
        select: { id: true, course_id: true },
      }),
      prisma.lesson.findMany({
        where: { section: { course_id: { in: courseIds } } },
        select: { id: true, section_id: true },
      }),
    ]);

    const sectionToCourse: Record<string, string> = {};
    for (const s of sectionRows) sectionToCourse[s.id] = s.course_id;
    const lessonToCourse: Record<string, string> = {};
    for (const l of lessonRows) lessonToCourse[l.id] = sectionToCourse[l.section_id];

    const lessonCountsPerCourse: Record<string, number> = {};
    for (const row of lessonCounts) {
      const cid = sectionToCourse[row.section_id];
      if (cid) lessonCountsPerCourse[cid] = (lessonCountsPerCourse[cid] ?? 0) + row._count._all;
    }
    const quizCountsPerCourse: Record<string, number> = {};
    for (const row of quizCounts) {
      const cid = lessonToCourse[row.lesson_id];
      if (cid) quizCountsPerCourse[cid] = (quizCountsPerCourse[cid] ?? 0) + row._count._all;
    }

    const data = courses.map(({ _count, ...c }) => ({
      ...c,
      totalStudents: _count.enrollments,
      totalSections: _count.sections,
      totalLessons:  lessonCountsPerCourse[c.id] ?? 0,
      totalQuizzes:  quizCountsPerCourse[c.id] ?? 0,
    }));

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async approveCourse(courseId: string) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw Object.assign(new Error('Course not found'), { statusCode: 404 });
    if (course.status !== CourseStatus.PENDING) {
      throw Object.assign(new Error('Only PENDING courses can be approved'), { statusCode: 400 });
    }

    const updated = await prisma.course.update({
      where:  { id: courseId },
      data:   { status: CourseStatus.APPROVED, published_at: new Date() },
      select: { id: true, title: true, status: true, published_at: true },
    });

    prisma.notification.create({
      data: {
        id:      uuidv4(),
        user_id: course.teacher_id,
        title:   'Course Approved',
        message: `Your course "${course.title}" has been approved and is now live!`,
      },
    }).catch(() => {});

    return updated;
  },

  async rejectCourse(courseId: string, reason: string) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw Object.assign(new Error('Course not found'), { statusCode: 404 });
    if (course.status !== CourseStatus.PENDING) {
      throw Object.assign(new Error('Only PENDING courses can be rejected'), { statusCode: 400 });
    }

    const updated = await prisma.course.update({
      where:  { id: courseId },
      data:   { status: CourseStatus.REJECTED },
      select: { id: true, title: true, status: true },
    });

    prisma.notification.create({
      data: {
        id:      uuidv4(),
        user_id: course.teacher_id,
        title:   'Course Rejected',
        message: `Your course "${course.title}" was rejected. Reason: ${reason}`,
      },
    }).catch(() => {});

    return updated;
  },

  async adminDeleteCourse(courseId: string) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw Object.assign(new Error('Course not found'), { statusCode: 404 });
    await prisma.course.delete({ where: { id: courseId } });
  },

  async togglePopular(courseId: string, is_popular: boolean) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw Object.assign(new Error('Not found'), { statusCode: 404 });
    return prisma.course.update({
      where:  { id: courseId },
      data:   { is_popular },
      select: { id: true, is_popular: true },
    });
  },

  async getLearnCourse(courseId: string, studentId: string) {
    console.log("Fetching enrollment for studentId:", studentId, "and courseId:", courseId)
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        student_id_course_id: {
          student_id: studentId,
          course_id:  courseId
        }
      }
    })
    console.log("Enrollment:", enrollment)
    if (!enrollment) throw Object.assign(
      new Error("Not enrolled"), { statusCode: 403 }
    )

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        teacher: {
          select: {
            id: true, name: true,
            avatar: true, bio: true
          }
        },
        category: {
          select: {
            id: true, name: true,
            parent: { select: { name: true } }
          }
        },
        objectives: { orderBy: { order: "asc" } },
        sections: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              include: {
                lessonQuizzes: {
                  orderBy: { order: "asc" },
                  include: {
                    questions: {
                      orderBy: { order: "asc" },
                      select: {
                        id: true,
                        type: true,
                        question: true,
                        options: true,
                        order: true,
                      }
                    },
                    attempts: {
                      where: { student_id: studentId },
                      select: {
                        id: true,
                        score: true,
                        submitted_at: true,
                      }
                    }
                  }
                },
                progress: {
                  where: { enrollment_id: enrollment.id },
                  select: { completed: true }
                }
              }
            }
          }
        },
        _count: { select: { enrollments: true } }
      }
    })

    if (!course) throw Object.assign(
      new Error("Course not found"), { statusCode: 404 }
    )

    return {
      course,
      enrollment: {
        id:       enrollment.id,
        progress: enrollment.progress,
        status:   enrollment.status,
      }
    }
  },

  async getCourseById(courseId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true, title: true, slug: true,
        subtitle: true, thumbnail: true, price: true,
        discount_price: true, discount_type: true, discount_ends_at: true,
      }
    });
    if (!course) throw Object.assign(
      new Error("Course not found"), { statusCode: 404 }
    );
    return course;
  },
};
