import { PrismaClient, Role, CourseLevel, CourseStatus, ObjectiveType, LessonType, EnrollmentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

async function main() {
  console.log('🌱 Seeding NeoNexor LMS database...\n');

  // ─── Clean existing data (order respects FK constraints) ──────────────────
  await prisma.systemSetting.deleteMany();
  await prisma.loginHistory.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.withdrawal.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.review.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.section.deleteMany();
  await prisma.courseObjective.deleteMany();
  await prisma.course.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  console.log('✓ Cleared existing data');

  // ─── USERS ─────────────────────────────────────────────────────────────────
  const password = await hashPassword('Password123');

  const admin = await prisma.user.create({
    data: {
      id: uuidv4(),
      name: 'Super Admin',
      username: 'superadmin',
      email: 'admin@neonexor.com',
      password_hash: password,
      role: Role.ADMIN,
      email_verified: true,
    },
  });

  const [teacherJohn, teacherSarah, teacherAhmed] = await Promise.all([
    prisma.user.create({
      data: {
        id: uuidv4(),
        name: 'Dr. John Smith',
        username: 'drjohnsmith',
        email: 'john@neonexor.com',
        password_hash: password,
        role: Role.TEACHER,
        bio: 'Senior React & Frontend developer with 10+ years of experience.',
        email_verified: true,
      },
    }),
    prisma.user.create({
      data: {
        id: uuidv4(),
        name: 'Sarah Johnson',
        username: 'sarahjohnson',
        email: 'sarah@neonexor.com',
        password_hash: password,
        role: Role.TEACHER,
        bio: 'Full-stack Node.js expert and open-source contributor.',
        email_verified: true,
      },
    }),
    prisma.user.create({
      data: {
        id: uuidv4(),
        name: 'Ahmed Hassan',
        username: 'ahmedhassan',
        email: 'ahmed@neonexor.com',
        password_hash: password,
        role: Role.TEACHER,
        bio: 'Data Scientist with a PhD in Machine Learning.',
        email_verified: true,
      },
    }),
  ]);

  const [studentAlice, studentBob, studentCarol, studentDavid, studentEmma] = await Promise.all([
    prisma.user.create({
      data: { id: uuidv4(), name: 'Alice Brown', username: 'alicebrown', email: 'alice@neonexor.com', password_hash: password, role: Role.STUDENT, email_verified: true },
    }),
    prisma.user.create({
      data: { id: uuidv4(), name: 'Bob Wilson', username: 'bobwilson', email: 'bob@neonexor.com', password_hash: password, role: Role.STUDENT, email_verified: true },
    }),
    prisma.user.create({
      data: { id: uuidv4(), name: 'Carol White', username: 'carolwhite', email: 'carol@neonexor.com', password_hash: password, role: Role.STUDENT, email_verified: true },
    }),
    prisma.user.create({
      data: { id: uuidv4(), name: 'David Lee', username: 'davidlee', email: 'david@neonexor.com', password_hash: password, role: Role.STUDENT, email_verified: true },
    }),
    prisma.user.create({
      data: { id: uuidv4(), name: 'Emma Davis', username: 'emmadavis', email: 'emma@neonexor.com', password_hash: password, role: Role.STUDENT, email_verified: true },
    }),
  ]);

  console.log(`✓ Created 9 users (1 admin, 3 teachers, 5 students)`);

  // ─── CATEGORIES ────────────────────────────────────────────────────────────
  const [catWeb, catMobile, catDataScience] = await Promise.all([
    prisma.category.create({ data: { id: uuidv4(), name: 'Web Development', slug: 'web-development' } }),
    prisma.category.create({ data: { id: uuidv4(), name: 'Mobile Development', slug: 'mobile-development' } }),
    prisma.category.create({ data: { id: uuidv4(), name: 'Data Science', slug: 'data-science' } }),
  ]);

  const [catFrontend, catBackend, catReactNative, catFlutter, catML, catDataAnalysis] = await Promise.all([
    prisma.category.create({ data: { id: uuidv4(), name: 'Frontend Development', slug: 'frontend-development', parent_id: catWeb.id } }),
    prisma.category.create({ data: { id: uuidv4(), name: 'Backend Development', slug: 'backend-development', parent_id: catWeb.id } }),
    prisma.category.create({ data: { id: uuidv4(), name: 'React Native', slug: 'react-native', parent_id: catMobile.id } }),
    prisma.category.create({ data: { id: uuidv4(), name: 'Flutter', slug: 'flutter', parent_id: catMobile.id } }),
    prisma.category.create({ data: { id: uuidv4(), name: 'Machine Learning', slug: 'machine-learning', parent_id: catDataScience.id } }),
    prisma.category.create({ data: { id: uuidv4(), name: 'Data Analysis', slug: 'data-analysis', parent_id: catDataScience.id } }),
  ]);

  console.log('✓ Created 9 categories (3 parent, 6 child)');

  // ─── COURSES ───────────────────────────────────────────────────────────────
  const courseDefs = [
    {
      teacher_id: teacherJohn.id,
      category_id: catFrontend.id,
      title: 'Complete React Course',
      slug: 'complete-react-course',
      subtitle: 'Master React from zero to production',
      description: 'A comprehensive React course covering hooks, state management, routing, and real-world projects.',
      level: CourseLevel.BEGINNER,
      price: 1999,
      thumbnail: 'https://placehold.co/800x450?text=React+Course',
      welcome_message: 'Welcome! Get ready to master React.',
      congrats_message: 'Congratulations! You are now a React developer.',
      sections: [
        {
          title: 'React Fundamentals',
          lessons: [
            { title: 'Introduction to React', type: LessonType.VIDEO, video_url: 'https://example.com/react-intro', duration: 900 },
            { title: 'JSX and Components', type: LessonType.VIDEO, video_url: 'https://example.com/jsx', duration: 1200 },
            { title: 'Props and State', type: LessonType.TEXT, content: 'Learn about props and state in React...', duration: 600 },
          ],
          quiz: {
            title: 'React Fundamentals Quiz',
            questions: [
              { question: 'What is JSX?', options: ['A CSS framework', 'JavaScript XML syntax extension', 'A database', 'A build tool'], correct_answer: 'JavaScript XML syntax extension' },
              { question: 'What hook is used for state management?', options: ['useEffect', 'useContext', 'useState', 'useRef'], correct_answer: 'useState' },
              { question: 'What does props stand for?', options: ['Properties', 'Proposals', 'Prototypes', 'Procedures'], correct_answer: 'Properties' },
            ],
          },
        },
        {
          title: 'React Hooks Deep Dive',
          lessons: [
            { title: 'useEffect Hook', type: LessonType.VIDEO, video_url: 'https://example.com/useeffect', duration: 1500 },
            { title: 'Custom Hooks', type: LessonType.VIDEO, video_url: 'https://example.com/custom-hooks', duration: 1800 },
            { title: 'Context API', type: LessonType.TEXT, content: 'Understanding Context API for global state...', duration: 900 },
          ],
          quiz: {
            title: 'React Hooks Quiz',
            questions: [
              { question: 'When does useEffect run by default?', options: ['Only once', 'After every render', 'Before render', 'Never'], correct_answer: 'After every render' },
              { question: 'What is the purpose of useContext?', options: ['State management', 'Consuming context values', 'Side effects', 'Refs'], correct_answer: 'Consuming context values' },
              { question: 'What array controls useEffect re-runs?', options: ['State array', 'Props array', 'Dependency array', 'Ref array'], correct_answer: 'Dependency array' },
            ],
          },
        },
        {
          title: 'Building Real-World Apps',
          lessons: [
            { title: 'React Router Setup', type: LessonType.VIDEO, video_url: 'https://example.com/router', duration: 1200 },
            { title: 'API Integration', type: LessonType.VIDEO, video_url: 'https://example.com/api', duration: 2100 },
            { title: 'Project: Todo App', type: LessonType.VIDEO, video_url: 'https://example.com/todo', duration: 3600 },
          ],
          quiz: {
            title: 'Real-World React Quiz',
            questions: [
              { question: 'Which library is used for routing in React?', options: ['React-DOM', 'React Router', 'Next.js', 'Redux'], correct_answer: 'React Router' },
              { question: 'Which hook handles async data fetching?', options: ['useState', 'useMemo', 'useEffect', 'useCallback'], correct_answer: 'useEffect' },
              { question: 'What method sends a POST request with fetch?', options: ['fetch.post()', 'fetch(url, {method:"POST"})', 'axios.post()', 'request.post()'], correct_answer: 'fetch(url, {method:"POST"})' },
            ],
          },
        },
      ],
      objectives: [
        { type: ObjectiveType.OBJECTIVE, content: 'Build modern React applications with hooks and functional components' },
        { type: ObjectiveType.OBJECTIVE, content: 'Understand state management and the Context API' },
        { type: ObjectiveType.REQUIREMENT, content: 'Basic JavaScript knowledge required' },
        { type: ObjectiveType.REQUIREMENT, content: 'HTML & CSS fundamentals' },
        { type: ObjectiveType.TARGET_AUDIENCE, content: 'JavaScript developers who want to learn React' },
        { type: ObjectiveType.TARGET_AUDIENCE, content: 'Beginners looking to enter frontend development' },
      ],
    },
    {
      teacher_id: teacherSarah.id,
      category_id: catBackend.id,
      title: 'Node.js Masterclass',
      slug: 'nodejs-masterclass',
      subtitle: 'Build scalable backends with Node.js',
      description: 'Master Node.js, Express, REST APIs, authentication, databases, and deployment.',
      level: CourseLevel.INTERMEDIATE,
      price: 2499,
      thumbnail: 'https://placehold.co/800x450?text=Node.js+Masterclass',
      welcome_message: 'Welcome to the Node.js Masterclass!',
      congrats_message: 'You are now a Node.js backend developer!',
      sections: [
        {
          title: 'Node.js Core Concepts',
          lessons: [
            { title: 'Node.js Architecture', type: LessonType.VIDEO, video_url: 'https://example.com/node-arch', duration: 1200 },
            { title: 'Modules and NPM', type: LessonType.VIDEO, video_url: 'https://example.com/modules', duration: 900 },
            { title: 'Async Programming', type: LessonType.TEXT, content: 'Deep dive into Promises and async/await...', duration: 1500 },
          ],
          quiz: {
            title: 'Node.js Core Quiz',
            questions: [
              { question: 'What is the event loop?', options: ['A loop in JavaScript', 'Node.js concurrency mechanism', 'A timer function', 'A database concept'], correct_answer: 'Node.js concurrency mechanism' },
              { question: 'What does npm stand for?', options: ['Node Package Manager', 'New Project Module', 'Node Process Manager', 'Network Package Module'], correct_answer: 'Node Package Manager' },
              { question: 'Which keyword is used to import modules in CommonJS?', options: ['import', 'require', 'include', 'fetch'], correct_answer: 'require' },
            ],
          },
        },
        {
          title: 'Building REST APIs with Express',
          lessons: [
            { title: 'Express Routing', type: LessonType.VIDEO, video_url: 'https://example.com/express-routes', duration: 1800 },
            { title: 'Middleware Deep Dive', type: LessonType.VIDEO, video_url: 'https://example.com/middleware', duration: 1500 },
            { title: 'Error Handling', type: LessonType.TEXT, content: 'Global error handling patterns in Express...', duration: 600 },
          ],
          quiz: {
            title: 'Express REST API Quiz',
            questions: [
              { question: 'What HTTP method is used to create a resource?', options: ['GET', 'PUT', 'POST', 'DELETE'], correct_answer: 'POST' },
              { question: 'What is middleware in Express?', options: ['A database layer', 'Functions that execute during request lifecycle', 'A routing function', 'A template engine'], correct_answer: 'Functions that execute during request lifecycle' },
              { question: 'Which status code indicates a resource was created?', options: ['200', '201', '204', '400'], correct_answer: '201' },
            ],
          },
        },
        {
          title: 'Authentication and Security',
          lessons: [
            { title: 'JWT Authentication', type: LessonType.VIDEO, video_url: 'https://example.com/jwt', duration: 2400 },
            { title: 'Password Hashing with bcrypt', type: LessonType.VIDEO, video_url: 'https://example.com/bcrypt', duration: 1200 },
            { title: 'Security Best Practices', type: LessonType.TEXT, content: 'Helmet, rate limiting, CORS, and more...', duration: 900 },
          ],
          quiz: {
            title: 'Auth & Security Quiz',
            questions: [
              { question: 'What does JWT stand for?', options: ['Java Web Token', 'JSON Web Token', 'JavaScript Web Transfer', 'Joint Web Technology'], correct_answer: 'JSON Web Token' },
              { question: 'Why do we hash passwords?', options: ['To compress them', 'To encrypt for storage safety', 'To make them shorter', 'For performance'], correct_answer: 'To encrypt for storage safety' },
              { question: 'What does CORS stand for?', options: ['Cross-Origin Resource Sharing', 'Client Object Request System', 'Core Origin Response Service', 'Cross Object Routing System'], correct_answer: 'Cross-Origin Resource Sharing' },
            ],
          },
        },
      ],
      objectives: [
        { type: ObjectiveType.OBJECTIVE, content: 'Build production-ready REST APIs with Express and Node.js' },
        { type: ObjectiveType.OBJECTIVE, content: 'Implement JWT authentication and authorization' },
        { type: ObjectiveType.REQUIREMENT, content: 'Intermediate JavaScript knowledge required' },
        { type: ObjectiveType.REQUIREMENT, content: 'Basic understanding of HTTP and REST' },
        { type: ObjectiveType.TARGET_AUDIENCE, content: 'Frontend developers wanting to learn backend development' },
        { type: ObjectiveType.TARGET_AUDIENCE, content: 'Developers building full-stack applications' },
      ],
    },
    {
      teacher_id: teacherAhmed.id,
      category_id: catDataScience.id,
      title: 'Python for Data Science',
      slug: 'python-for-data-science',
      subtitle: 'From Python basics to data analysis',
      description: 'Learn Python, NumPy, Pandas, Matplotlib, and introductory machine learning concepts.',
      level: CourseLevel.BEGINNER,
      price: 2999,
      thumbnail: 'https://placehold.co/800x450?text=Python+Data+Science',
      welcome_message: 'Welcome to the world of Data Science!',
      congrats_message: 'Amazing! You are now a Data Science practitioner!',
      sections: [
        {
          title: 'Python Fundamentals',
          lessons: [
            { title: 'Python Syntax and Variables', type: LessonType.VIDEO, video_url: 'https://example.com/python-basics', duration: 1800 },
            { title: 'Data Structures in Python', type: LessonType.VIDEO, video_url: 'https://example.com/python-ds', duration: 2100 },
            { title: 'Functions and OOP', type: LessonType.TEXT, content: 'Understanding functions, classes, and objects in Python...', duration: 1200 },
          ],
          quiz: {
            title: 'Python Basics Quiz',
            questions: [
              { question: 'Which data structure uses key-value pairs?', options: ['List', 'Tuple', 'Dictionary', 'Set'], correct_answer: 'Dictionary' },
              { question: 'How do you define a function in Python?', options: ['function myFunc():', 'def myFunc():', 'func myFunc():', 'define myFunc():'], correct_answer: 'def myFunc():' },
              { question: 'What is the output of type(3.14)?', options: ['<class int>', '<class float>', '<class number>', '<class decimal>'], correct_answer: '<class float>' },
            ],
          },
        },
        {
          title: 'Data Analysis with Pandas',
          lessons: [
            { title: 'Introduction to NumPy', type: LessonType.VIDEO, video_url: 'https://example.com/numpy', duration: 1500 },
            { title: 'Pandas DataFrames', type: LessonType.VIDEO, video_url: 'https://example.com/pandas', duration: 2400 },
            { title: 'Data Cleaning Techniques', type: LessonType.TEXT, content: 'Handling missing values, outliers, and data types...', duration: 1800 },
          ],
          quiz: {
            title: 'Pandas Data Analysis Quiz',
            questions: [
              { question: 'What is a Pandas DataFrame?', options: ['A list of lists', '2D labeled data structure', 'A NumPy array', 'A Python dictionary'], correct_answer: '2D labeled data structure' },
              { question: 'Which method reads a CSV file in Pandas?', options: ['pd.read_csv()', 'pd.load_csv()', 'pd.open_csv()', 'pd.import_csv()'], correct_answer: 'pd.read_csv()' },
              { question: 'How do you handle missing values in Pandas?', options: ['df.remove_na()', 'df.dropna() or df.fillna()', 'df.clean()', 'df.fix_null()'], correct_answer: 'df.dropna() or df.fillna()' },
            ],
          },
        },
        {
          title: 'Data Visualization',
          lessons: [
            { title: 'Matplotlib Basics', type: LessonType.VIDEO, video_url: 'https://example.com/matplotlib', duration: 1800 },
            { title: 'Seaborn for Statistical Plots', type: LessonType.VIDEO, video_url: 'https://example.com/seaborn', duration: 1500 },
            { title: 'Storytelling with Data', type: LessonType.TEXT, content: 'Creating compelling visualizations that communicate insights...', duration: 900 },
          ],
          quiz: {
            title: 'Data Visualization Quiz',
            questions: [
              { question: 'Which library is built on top of Matplotlib?', options: ['NumPy', 'Pandas', 'Seaborn', 'Scikit-learn'], correct_answer: 'Seaborn' },
              { question: 'Which plot is best for showing distribution?', options: ['Line chart', 'Bar chart', 'Histogram', 'Pie chart'], correct_answer: 'Histogram' },
              { question: 'What does plt.show() do?', options: ['Saves the plot', 'Displays the plot', 'Clears the plot', 'Exports the plot'], correct_answer: 'Displays the plot' },
            ],
          },
        },
      ],
      objectives: [
        { type: ObjectiveType.OBJECTIVE, content: 'Analyze and visualize data using Python, Pandas, and Matplotlib' },
        { type: ObjectiveType.OBJECTIVE, content: 'Understand core data science concepts and workflows' },
        { type: ObjectiveType.REQUIREMENT, content: 'No prior programming experience needed' },
        { type: ObjectiveType.REQUIREMENT, content: 'Basic mathematics understanding helpful' },
        { type: ObjectiveType.TARGET_AUDIENCE, content: 'Aspiring data scientists and analysts' },
        { type: ObjectiveType.TARGET_AUDIENCE, content: 'Business professionals wanting data-driven insights' },
      ],
    },
  ];

  const createdCourses = [];

  for (const def of courseDefs) {
    const { sections: sectionDefs, objectives, ...courseData } = def;

    const totalDuration = sectionDefs.reduce(
      (acc, s) => acc + s.lessons.reduce((a, l) => a + l.duration, 0),
      0
    );

    const course = await prisma.course.create({
      data: {
        id: uuidv4(),
        ...courseData,
        price: courseData.price,
        status: CourseStatus.APPROVED,
        duration: totalDuration,
        published_at: new Date(),
        is_popular: true,
      },
    });

    // Objectives
    for (let i = 0; i < objectives.length; i++) {
      await prisma.courseObjective.create({
        data: { id: uuidv4(), course_id: course.id, ...objectives[i], order: i },
      });
    }

    // Sections, lessons, quizzes
    const allLessons: { id: string; sectionIndex: number; lessonIndex: number }[] = [];

    for (let si = 0; si < sectionDefs.length; si++) {
      const sectionDef = sectionDefs[si];
      const section = await prisma.section.create({
        data: { id: uuidv4(), course_id: course.id, title: sectionDef.title, order: si },
      });

      for (let li = 0; li < sectionDef.lessons.length; li++) {
        const lessonDef = sectionDef.lessons[li];
        const lesson = await prisma.lesson.create({
          data: { id: uuidv4(), section_id: section.id, ...lessonDef, order: li },
        });
        allLessons.push({ id: lesson.id, sectionIndex: si, lessonIndex: li });
      }

      const quiz = await prisma.quiz.create({
        data: { id: uuidv4(), section_id: section.id, title: sectionDef.quiz.title, order: si },
      });

      for (let qi = 0; qi < sectionDef.quiz.questions.length; qi++) {
        const q = sectionDef.quiz.questions[qi];
        await prisma.quizQuestion.create({
          data: { id: uuidv4(), quiz_id: quiz.id, ...q, order: qi },
        });
      }
    }

    createdCourses.push({ course, allLessons });
  }

  console.log('✓ Created 3 courses with sections, lessons, quizzes, and objectives');

  // ─── ENROLLMENTS & LESSON PROGRESS ────────────────────────────────────────
  const [reactCourse, nodeCourse, pythonCourse] = createdCourses;

  // React Course: Alice (60%) and Bob (30%)
  const reactLessons = reactCourse.allLessons;
  const totalReactLessons = reactLessons.length; // 9

  const aliceEnrollment = await prisma.enrollment.create({
    data: { id: uuidv4(), student_id: studentAlice.id, course_id: reactCourse.course.id, status: EnrollmentStatus.ACTIVE, progress: 60 },
  });
  // Alice: complete first 5 lessons (≈60% of 9)
  const aliceCompletedCount = Math.ceil(totalReactLessons * 0.6);
  for (let i = 0; i < totalReactLessons; i++) {
    await prisma.lessonProgress.create({
      data: { id: uuidv4(), enrollment_id: aliceEnrollment.id, lesson_id: reactLessons[i].id, completed: i < aliceCompletedCount, watch_seconds: i < aliceCompletedCount ? 900 : 300 },
    });
  }

  const bobEnrollment = await prisma.enrollment.create({
    data: { id: uuidv4(), student_id: studentBob.id, course_id: reactCourse.course.id, status: EnrollmentStatus.ACTIVE, progress: 30 },
  });
  // Bob: complete first 3 lessons (≈30% of 9)
  const bobCompletedCount = Math.ceil(totalReactLessons * 0.3);
  for (let i = 0; i < totalReactLessons; i++) {
    await prisma.lessonProgress.create({
      data: { id: uuidv4(), enrollment_id: bobEnrollment.id, lesson_id: reactLessons[i].id, completed: i < bobCompletedCount, watch_seconds: i < bobCompletedCount ? 900 : 0 },
    });
  }

  // Node.js Course: Carol and David (default progress)
  await prisma.enrollment.create({
    data: { id: uuidv4(), student_id: studentCarol.id, course_id: nodeCourse.course.id, status: EnrollmentStatus.ACTIVE, progress: 0 },
  });
  await prisma.enrollment.create({
    data: { id: uuidv4(), student_id: studentDavid.id, course_id: nodeCourse.course.id, status: EnrollmentStatus.ACTIVE, progress: 0 },
  });

  // Python Course: Emma (default progress)
  await prisma.enrollment.create({
    data: { id: uuidv4(), student_id: studentEmma.id, course_id: pythonCourse.course.id, status: EnrollmentStatus.ACTIVE, progress: 0 },
  });

  console.log('✓ Created 5 enrollments with lesson progress for Alice (60%) and Bob (30%)');

  // ─── REVIEWS ───────────────────────────────────────────────────────────────
  await prisma.review.create({
    data: { id: uuidv4(), course_id: reactCourse.course.id, student_id: studentAlice.id, rating: 5, comment: 'Excellent course!' },
  });
  await prisma.review.create({
    data: { id: uuidv4(), course_id: nodeCourse.course.id, student_id: studentCarol.id, rating: 4, comment: 'Very helpful content' },
  });

  console.log('✓ Created 2 reviews');

  // ─── SYSTEM SETTINGS ───────────────────────────────────────────────────────
  const settings = [
    { key: 'site_name', value: 'NeoNexor LMS', group: 'general' },
    { key: 'site_email', value: 'support@neonexor.com', group: 'general' },
    { key: 'site_phone', value: '+1 (555) 000-1234', group: 'general' },
    { key: 'timezone', value: 'UTC', group: 'general' },
    { key: 'meta_title', value: 'NeoNexor LMS - Learn Without Limits', group: 'seo' },
    { key: 'meta_description', value: 'NeoNexor is a modern learning management system offering expert-led courses in tech, data science, and more.', group: 'seo' },
    { key: 'meta_keywords', value: 'LMS, online courses, React, Node.js, Python, data science', group: 'seo' },
    { key: 'email_notifications', value: 'true', group: 'notification' },
    { key: 'certificate_title', value: 'Certificate of Completion', group: 'certificate' },
    { key: 'verify_url', value: 'https://neonexor.com/verify', group: 'certificate' },
  ];

  for (const s of settings) {
    await prisma.systemSetting.create({ data: { id: uuidv4(), ...s } });
  }

  console.log('✓ Created 10 system settings');

  // ─── Summary ───────────────────────────────────────────────────────────────
  const counts = await Promise.all([
    prisma.user.count(),
    prisma.category.count(),
    prisma.course.count(),
    prisma.section.count(),
    prisma.lesson.count(),
    prisma.quiz.count(),
    prisma.quizQuestion.count(),
    prisma.courseObjective.count(),
    prisma.enrollment.count(),
    prisma.lessonProgress.count(),
    prisma.review.count(),
    prisma.systemSetting.count(),
  ]);

  console.log('\n📊 Database Summary:');
  console.log(`   Users:            ${counts[0]}`);
  console.log(`   Categories:       ${counts[1]}`);
  console.log(`   Courses:          ${counts[2]}`);
  console.log(`   Sections:         ${counts[3]}`);
  console.log(`   Lessons:          ${counts[4]}`);
  console.log(`   Quizzes:          ${counts[5]}`);
  console.log(`   Quiz Questions:   ${counts[6]}`);
  console.log(`   Course Objectives:${counts[7]}`);
  console.log(`   Enrollments:      ${counts[8]}`);
  console.log(`   Lesson Progress:  ${counts[9]}`);
  console.log(`   Reviews:          ${counts[10]}`);
  console.log(`   System Settings:  ${counts[11]}`);
  console.log('\n✅ Seeding complete!');
}

main().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
