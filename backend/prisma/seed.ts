import {
  PrismaClient,
  Role,
  CourseLevel,
  CourseStatus,
  ObjectiveType,
  LessonType,
  EnrollmentStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@neonexor.com";
const ADMIN_PASSWORD = "123456";
const DEFAULT_USER_PASSWORD = "Password123";

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

async function main() {
  console.log("Seeding NeoNexor LMS database...\n");

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

  console.log("Existing seed data cleared.");

  const adminPasswordHash = await hashPassword(ADMIN_PASSWORD);
  const defaultUserPasswordHash = await hashPassword(DEFAULT_USER_PASSWORD);

  await prisma.user.create({
    data: {
      id: uuidv4(),
      name: "Super Admin",
      username: "superadmin",
      email: ADMIN_EMAIL,
      password_hash: adminPasswordHash,
      role: Role.ADMIN,
      email_verified: true,
    },
  });

  const [teacherJohn, teacherSarah, teacherAhmed] = await Promise.all([
    prisma.user.create({
      data: {
        id: uuidv4(),
        name: "Dr. John Smith",
        username: "drjohnsmith",
        email: "john@neonexor.com",
        password_hash: defaultUserPasswordHash,
        role: Role.TEACHER,
        bio: "Senior React & Frontend developer with 10+ years of experience.",
        email_verified: true,
      },
    }),
    prisma.user.create({
      data: {
        id: uuidv4(),
        name: "Sarah Johnson",
        username: "sarahjohnson",
        email: "sarah@neonexor.com",
        password_hash: defaultUserPasswordHash,
        role: Role.TEACHER,
        bio: "Full-stack Node.js expert and open-source contributor.",
        email_verified: true,
      },
    }),
    prisma.user.create({
      data: {
        id: uuidv4(),
        name: "Ahmed Hassan",
        username: "ahmedhassan",
        email: "ahmed@neonexor.com",
        password_hash: defaultUserPasswordHash,
        role: Role.TEACHER,
        bio: "Data Scientist with a PhD in Machine Learning.",
        email_verified: true,
      },
    }),
  ]);

  const [studentAlice, studentBob, studentCarol, studentDavid, studentEmma] =
    await Promise.all([
      prisma.user.create({
        data: {
          id: uuidv4(),
          name: "Alice Brown",
          username: "alicebrown",
          email: "alice@neonexor.com",
          password_hash: defaultUserPasswordHash,
          role: Role.STUDENT,
          email_verified: true,
        },
      }),
      prisma.user.create({
        data: {
          id: uuidv4(),
          name: "Bob Wilson",
          username: "bobwilson",
          email: "bob@neonexor.com",
          password_hash: defaultUserPasswordHash,
          role: Role.STUDENT,
          email_verified: true,
        },
      }),
      prisma.user.create({
        data: {
          id: uuidv4(),
          name: "Carol White",
          username: "carolwhite",
          email: "carol@neonexor.com",
          password_hash: defaultUserPasswordHash,
          role: Role.STUDENT,
          email_verified: true,
        },
      }),
      prisma.user.create({
        data: {
          id: uuidv4(),
          name: "David Lee",
          username: "davidlee",
          email: "david@neonexor.com",
          password_hash: defaultUserPasswordHash,
          role: Role.STUDENT,
          email_verified: true,
        },
      }),
      prisma.user.create({
        data: {
          id: uuidv4(),
          name: "Emma Davis",
          username: "emmadavis",
          email: "emma@neonexor.com",
          password_hash: defaultUserPasswordHash,
          role: Role.STUDENT,
          email_verified: true,
        },
      }),
    ]);

  console.log("Created users: 1 admin, 3 teachers, 5 students.");
  console.log(`Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`Teacher/student demo password: ${DEFAULT_USER_PASSWORD}`);

  const [catWeb, catMobile, catDataScience] = await Promise.all([
    prisma.category.create({
      data: {
        id: uuidv4(),
        name: "Web Development",
        slug: "web-development",
      },
    }),
    prisma.category.create({
      data: {
        id: uuidv4(),
        name: "Mobile Development",
        slug: "mobile-development",
      },
    }),
    prisma.category.create({
      data: {
        id: uuidv4(),
        name: "Data Science",
        slug: "data-science",
      },
    }),
  ]);

  const [catFrontend, catBackend] = await Promise.all([
    prisma.category.create({
      data: {
        id: uuidv4(),
        name: "Frontend Development",
        slug: "frontend-development",
        parent_id: catWeb.id,
      },
    }),
    prisma.category.create({
      data: {
        id: uuidv4(),
        name: "Backend Development",
        slug: "backend-development",
        parent_id: catWeb.id,
      },
    }),
    prisma.category.create({
      data: {
        id: uuidv4(),
        name: "React Native",
        slug: "react-native",
        parent_id: catMobile.id,
      },
    }),
    prisma.category.create({
      data: {
        id: uuidv4(),
        name: "Flutter",
        slug: "flutter",
        parent_id: catMobile.id,
      },
    }),
    prisma.category.create({
      data: {
        id: uuidv4(),
        name: "Machine Learning",
        slug: "machine-learning",
        parent_id: catDataScience.id,
      },
    }),
    prisma.category.create({
      data: {
        id: uuidv4(),
        name: "Data Analysis",
        slug: "data-analysis",
        parent_id: catDataScience.id,
      },
    }),
  ]);

  console.log("Created categories.");

  const courseDefs = [
    {
      teacher_id: teacherJohn.id,
      category_id: catFrontend.id,
      title: "Complete React Developer Bootcamp",
      slug: "complete-react-developer-bootcamp",
      subtitle: "Master React from fundamentals to advanced patterns",
      description:
        "A comprehensive React course covering components, hooks, state management, routing, testing, and deployment.",
      level: CourseLevel.INTERMEDIATE,
      price: 4999,
      thumbnail: "https://placehold.co/800x450?text=React+Bootcamp",
      welcome_message: "Welcome to the React Bootcamp!",
      congrats_message: "Congratulations on completing the React Bootcamp!",
      sections: [
        {
          title: "React Fundamentals",
          lessons: [
            {
              title: "Introduction to React",
              type: LessonType.VIDEO,
              video_urls: "https://example.com/react-intro",
              duration: 1800,
            },
            {
              title: "JSX and Components",
              type: LessonType.VIDEO,
              video_urls: "https://example.com/jsx",
              duration: 2100,
            },
            {
              title: "Props and State",
              type: LessonType.TEXT,
              content: "Understanding props and state in React...",
              duration: 1200,
            },
          ],
          quiz: {
            title: "React Fundamentals Quiz",
            questions: [
              {
                question: "What is JSX?",
                options: [
                  "JavaScript XML",
                  "Java Syntax Extension",
                  "JSON XML",
                  "JavaScript Extension",
                ],
                correct_answer: "JavaScript XML",
              },
              {
                question: "Which hook is used for state?",
                options: ["useEffect", "useState", "useContext", "useReducer"],
                correct_answer: "useState",
              },
              {
                question: "Props are used to pass data from?",
                options: [
                  "Child to parent",
                  "Parent to child",
                  "Server to client",
                  "Database to UI",
                ],
                correct_answer: "Parent to child",
              },
            ],
          },
        },
        {
          title: "Hooks and State Management",
          lessons: [
            {
              title: "useEffect Deep Dive",
              type: LessonType.VIDEO,
              video_urls: "https://example.com/useeffect",
              duration: 2400,
            },
            {
              title: "Context API",
              type: LessonType.VIDEO,
              video_urls: "https://example.com/context",
              duration: 1800,
            },
            {
              title: "Building Custom Hooks",
              type: LessonType.TEXT,
              content: "Custom hooks help reuse stateful logic...",
              duration: 1500,
            },
          ],
          quiz: {
            title: "Hooks Quiz",
            questions: [
              {
                question: "When does useEffect run by default?",
                options: [
                  "Before render",
                  "After every render",
                  "Only once",
                  "Never",
                ],
                correct_answer: "After every render",
              },
              {
                question: "What is Context API used for?",
                options: [
                  "Styling",
                  "Global state sharing",
                  "Routing",
                  "Testing",
                ],
                correct_answer: "Global state sharing",
              },
              {
                question: "Custom hooks must start with?",
                options: ["get", "set", "use", "hook"],
                correct_answer: "use",
              },
            ],
          },
        },
        {
          title: "Advanced React Patterns",
          lessons: [
            {
              title: "Performance Optimization",
              type: LessonType.VIDEO,
              video_urls: "https://example.com/performance",
              duration: 2700,
            },
            {
              title: "Testing React Apps",
              type: LessonType.VIDEO,
              video_urls: "https://example.com/testing",
              duration: 2100,
            },
            {
              title: "Deployment Strategies",
              type: LessonType.TEXT,
              content: "Deploying React apps to production...",
              duration: 900,
            },
          ],
          quiz: {
            title: "Advanced React Quiz",
            questions: [
              {
                question: "React.memo helps with?",
                options: ["Routing", "Caching renders", "API calls", "Styling"],
                correct_answer: "Caching renders",
              },
              {
                question: "Which library is common for React testing?",
                options: ["Jest", "Prisma", "Express", "Mongoose"],
                correct_answer: "Jest",
              },
              {
                question: "Vite is commonly used for?",
                options: [
                  "Database",
                  "Bundling/building",
                  "Authentication",
                  "Payments",
                ],
                correct_answer: "Bundling/building",
              },
            ],
          },
        },
      ],
      objectives: [
        {
          type: ObjectiveType.OBJECTIVE,
          content: "Build modern React applications from scratch",
        },
        {
          type: ObjectiveType.OBJECTIVE,
          content: "Use hooks and context effectively",
        },
        {
          type: ObjectiveType.REQUIREMENT,
          content: "Basic JavaScript knowledge required",
        },
        {
          type: ObjectiveType.REQUIREMENT,
          content: "Familiarity with HTML and CSS",
        },
        {
          type: ObjectiveType.TARGET_AUDIENCE,
          content: "Frontend developers and students",
        },
        {
          type: ObjectiveType.TARGET_AUDIENCE,
          content: "Developers transitioning to React",
        },
      ],
    },
    {
      teacher_id: teacherSarah.id,
      category_id: catBackend.id,
      title: "Node.js API Development Masterclass",
      slug: "nodejs-api-development-masterclass",
      subtitle: "Build scalable backend APIs with Node.js and Express",
      description:
        "Learn backend development with Node.js, Express, Prisma, authentication, validation, testing, and deployment.",
      level: CourseLevel.INTERMEDIATE,
      price: 3999,
      thumbnail: "https://placehold.co/800x450?text=Node.js+API",
      welcome_message: "Welcome to the Node.js Masterclass!",
      congrats_message: "You can now build production-grade APIs!",
      sections: [
        {
          title: "Node.js and Express Basics",
          lessons: [
            {
              title: "Introduction to Node.js",
              type: LessonType.VIDEO,
              video_urls: "https://example.com/node-intro",
              duration: 1800,
            },
            {
              title: "Express Routing",
              type: LessonType.VIDEO,
              video_urls: "https://example.com/express-routing",
              duration: 2100,
            },
            {
              title: "Middleware Concepts",
              type: LessonType.TEXT,
              content:
                "Middleware functions process requests before handlers...",
              duration: 1200,
            },
          ],
          quiz: {
            title: "Express REST API Quiz",
            questions: [
              {
                question: "What HTTP method is used to create a resource?",
                options: ["GET", "PUT", "POST", "DELETE"],
                correct_answer: "POST",
              },
              {
                question: "What is middleware in Express?",
                options: [
                  "A database layer",
                  "Functions that execute during request lifecycle",
                  "A routing function",
                  "A template engine",
                ],
                correct_answer:
                  "Functions that execute during request lifecycle",
              },
              {
                question: "Which status code indicates a resource was created?",
                options: ["200", "201", "204", "400"],
                correct_answer: "201",
              },
            ],
          },
        },
        {
          title: "Authentication and Security",
          lessons: [
            {
              title: "JWT Authentication",
              type: LessonType.VIDEO,
              video_urls: "https://example.com/jwt",
              duration: 2400,
            },
            {
              title: "Password Hashing with bcrypt",
              type: LessonType.VIDEO,
              video_urls: "https://example.com/bcrypt",
              duration: 1200,
            },
            {
              title: "Security Best Practices",
              type: LessonType.TEXT,
              content: "Helmet, rate limiting, CORS, and more...",
              duration: 900,
            },
          ],
          quiz: {
            title: "Auth & Security Quiz",
            questions: [
              {
                question: "What does JWT stand for?",
                options: [
                  "Java Web Token",
                  "JSON Web Token",
                  "JavaScript Web Transfer",
                  "Joint Web Technology",
                ],
                correct_answer: "JSON Web Token",
              },
              {
                question: "Why do we hash passwords?",
                options: [
                  "To compress them",
                  "To protect them in storage",
                  "To make them shorter",
                  "For performance",
                ],
                correct_answer: "To protect them in storage",
              },
              {
                question: "What does CORS stand for?",
                options: [
                  "Cross-Origin Resource Sharing",
                  "Client Object Request System",
                  "Core Origin Response Service",
                  "Cross Object Routing System",
                ],
                correct_answer: "Cross-Origin Resource Sharing",
              },
            ],
          },
        },
      ],
      objectives: [
        {
          type: ObjectiveType.OBJECTIVE,
          content: "Build production-ready REST APIs with Express and Node.js",
        },
        {
          type: ObjectiveType.OBJECTIVE,
          content: "Implement JWT authentication and authorization",
        },
        {
          type: ObjectiveType.REQUIREMENT,
          content: "Intermediate JavaScript knowledge required",
        },
        {
          type: ObjectiveType.REQUIREMENT,
          content: "Basic understanding of HTTP and REST",
        },
        {
          type: ObjectiveType.TARGET_AUDIENCE,
          content: "Frontend developers wanting to learn backend development",
        },
        {
          type: ObjectiveType.TARGET_AUDIENCE,
          content: "Developers building full-stack applications",
        },
      ],
    },
    {
      teacher_id: teacherAhmed.id,
      category_id: catDataScience.id,
      title: "Python for Data Science",
      slug: "python-for-data-science",
      subtitle: "From Python basics to data analysis",
      description:
        "Learn Python, NumPy, Pandas, Matplotlib, and introductory machine learning concepts.",
      level: CourseLevel.BEGINNER,
      price: 2999,
      thumbnail: "https://placehold.co/800x450?text=Python+Data+Science",
      welcome_message: "Welcome to the world of Data Science!",
      congrats_message: "Amazing! You are now a Data Science practitioner!",
      sections: [
        {
          title: "Python Fundamentals",
          lessons: [
            {
              title: "Python Syntax and Variables",
              type: LessonType.VIDEO,
              video_urls: "https://example.com/python-basics",
              duration: 1800,
            },
            {
              title: "Data Structures in Python",
              type: LessonType.VIDEO,
              video_urls: "https://example.com/python-ds",
              duration: 2100,
            },
            {
              title: "Functions and OOP",
              type: LessonType.TEXT,
              content:
                "Understanding functions, classes, and objects in Python...",
              duration: 1200,
            },
          ],
          quiz: {
            title: "Python Basics Quiz",
            questions: [
              {
                question: "Which data structure uses key-value pairs?",
                options: ["List", "Tuple", "Dictionary", "Set"],
                correct_answer: "Dictionary",
              },
              {
                question: "How do you define a function in Python?",
                options: [
                  "function myFunc():",
                  "def myFunc():",
                  "func myFunc():",
                  "define myFunc():",
                ],
                correct_answer: "def myFunc():",
              },
              {
                question: "What is the output of type(3.14)?",
                options: [
                  "<class int>",
                  "<class float>",
                  "<class number>",
                  "<class decimal>",
                ],
                correct_answer: "<class float>",
              },
            ],
          },
        },
        {
          title: "Data Analysis with Pandas",
          lessons: [
            {
              title: "Introduction to NumPy",
              type: LessonType.VIDEO,
              video_urls: "https://example.com/numpy",
              duration: 1500,
            },
            {
              title: "Pandas DataFrames",
              type: LessonType.VIDEO,
              video_urls: "https://example.com/pandas",
              duration: 2400,
            },
            {
              title: "Data Cleaning Techniques",
              type: LessonType.TEXT,
              content: "Handling missing values, outliers, and data types...",
              duration: 1800,
            },
          ],
          quiz: {
            title: "Pandas Data Analysis Quiz",
            questions: [
              {
                question: "What is a Pandas DataFrame?",
                options: [
                  "A list of lists",
                  "2D labeled data structure",
                  "A NumPy array",
                  "A Python dictionary",
                ],
                correct_answer: "2D labeled data structure",
              },
              {
                question: "Which method reads a CSV file in Pandas?",
                options: [
                  "pd.read_csv()",
                  "pd.load_csv()",
                  "pd.open_csv()",
                  "pd.import_csv()",
                ],
                correct_answer: "pd.read_csv()",
              },
              {
                question: "How do you handle missing values in Pandas?",
                options: [
                  "df.remove_na()",
                  "df.dropna() or df.fillna()",
                  "df.clean()",
                  "df.fix_null()",
                ],
                correct_answer: "df.dropna() or df.fillna()",
              },
            ],
          },
        },
        {
          title: "Data Visualization",
          lessons: [
            {
              title: "Matplotlib Basics",
              type: LessonType.VIDEO,
              video_urls: "https://example.com/matplotlib",
              duration: 1800,
            },
            {
              title: "Seaborn for Statistical Plots",
              type: LessonType.VIDEO,
              video_urls: "https://example.com/seaborn",
              duration: 1500,
            },
            {
              title: "Storytelling with Data",
              type: LessonType.TEXT,
              content:
                "Creating compelling visualizations that communicate insights...",
              duration: 900,
            },
          ],
          quiz: {
            title: "Data Visualization Quiz",
            questions: [
              {
                question: "Which library is built on top of Matplotlib?",
                options: ["NumPy", "Pandas", "Seaborn", "Scikit-learn"],
                correct_answer: "Seaborn",
              },
              {
                question: "Which plot is best for showing distribution?",
                options: ["Line chart", "Bar chart", "Histogram", "Pie chart"],
                correct_answer: "Histogram",
              },
              {
                question: "What does plt.show() do?",
                options: [
                  "Saves the plot",
                  "Displays the plot",
                  "Clears the plot",
                  "Exports the plot",
                ],
                correct_answer: "Displays the plot",
              },
            ],
          },
        },
      ],
      objectives: [
        {
          type: ObjectiveType.OBJECTIVE,
          content:
            "Analyze and visualize data using Python, Pandas, and Matplotlib",
        },
        {
          type: ObjectiveType.OBJECTIVE,
          content: "Understand core data science concepts and workflows",
        },
        {
          type: ObjectiveType.REQUIREMENT,
          content: "No prior programming experience needed",
        },
        {
          type: ObjectiveType.REQUIREMENT,
          content: "Basic mathematics understanding helpful",
        },
        {
          type: ObjectiveType.TARGET_AUDIENCE,
          content: "Aspiring data scientists and analysts",
        },
        {
          type: ObjectiveType.TARGET_AUDIENCE,
          content: "Business professionals wanting data-driven insights",
        },
      ],
    },
  ];

  const createdCourses = [];

  for (const def of courseDefs) {
    const { sections: sectionDefs, objectives, ...courseData } = def;

    const totalDuration = sectionDefs.reduce(
      (acc, section) =>
        acc + section.lessons.reduce((sum, lesson) => sum + lesson.duration, 0),
      0,
    );

    const course = await prisma.course.create({
      data: {
        id: uuidv4(),
        ...courseData,
        status: CourseStatus.APPROVED,
        duration: totalDuration,
        published_at: new Date(),
        is_popular: true,
      },
    });

    for (let i = 0; i < objectives.length; i += 1) {
      await prisma.courseObjective.create({
        data: {
          id: uuidv4(),
          course_id: course.id,
          ...objectives[i],
          order: i,
        },
      });
    }

    const allLessons: Array<{
      id: string;
      sectionIndex: number;
      lessonIndex: number;
    }> = [];

    for (
      let sectionIndex = 0;
      sectionIndex < sectionDefs.length;
      sectionIndex += 1
    ) {
      const sectionDef = sectionDefs[sectionIndex];
      const section = await prisma.section.create({
        data: {
          id: uuidv4(),
          course_id: course.id,
          title: sectionDef.title,
          order: sectionIndex,
        },
      });

      for (
        let lessonIndex = 0;
        lessonIndex < sectionDef.lessons.length;
        lessonIndex += 1
      ) {
        const lessonDef = sectionDef.lessons[lessonIndex];
        const lesson = await prisma.lesson.create({
          data: {
            id: uuidv4(),
            section_id: section.id,
            ...lessonDef,
            order: lessonIndex,
          },
        });

        allLessons.push({ id: lesson.id, sectionIndex, lessonIndex });
      }

      const quiz = await prisma.quiz.create({
        data: {
          id: uuidv4(),
          section_id: section.id,
          title: sectionDef.quiz.title,
          order: sectionIndex,
        },
      });

      for (
        let questionIndex = 0;
        questionIndex < sectionDef.quiz.questions.length;
        questionIndex += 1
      ) {
        const question = sectionDef.quiz.questions[questionIndex];
        await prisma.quizQuestion.create({
          data: {
            id: uuidv4(),
            quiz_id: quiz.id,
            ...question,
            order: questionIndex,
          },
        });
      }
    }

    createdCourses.push({ course, allLessons });
  }

  console.log(
    "Created courses with sections, lessons, quizzes, and objectives.",
  );

  const [reactCourse, nodeCourse, pythonCourse] = createdCourses;
  const reactLessons = reactCourse.allLessons;
  const totalReactLessons = reactLessons.length;

  const aliceEnrollment = await prisma.enrollment.create({
    data: {
      id: uuidv4(),
      student_id: studentAlice.id,
      course_id: reactCourse.course.id,
      status: EnrollmentStatus.ACTIVE,
      progress: 60,
    },
  });

  const aliceCompletedCount = Math.ceil(totalReactLessons * 0.6);

  for (let i = 0; i < totalReactLessons; i += 1) {
    await prisma.lessonProgress.create({
      data: {
        id: uuidv4(),
        enrollment_id: aliceEnrollment.id,
        lesson_id: reactLessons[i].id,
        completed: i < aliceCompletedCount,
        watch_seconds: i < aliceCompletedCount ? 900 : 300,
      },
    });
  }

  const bobEnrollment = await prisma.enrollment.create({
    data: {
      id: uuidv4(),
      student_id: studentBob.id,
      course_id: reactCourse.course.id,
      status: EnrollmentStatus.ACTIVE,
      progress: 30,
    },
  });

  const bobCompletedCount = Math.ceil(totalReactLessons * 0.3);

  for (let i = 0; i < totalReactLessons; i += 1) {
    await prisma.lessonProgress.create({
      data: {
        id: uuidv4(),
        enrollment_id: bobEnrollment.id,
        lesson_id: reactLessons[i].id,
        completed: i < bobCompletedCount,
        watch_seconds: i < bobCompletedCount ? 900 : 0,
      },
    });
  }

  await prisma.enrollment.create({
    data: {
      id: uuidv4(),
      student_id: studentCarol.id,
      course_id: nodeCourse.course.id,
      status: EnrollmentStatus.ACTIVE,
      progress: 0,
    },
  });

  await prisma.enrollment.create({
    data: {
      id: uuidv4(),
      student_id: studentDavid.id,
      course_id: nodeCourse.course.id,
      status: EnrollmentStatus.ACTIVE,
      progress: 0,
    },
  });

  await prisma.enrollment.create({
    data: {
      id: uuidv4(),
      student_id: studentEmma.id,
      course_id: pythonCourse.course.id,
      status: EnrollmentStatus.ACTIVE,
      progress: 0,
    },
  });

  console.log("Created enrollments and lesson progress.");

  await prisma.review.create({
    data: {
      id: uuidv4(),
      course_id: reactCourse.course.id,
      student_id: studentAlice.id,
      rating: 5,
      comment: "Excellent course!",
    },
  });

  await prisma.review.create({
    data: {
      id: uuidv4(),
      course_id: nodeCourse.course.id,
      student_id: studentCarol.id,
      rating: 4,
      comment: "Very helpful content",
    },
  });

  console.log("Created reviews.");

  // ─── System Settings ────────────────────────────────────────────────────────
  const settings = [
    // general
    { key: "site_name",       value: "NeoNexor LMS",        group: "general" },
    { key: "site_email",      value: "support@neonexor.com", group: "general" },
    { key: "site_phone",      value: "+1 (555) 000-1234",    group: "general" },
    { key: "site_address",    value: "",                     group: "general" },
    { key: "timezone",        value: "UTC",                  group: "general" },
    { key: "date_format",     value: "DD/MM/YYYY",           group: "general" },
    { key: "currency",        value: "BDT",                  group: "general" },
    { key: "currency_symbol", value: "৳",                    group: "general" },

    // seo
    { key: "meta_title",       value: "NeoNexor LMS - Learn Without Limits",                                                    group: "seo" },
    { key: "meta_description", value: "NeoNexor is a modern learning management system offering expert-led courses in tech, data science, and more.", group: "seo" },
    { key: "meta_keywords",    value: "LMS, online courses, React, Node.js, Python, data science",                               group: "seo" },
    { key: "og_title",         value: "",                    group: "seo" },
    { key: "og_description",   value: "",                    group: "seo" },
    { key: "og_image_url",     value: "",                    group: "seo" },
    { key: "ga_id",            value: "",                    group: "seo" },
    { key: "search_console",   value: "",                    group: "seo" },

    // appearance
    { key: "logo_url",    value: "", group: "appearance" },
    { key: "favicon_url", value: "", group: "appearance" },

    // certificate
    { key: "certificate_title",    value: "Certificate of Completion",       group: "certificate" },
    { key: "certificate_subtitle", value: "This is to certify that",         group: "certificate" },
    { key: "certificate_desc",     value: "has successfully completed the course", group: "certificate" },
    { key: "signatory_name",       value: "",                                group: "certificate" },
    { key: "signatory_title",      value: "",                                group: "certificate" },
    { key: "verify_url",           value: "https://neonexor.com/verify",     group: "certificate" },
    { key: "show_issue_date",      value: "true",                            group: "certificate" },
    { key: "show_course_name",     value: "true",                            group: "certificate" },

    // payment
    { key: "stripe_enabled",          value: "false", group: "payment" },
    { key: "paypal_enabled",          value: "false", group: "payment" },
    { key: "manual_payment_enabled",  value: "false", group: "payment" },

    // withdrawal
    { key: "min_withdrawal",    value: "500",        group: "withdrawal" },
    { key: "max_withdrawal",    value: "50000",       group: "withdrawal" },
    { key: "fee_type",          value: "percentage",  group: "withdrawal" },
    { key: "fee_value",         value: "5",           group: "withdrawal" },
    { key: "bank_enabled",      value: "false",       group: "withdrawal" },
    { key: "bkash_enabled",     value: "false",       group: "withdrawal" },
    { key: "paypal_w_enabled",  value: "false",       group: "withdrawal" },

    // frontend
    { key: "announcement_bar",     value: "false",                                 group: "frontend" },
    { key: "hero_banner",          value: "true",                                  group: "frontend" },
    { key: "hero_title",           value: "Learn Without Limits",                  group: "frontend" },
    { key: "hero_subtitle",        value: "Start, switch, or advance your career with courses from world-class instructors.", group: "frontend" },
    { key: "banner_image_url",     value: "",                                      group: "frontend" },
    { key: "featured_courses",     value: "true",                                  group: "frontend" },
    { key: "featured_count",       value: "6",                                     group: "frontend" },
    { key: "stats_section",        value: "true",                                  group: "frontend" },
    { key: "total_students",       value: "10,000+",                               group: "frontend" },
    { key: "total_courses",        value: "500+",                                  group: "frontend" },
    { key: "total_instructors",    value: "200+",                                  group: "frontend" },
    { key: "testimonials_section", value: "true",                                  group: "frontend" },
    { key: "footer_text",          value: "© 2025 NeoNexor. All rights reserved.", group: "frontend" },

    // language
    { key: "default_language",    value: "English", group: "language" },
    { key: "text_direction",      value: "LTR",     group: "language" },
    { key: "date_locale",         value: "en-US",   group: "language" },
    { key: "time_format",         value: "12h",     group: "language" },
    { key: "week_starts_on",      value: "Sunday",  group: "language" },
    { key: "number_format",       value: "1,000.00", group: "language" },
    { key: "decimal_separator",   value: ".",        group: "language" },
    { key: "thousands_separator", value: ",",        group: "language" },

    // notification
    { key: "email_notifications", value: "true", group: "notification" },
  ];

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: { id: uuidv4(), ...setting },
    });
  }

  console.log("Created system settings.");

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

  console.log("\nDatabase Summary:");
  console.log(`Users: ${counts[0]}`);
  console.log(`Categories: ${counts[1]}`);
  console.log(`Courses: ${counts[2]}`);
  console.log(`Sections: ${counts[3]}`);
  console.log(`Lessons: ${counts[4]}`);
  console.log(`Quizzes: ${counts[5]}`);
  console.log(`Quiz Questions: ${counts[6]}`);
  console.log(`Course Objectives: ${counts[7]}`);
  console.log(`Enrollments: ${counts[8]}`);
  console.log(`Lesson Progress: ${counts[9]}`);
  console.log(`Reviews: ${counts[10]}`);
  console.log(`System Settings: ${counts[11]}`);
  console.log("\nSeeding complete.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });