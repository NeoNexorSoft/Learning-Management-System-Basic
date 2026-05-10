export type Notification = {
  id: string
  title: string
  message: string
  sender: string
  senderRole: "Admin" | "Teacher"
  timestamp: string
  read: boolean
}

export const mockNotifications: Notification[] = [
  {
    id: "n1",
    title: "Assignment Deadline Extended",
    message: "The deadline for 'React Fundamentals Assignment' has been extended by 3 days. New due date: April 22, 2026.",
    sender: "Dr. James Carter",
    senderRole: "Teacher",
    timestamp: "2026-04-18T10:30:00",
    read: false,
  },
  {
    id: "n2",
    title: "New Course Material Available",
    message: "New lecture notes and resources have been uploaded for 'Advanced JavaScript'. Please check the course materials section.",
    sender: "Sarah Ahmed",
    senderRole: "Teacher",
    timestamp: "2026-04-17T14:15:00",
    read: false,
  },
  {
    id: "n3",
    title: "Platform Maintenance Notice",
    message: "The platform will undergo scheduled maintenance on April 20, 2026 from 2:00 AM to 4:00 AM UTC. Some services may be unavailable during this time.",
    sender: "Admin",
    senderRole: "Admin",
    timestamp: "2026-04-17T09:00:00",
    read: false,
  },
  {
    id: "n4",
    title: "Your Assignment Has Been Graded",
    message: "Your submission for 'CSS Grid Layout Project' has been reviewed. You scored 88/100. Check your results page for detailed feedback.",
    sender: "Lucy Dominguez",
    senderRole: "Teacher",
    timestamp: "2026-04-16T16:45:00",
    read: false,
  },
  {
    id: "n5",
    title: "Upcoming Live Session",
    message: "You have a live Q&A session for 'Python for Beginners' tomorrow at 3:00 PM. A meeting link will be shared 30 minutes before the session.",
    sender: "Rahman Ali",
    senderRole: "Teacher",
    timestamp: "2026-04-15T11:00:00",
    read: false,
  },
  {
    id: "n6",
    title: "Welcome to Neo Nexor!",
    message: "Your account has been successfully set up. Explore your enrolled courses and start your learning journey today. We're excited to have you on board!",
    sender: "Admin",
    senderRole: "Admin",
    timestamp: "2026-04-15T08:00:00",
    read: true,
  },
  {
    id: "n7",
    title: "Holiday Schedule Announcement",
    message: "Classes will be suspended from April 25–27 for the Eid holiday. All deadlines have been adjusted accordingly. Enjoy your holiday!",
    sender: "Admin",
    senderRole: "Admin",
    timestamp: "2026-04-13T09:30:00",
    read: true,
  },
  {
    id: "n8",
    title: "New Quiz Available",
    message: "A new practice quiz for 'JavaScript ES6 Features' has been published. Complete it before April 21 to earn bonus points.",
    sender: "Dr. James Carter",
    senderRole: "Teacher",
    timestamp: "2026-04-12T13:00:00",
    read: true,
  },
]
