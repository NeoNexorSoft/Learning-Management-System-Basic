export const mockStudent = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  avatar: "",
  enrolledCourses: 6,
  completedCourses: 2,
  pendingAssignments: 3,
}

export const mockCourses = [
  { id: "1", title: "Web Development Bootcamp", teacher: "Jane Smith", progress: 65, category: "Programming", status: "in-progress", thumbnail: "", totalLessons: 48, completedLessons: 31 },
  { id: "2", title: "UI/UX Design Fundamentals", teacher: "Alice Johnson", progress: 100, category: "Design", status: "completed", thumbnail: "", totalLessons: 24, completedLessons: 24 },
  { id: "3", title: "Data Structures & Algorithms", teacher: "Bob Williams", progress: 20, category: "CS", status: "in-progress", thumbnail: "", totalLessons: 60, completedLessons: 12 },
]

export const mockAssignments = [
  { id: "1", title: "Build a REST API", course: "Web Development Bootcamp", dueDate: "2026-04-25", status: "pending", marks: null, totalMarks: 100 },
  { id: "2", title: "Design a Dashboard", course: "UI/UX Design Fundamentals", dueDate: "2026-04-10", status: "submitted", marks: null, totalMarks: 50 },
  { id: "3", title: "Implement Binary Search", course: "Data Structures & Algorithms", dueDate: "2026-04-15", status: "graded", marks: 85, totalMarks: 100 },
]

export const mockResults = [
  { id: "1", course: "UI/UX Design Fundamentals", assignment: "Design a Dashboard", marks: 45, totalMarks: 50, grade: "A", date: "2026-04-01" },
  { id: "2", course: "Data Structures & Algorithms", assignment: "Implement Binary Search", marks: 85, totalMarks: 100, grade: "B+", date: "2026-04-10" },
]

// ── Teacher mock data ─────────────────────────────────────────────────────

export const mockTeacher = {
  id: "1",
  firstName: "Jane",
  lastName: "Smith",
  email: "jane@example.com",
  mobile: "+880 1700-000000",
  bio: "Passionate educator with 10+ years of experience in web development and software engineering.",
  avatar: "",
}

export const mockTeacherCourses = [
  { id: "1", title: "Web Development Bootcamp", subtitle: "Master HTML, CSS, JavaScript & React from scratch", category: "Programming", level: "Beginner", price: 1500, totalStudents: 245, totalLessons: 48, status: "approved", thumbnail: "", createdAt: "2025-01-15", publishedDate: "2025-02-01", rating: 4.8, totalReviews: 32, totalEarnings: 367500 },
  { id: "2", title: "Advanced React Patterns", subtitle: "Hooks, Context API, Performance Optimization & Testing", category: "Programming", level: "Advanced", price: 1200, totalStudents: 128, totalLessons: 32, status: "approved", thumbnail: "", createdAt: "2025-03-20", publishedDate: "2025-04-05", rating: 4.6, totalReviews: 18, totalEarnings: 153600 },
  { id: "3", title: "Node.js Masterclass", subtitle: "Build scalable REST APIs with Node.js & Express", category: "Programming", level: "Intermediate", price: 1800, totalStudents: 12, totalLessons: 24, status: "pending", thumbnail: "", createdAt: "2026-04-10", publishedDate: null, rating: 0, totalReviews: 0, totalEarnings: 0 },
  { id: "4", title: "Database Design Fundamentals", subtitle: "SQL, NoSQL, ER Diagrams and Data Modeling", category: "CS", level: "Beginner", price: 900, totalStudents: 0, totalLessons: 0, status: "draft", thumbnail: "", createdAt: "2026-04-18", publishedDate: null, rating: 0, totalReviews: 0, totalEarnings: 0 },
]

export const mockEnrollments = [
  { id: "1", studentName: "John Doe", studentEmail: "john@example.com", courseTitle: "Web Development Bootcamp", enrolledAt: "2026-01-10", progress: 65, status: "active" },
  { id: "2", studentName: "Alice Brown", studentEmail: "alice@example.com", courseTitle: "Web Development Bootcamp", enrolledAt: "2026-02-05", progress: 30, status: "active" },
  { id: "3", studentName: "Bob Wilson", studentEmail: "bob@example.com", courseTitle: "Advanced React Patterns", enrolledAt: "2026-03-15", progress: 100, status: "completed" },
  { id: "4", studentName: "Carol Davis", studentEmail: "carol@example.com", courseTitle: "Advanced React Patterns", enrolledAt: "2026-03-22", progress: 55, status: "active" },
  { id: "5", studentName: "David Lee", studentEmail: "david@example.com", courseTitle: "Web Development Bootcamp", enrolledAt: "2026-04-01", progress: 10, status: "active" },
]

