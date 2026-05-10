export type TeacherCourse = {
  id: string
  title: string
  thumbnail: string
  level: "Beginner" | "Intermediate" | "Advanced"
  price: string
  rating: number
}

export type TeacherReview = {
  id: string
  authorName: string
  authorAvatar: string
  stars: number
  text: string
  date: string
}

export type Teacher = {
  id: string
  name: string
  expertise: string
  bio: string
  avatar: string
  bannerPhoto: string
  stats: {
    courses: number
    students: number
    rating: number
    reviews: number
  }
  about: string
  courses: TeacherCourse[]
  reviews: TeacherReview[]
}

export const mockTeachers: Teacher[] = [
  {
    id: "teacher_001",
    name: "Lucy Dominguez",
    expertise: "Physics",
    bio: "Award-winning Physics educator with 12 years of teaching experience. Specialises in making complex concepts intuitive.",
    avatar: "https://i.pravatar.cc/150?u=teacher@demo.com",
    bannerPhoto: "https://picsum.photos/seed/lucy-banner/1200/400",
    stats: { courses: 5, students: 120, rating: 4.8, reviews: 45 },
    about: "Lucy Dominguez holds a PhD in Theoretical Physics from MIT and has spent over a decade bridging the gap between academic research and accessible education. Her courses have helped thousands of students understand the universe — from Newtonian mechanics to quantum theory. She believes that every student has the potential to grasp even the most abstract ideas when presented with clarity and enthusiasm.",
    courses: [
      { id: "p1", title: "Newtonian Mechanics Masterclass",        thumbnail: "https://picsum.photos/seed/p1/400/250", level: "Beginner",     price: "TK1200 BDT", rating: 4.9 },
      { id: "p2", title: "Quantum Physics: The Fundamentals",      thumbnail: "https://picsum.photos/seed/p2/400/250", level: "Intermediate",  price: "TK1800 BDT", rating: 4.8 },
      { id: "p3", title: "Electromagnetism & Waves",               thumbnail: "https://picsum.photos/seed/p3/400/250", level: "Intermediate",  price: "TK1500 BDT", rating: 4.7 },
      { id: "p4", title: "Thermodynamics for Engineers",           thumbnail: "https://picsum.photos/seed/p4/400/250", level: "Advanced",      price: "TK2000 BDT", rating: 4.8 },
      { id: "p5", title: "Optics & Modern Physics",                thumbnail: "https://picsum.photos/seed/p5/400/250", level: "Advanced",      price: "TK2200 BDT", rating: 4.6 },
    ],
    reviews: [
      { id: "r1", authorName: "Ahmed Hossain",   authorAvatar: "https://i.pravatar.cc/150?u=ah1", stars: 5, text: "Lucy's explanations are crystal clear. The way she connects theory to real-world applications is exceptional.", date: "2026-03-15" },
      { id: "r2", authorName: "Priya Sharma",    authorAvatar: "https://i.pravatar.cc/150?u=ps2", stars: 5, text: "Best Physics course I've ever taken. She makes quantum mechanics feel approachable!", date: "2026-02-28" },
      { id: "r3", authorName: "Chen Wei",        authorAvatar: "https://i.pravatar.cc/150?u=cw3", stars: 4, text: "Very well structured content. The practice problems are challenging and rewarding.", date: "2026-02-10" },
      { id: "r4", authorName: "Fatima Al-Rashid",authorAvatar: "https://i.pravatar.cc/150?u=fr4", stars: 5, text: "I struggled with physics for years. Lucy completely changed how I understand the subject.", date: "2026-01-22" },
    ],
  },
  {
    id: "teacher_002",
    name: "James Carter",
    expertise: "Mathematics",
    bio: "Oxford-trained mathematician with a passion for applied maths and helping students unlock their analytical potential.",
    avatar: "https://i.pravatar.cc/150?u=teacher2@demo.com",
    bannerPhoto: "https://picsum.photos/seed/james-banner/1200/400",
    stats: { courses: 3, students: 89, rating: 4.6, reviews: 31 },
    about: "James Carter graduated top of his class from Oxford University with a Masters in Applied Mathematics. He has taught at secondary and university levels across three countries and is the author of two widely used textbooks. James is known for his structured, step-by-step teaching style that transforms even the most maths-averse students into confident problem solvers.",
    courses: [
      { id: "m1", title: "Calculus from Zero to Hero",             thumbnail: "https://picsum.photos/seed/m1/400/250", level: "Beginner",    price: "TK1100 BDT", rating: 4.7 },
      { id: "m2", title: "Linear Algebra for Data Science",        thumbnail: "https://picsum.photos/seed/m2/400/250", level: "Intermediate", price: "TK1600 BDT", rating: 4.5 },
      { id: "m3", title: "Probability & Statistics Masterclass",   thumbnail: "https://picsum.photos/seed/m3/400/250", level: "Intermediate", price: "TK1400 BDT", rating: 4.6 },
    ],
    reviews: [
      { id: "r1", authorName: "Nadia Islam",     authorAvatar: "https://i.pravatar.cc/150?u=ni1", stars: 5, text: "James breaks down calculus so simply. I went from failing to acing my university exams.", date: "2026-03-20" },
      { id: "r2", authorName: "Tom Bradley",     authorAvatar: "https://i.pravatar.cc/150?u=tb2", stars: 4, text: "Solid course content. Linear algebra was always intimidating but James made it manageable.", date: "2026-02-14" },
      { id: "r3", authorName: "Yuki Tanaka",     authorAvatar: "https://i.pravatar.cc/150?u=yt3", stars: 4, text: "Great explanations and plenty of worked examples. Would love more advanced topics covered.", date: "2026-01-30" },
    ],
  },
  {
    id: "teacher_003",
    name: "Sarah Ahmed",
    expertise: "Chemistry",
    bio: "Organic chemistry specialist and PhD researcher who transforms complex lab science into engaging, memorable lessons.",
    avatar: "https://i.pravatar.cc/150?u=sarah.ahmed@demo.com",
    bannerPhoto: "https://picsum.photos/seed/sarah-banner/1200/400",
    stats: { courses: 4, students: 95, rating: 4.7, reviews: 38 },
    about: "Dr. Sarah Ahmed completed her PhD in Organic Chemistry at Cambridge University and has since dedicated herself to making chemistry accessible to learners of all backgrounds. With a talent for visual teaching and memorable analogies, Sarah has built a reputation as one of the most engaging science educators online. She is passionate about inspiring the next generation of chemists and researchers.",
    courses: [
      { id: "c1", title: "Organic Chemistry Fundamentals",         thumbnail: "https://picsum.photos/seed/c1/400/250", level: "Beginner",    price: "TK1300 BDT", rating: 4.8 },
      { id: "c2", title: "Chemical Bonding & Reactions",           thumbnail: "https://picsum.photos/seed/c2/400/250", level: "Intermediate", price: "TK1600 BDT", rating: 4.7 },
      { id: "c3", title: "Biochemistry: Life at the Molecular Level", thumbnail: "https://picsum.photos/seed/c3/400/250", level: "Advanced", price: "TK1900 BDT", rating: 4.6 },
      { id: "c4", title: "Industrial Chemistry & Processes",       thumbnail: "https://picsum.photos/seed/c4/400/250", level: "Advanced",    price: "TK2100 BDT", rating: 4.7 },
    ],
    reviews: [
      { id: "r1", authorName: "Rafi Hasan",      authorAvatar: "https://i.pravatar.cc/150?u=rh1", stars: 5, text: "Dr. Sarah's organic chemistry course is a game changer. Every concept is explained with real examples.", date: "2026-03-10" },
      { id: "r2", authorName: "Emily Chen",      authorAvatar: "https://i.pravatar.cc/150?u=ec2", stars: 5, text: "I was dreading biochemistry but her course made it genuinely enjoyable. Highly recommended!", date: "2026-02-25" },
      { id: "r3", authorName: "Marcus Johnson",  authorAvatar: "https://i.pravatar.cc/150?u=mj3", stars: 4, text: "Very thorough course. The problem sets at the end of each module are excellent for practice.", date: "2026-02-05" },
      { id: "r4", authorName: "Amina Osei",      authorAvatar: "https://i.pravatar.cc/150?u=ao4", stars: 5, text: "The way Sarah connects chemistry to everyday life makes it so much more interesting to learn.", date: "2026-01-18" },
    ],
  },
  {
    id: "teacher_004",
    name: "Rahman Ali",
    expertise: "Biology",
    bio: "Evolutionary biologist and science communicator with a gift for turning complex life sciences into captivating stories.",
    avatar: "https://i.pravatar.cc/150?u=rahman.ali@demo.com",
    bannerPhoto: "https://picsum.photos/seed/rahman-banner/1200/400",
    stats: { courses: 6, students: 150, rating: 4.9, reviews: 62 },
    about: "Rahman Ali holds a PhD in Evolutionary Biology from the University of Edinburgh and is a published researcher in the field of genetics and biodiversity. He has taught biology at all levels for over 15 years and has a unique ability to weave storytelling into science education, making even the most intricate biological systems feel alive and relevant. His courses have been praised worldwide for their depth, clarity, and passion.",
    courses: [
      { id: "b1", title: "Cell Biology & Genetics Essentials",     thumbnail: "https://picsum.photos/seed/b1/400/250", level: "Beginner",    price: "TK1200 BDT", rating: 4.9 },
      { id: "b2", title: "Human Anatomy & Physiology",             thumbnail: "https://picsum.photos/seed/b2/400/250", level: "Beginner",    price: "TK1400 BDT", rating: 4.9 },
      { id: "b3", title: "Evolutionary Biology: Darwin to DNA",    thumbnail: "https://picsum.photos/seed/b3/400/250", level: "Intermediate", price: "TK1700 BDT", rating: 4.8 },
      { id: "b4", title: "Microbiology & Infectious Diseases",     thumbnail: "https://picsum.photos/seed/b4/400/250", level: "Intermediate", price: "TK1800 BDT", rating: 4.9 },
      { id: "b5", title: "Ecology & Environmental Science",        thumbnail: "https://picsum.photos/seed/b5/400/250", level: "Intermediate", price: "TK1600 BDT", rating: 4.8 },
      { id: "b6", title: "Molecular Biology & Biotechnology",      thumbnail: "https://picsum.photos/seed/b6/400/250", level: "Advanced",    price: "TK2300 BDT", rating: 4.9 },
    ],
    reviews: [
      { id: "r1", authorName: "Kazi Mahmud",     authorAvatar: "https://i.pravatar.cc/150?u=km1", stars: 5, text: "Rahman is simply the best biology teacher I've encountered online. Absolutely world class content.", date: "2026-04-01" },
      { id: "r2", authorName: "Lena Fischer",    authorAvatar: "https://i.pravatar.cc/150?u=lf2", stars: 5, text: "His evolutionary biology course changed how I see the world. Fascinating and beautifully taught.", date: "2026-03-22" },
      { id: "r3", authorName: "Omar Khalil",     authorAvatar: "https://i.pravatar.cc/150?u=ok3", stars: 5, text: "The microbiology course was perfect for my medical school prep. Detailed, accurate, and engaging.", date: "2026-03-08" },
      { id: "r4", authorName: "Sophie Martin",   authorAvatar: "https://i.pravatar.cc/150?u=sm4", stars: 4, text: "Excellent content. I especially loved the ecology course — very timely and relevant.", date: "2026-02-18" },
      { id: "r5", authorName: "David Okonkwo",   authorAvatar: "https://i.pravatar.cc/150?u=do5", stars: 5, text: "Molecular biology explained with such clarity. Rahman has a rare gift for science communication.", date: "2026-01-30" },
    ],
  },
]

export function getTeacher(id: string): Teacher | undefined {
  return mockTeachers.find((t) => t.id === id)
}