export const mockTeacherStudents = [
  { id: "1", name: "John Doe", email: "john@example.com", avatar: "", coursesEnrolled: 2, progress: 65, lastActive: "2026-04-17" },
  { id: "2", name: "Alice Brown", email: "alice@example.com", avatar: "", coursesEnrolled: 1, progress: 30, lastActive: "2026-04-15" },
  { id: "3", name: "Bob Wilson", email: "bob@example.com", avatar: "", coursesEnrolled: 1, progress: 100, lastActive: "2026-04-10" },
  { id: "4", name: "Carol Davis", email: "carol@example.com", avatar: "", coursesEnrolled: 1, progress: 55, lastActive: "2026-04-12" },
  { id: "5", name: "David Lee", email: "david@example.com", avatar: "", coursesEnrolled: 1, progress: 10, lastActive: "2026-04-16" },
]

export const mockTransactions = [
  { id: "1", studentName: "John Doe", course: "Web Development Bootcamp", amount: 1500, date: "2026-01-10", status: "completed" },
  { id: "2", studentName: "Alice Brown", course: "Web Development Bootcamp", amount: 1500, date: "2026-02-05", status: "completed" },
  { id: "3", studentName: "Bob Wilson", course: "Advanced React Patterns", amount: 1200, date: "2026-03-15", status: "completed" },
  { id: "4", studentName: "Carol Davis", course: "Advanced React Patterns", amount: 1200, date: "2026-03-22", status: "completed" },
  { id: "5", studentName: "David Lee", course: "Web Development Bootcamp", amount: 1500, date: "2026-04-01", status: "completed" },
]

export const mockWithdrawRequests = [
  { id: "1", amount: 5000, status: "approved", requestedAt: "2026-03-01", processedAt: "2026-03-03", method: "Bank Transfer" },
  { id: "2", amount: 8000, status: "pending", requestedAt: "2026-04-10", processedAt: null, method: "bKash" },
]

export const mockReviews = [
  { id: "1", studentName: "John Doe", courseTitle: "Web Development Bootcamp", rating: 5, comment: "Excellent course! Very well structured and easy to follow. Highly recommend for beginners.", date: "2026-03-20" },
  { id: "2", studentName: "Bob Wilson", courseTitle: "Advanced React Patterns", rating: 4, comment: "Great content, learned a lot about React patterns. The examples were really helpful.", date: "2026-04-05" },
  { id: "3", studentName: "Carol Davis", courseTitle: "Advanced React Patterns", rating: 5, comment: "One of the best React courses I've taken. Clear explanations and practical projects.", date: "2026-04-12" },
]

export const mockTeacherSettings = {
  firstName: "Jane",
  lastName: "Smith",
  email: "jane@example.com",
  mobile: "+880 1700-000000",
  bio: "Passionate educator with 10+ years of experience in web development and software engineering.",
  avatar: "",
}

// ── Blog mock data ────────────────────────────────────────────────────────────

export const mockBlogs = [
  {
    id: "1",
    slug: "getting-started-with-web-development-2026",
    title: "Getting Started with Web Development in 2026",
    excerpt: "Discover the essential technologies, tools, and roadmap you need to become a professional web developer in 2026 and beyond.",
    category: "Programming",
    categoryColor: "bg-blue-100 text-blue-700",
    author: "Jane Smith",
    authorInitials: "JS",
    authorGradient: "from-blue-400 to-indigo-600",
    date: "2026-04-01",
    readTime: "8 min read",
    gradient: "from-blue-500 to-indigo-600",
    emoji: "💻",
    body: `Web development in 2026 is more exciting than ever. With the rise of server components, edge computing, and AI-assisted tooling, the landscape has shifted considerably from just a few years ago.\n\nTo get started, you need to master the fundamentals first: HTML for structure, CSS for styling, and JavaScript for interactivity. These three pillars have not changed, and they remain the bedrock of everything you will build.\n\nOnce you are comfortable with the basics, the next step is to pick a framework. React continues to dominate the frontend space, with Next.js being the de facto standard for production applications. If you prefer a lighter alternative, Svelte and Astro are excellent options.\n\nOn the backend, Node.js with Express or Fastify is a popular choice. However, more developers are reaching for Bun and Deno as faster runtime alternatives. For databases, PostgreSQL remains the industry favorite, with Prisma as a type-safe ORM.\n\nDo not underestimate soft skills. Writing clean, readable code, communicating effectively with teammates, and understanding business requirements are just as important as technical expertise.\n\nStart building real projects from day one. A personal portfolio, a simple CRUD app, or a clone of a popular product — all of these teach you far more than tutorials alone. The key is to struggle with real problems and look up solutions as you go.\n\nFinally, embrace the community. Follow developers on GitHub, contribute to open source, join Discord communities, and attend local meetups or online conferences. The connections you make will be invaluable throughout your career.`,
  },
  {
    id: "2",
    slug: "mastering-ui-ux-design-principles",
    title: "Mastering UI/UX Design: Core Principles Every Designer Must Know",
    excerpt: "Great design is more than aesthetics. Learn the foundational principles that separate good designers from great ones.",
    category: "Design",
    categoryColor: "bg-pink-100 text-pink-700",
    author: "Alice Johnson",
    authorInitials: "AJ",
    authorGradient: "from-pink-400 to-rose-600",
    date: "2026-03-20",
    readTime: "6 min read",
    gradient: "from-pink-500 to-rose-600",
    emoji: "🎨",
    body: `Design is not decoration. It is communication. Every colour, every spacing decision, every font choice sends a message to your user — intentional or not. The best designers understand this deeply.\n\nThe first principle to master is hierarchy. Users should be able to glance at any screen and immediately understand what is most important. Use size, weight, and contrast to guide the eye naturally.\n\nWhite space is your best friend. Cramming elements together creates cognitive overload. Generous padding and margins allow the content to breathe and make interfaces feel premium and trustworthy.\n\nConsistency is non-negotiable. Define a design system early — your type scale, colour palette, spacing units, and component library. Once defined, apply them without exception. Inconsistency erodes trust.\n\nDo not design for yourself. Design for your users. Conduct user interviews, run usability tests, and analyse behaviour data. Assumptions are expensive. Observation is priceless.\n\nAccessibility is not optional. Ensure sufficient colour contrast ratios, provide text alternatives for images, and design for keyboard navigation. An interface that excludes users is a failed design.\n\nFinally, iterate relentlessly. No design is ever finished on the first attempt. Ship, collect feedback, refine, and repeat. The best products in the world are the result of hundreds of small improvements over time.`,
  },
  {
    id: "3",
    slug: "machine-learning-career-guide",
    title: "How to Build a Career in Machine Learning",
    excerpt: "Machine learning is one of the fastest-growing fields in tech. Here is your complete guide to breaking into it.",
    category: "Data Science",
    categoryColor: "bg-emerald-100 text-emerald-700",
    author: "Bob Williams",
    authorInitials: "BW",
    authorGradient: "from-emerald-400 to-teal-600",
    date: "2026-03-10",
    readTime: "10 min read",
    gradient: "from-emerald-500 to-teal-600",
    emoji: "📊",
    body: `Machine learning is no longer just academic research. It powers search engines, recommendation systems, autonomous vehicles, and medical diagnostics. The demand for ML engineers and data scientists continues to grow faster than universities can produce graduates.\n\nThe foundation is mathematics. You do not need to be a PhD mathematician, but you do need a solid grasp of linear algebra, calculus, probability, and statistics. These underpin every algorithm you will use.\n\nLearn Python. It is the lingua franca of the ML world. Libraries like NumPy, pandas, scikit-learn, and PyTorch are your everyday tools. Spend time getting comfortable with data manipulation and exploratory analysis.\n\nUnderstand the core algorithms. Start with linear regression, logistic regression, decision trees, and k-nearest neighbours. Then progress to ensemble methods, support vector machines, and neural networks. Knowing when to use which algorithm is a skill that takes time to develop.\n\nBuild projects. A Kaggle competition, a sentiment analysis tool, an image classifier — anything that gives you experience with the full ML pipeline from data collection to model deployment.\n\nDeployment matters. Knowing how to train a model is only half the job. Learn to serve models with FastAPI or Flask, containerise with Docker, and deploy to cloud platforms. MLOps is a growing discipline for good reason.\n\nStay current. The field evolves rapidly. Follow arxiv.org, read papers, follow researchers on social media, and experiment with new architectures and techniques regularly.`,
  },
  {
    id: "4",
    slug: "digital-marketing-strategies-2026",
    title: "Digital Marketing Strategies That Work in 2026",
    excerpt: "The digital marketing landscape is constantly evolving. Here are the strategies driving results right now.",
    category: "Marketing",
    categoryColor: "bg-orange-100 text-orange-700",
    author: "Carol Davis",
    authorInitials: "CD",
    authorGradient: "from-orange-400 to-amber-600",
    date: "2026-02-28",
    readTime: "7 min read",
    gradient: "from-orange-500 to-amber-600",
    emoji: "📱",
    body: `Digital marketing in 2026 is driven by data, personalisation, and authentic storytelling. The tactics that worked three years ago are not necessarily the ones that will work today.\n\nSearch engine optimisation remains one of the highest ROI channels. Focus on creating genuinely helpful content that answers specific questions your audience is asking. Google's algorithms have become sophisticated enough that trying to game them consistently backfires. Quality always wins.\n\nShort-form video continues to dominate. Platforms like TikTok, Instagram Reels, and YouTube Shorts are where attention lives. Brands that create engaging, authentic short video content consistently outperform those that do not, regardless of budget.\n\nEmail marketing is not dead — in fact, it has never been more valuable. With social media reach declining, owning your audience through an email list is essential. Focus on segmentation and personalisation to drive open rates and conversions.\n\nCommunity-led growth is the emerging model. Brands that build genuine communities around shared values and interests create loyal customers who market on their behalf. Discord, Circle, and Slack communities are powerful but require consistent investment.\n\nDo not ignore paid media, but be precise. The era of spray-and-pray advertising is over. Use first-party data, precise audience targeting, and rigorous A/B testing to make every advertising dollar work harder.\n\nMeasure what matters. Vanity metrics like followers and impressions mean nothing without conversion tracking. Build dashboards that connect marketing activity directly to revenue and focus your energy on the channels delivering real results.`,
  },
  {
    id: "5",
    slug: "react-server-components-explained",
    title: "React Server Components Explained — What They Mean for Your Apps",
    excerpt: "Server Components are the biggest shift in React's architecture in years. Here is everything you need to know.",
    category: "Programming",
    categoryColor: "bg-cyan-100 text-cyan-700",
    author: "David Park",
    authorInitials: "DP",
    authorGradient: "from-cyan-400 to-blue-600",
    date: "2026-02-14",
    readTime: "9 min read",
    gradient: "from-cyan-500 to-blue-600",
    emoji: "⚛️",
    body: `React Server Components (RSC) represent the most significant architectural shift in React since hooks were introduced. If you have not gotten your head around them yet, now is the time.\n\nThe core idea is simple: some components render on the server only, and some render on the client. Server components have direct access to the database, filesystem, and backend services. They send rendered HTML to the client — no JavaScript bundle required.\n\nThis has profound performance implications. Your initial page load contains fully rendered content without a JavaScript waterfall. Time to first contentful paint drops dramatically. Users on slow connections see content much faster.\n\nClient components work exactly as React components always have. They handle interactivity, state, and browser APIs. You mark them explicitly with the "use client" directive. Everything else defaults to server.\n\nThe key mental model shift: think about where your data lives. If a component fetches from a database or calls a private API, make it a server component. If it needs to respond to user input or use browser APIs, make it a client component.\n\nNext.js 15 makes RSC the default and provides excellent tooling around them. The App Router is built entirely around this model. If you are starting a new project today, you should be using the App Router.\n\nOne common pitfall: you cannot pass functions from server to client components as props. You can pass plain data — strings, numbers, objects, arrays. For interactivity, lift client-side logic into dedicated client components and compose them within your server component tree.`,
  },
  {
    id: "6",
    slug: "python-automation-productivity",
    title: "10 Python Scripts That Will 10x Your Productivity",
    excerpt: "Python's true superpower is automation. These practical scripts will save you hours every single week.",
    category: "Programming",
    categoryColor: "bg-purple-100 text-purple-700",
    author: "Emma Wilson",
    authorInitials: "EW",
    authorGradient: "from-purple-400 to-violet-600",
    date: "2026-01-30",
    readTime: "5 min read",
    gradient: "from-purple-500 to-violet-600",
    emoji: "🐍",
    body: `Python is the Swiss Army knife of programming. One of its most underused superpowers is automation — writing small scripts that handle repetitive tasks so you never have to do them manually again.\n\nFile organisation is a great starting point. A simple script using the os and shutil modules can automatically sort your Downloads folder by file type, rename files based on patterns, or move project assets to their correct directories.\n\nWeb scraping with BeautifulSoup and Requests lets you extract data from websites automatically. Price monitoring, news aggregation, job listing tracking — all of these can be automated with a few dozen lines of Python.\n\nSpreadsheet automation with openpyxl or pandas can transform hours of manual Excel work into seconds. Generate reports, merge datasets, apply formatting rules, and send results by email — all without opening Excel once.\n\nAPI integrations are incredibly practical. Connect your calendar to your task manager, sync data between tools that have no native integration, or build a Slack bot that notifies you of important events from other systems.\n\nScheduled tasks make automation truly hands-free. Use cron on Linux/Mac or Task Scheduler on Windows to run your Python scripts at set intervals. Combined with logging, you can build reliable automated pipelines that run while you sleep.\n\nThe best approach is to identify your own bottlenecks. What do you do repeatedly each week that follows a predictable pattern? That is your automation opportunity. Start with one, get it working, and build from there. Small wins compound into massive time savings.`,
  },
]
