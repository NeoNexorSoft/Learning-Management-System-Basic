// lib/mock/centralizedEvaluation.ts
// ─── Types ────────────────────────────────────────────────────────────────────

export type House = "Alpha" | "Beta" | "Charlie"
export type Grade = "A+" | "A" | "A-" | "B" | "C" | "D" | "F"
export type EvalGrade = "Alpha" | "Beta" | "Charlie" | "Delta" | "Echo"

export interface SubjectMark {
  subject: string
  t1: number
  t2: number
  t3: number
  average: number
  grade: Grade
}

export interface Student {
  id: string
  name: string
  roll: number
  class: 7 | 9 | 10 | 11 | 12
  house: House
  subjects: SubjectMark[]
  academicAvg: number
  academicGrade: Grade
  overallGrade: EvalGrade
  rank?: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function r(min: number, max: number) {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10
}

function letterGrade(avg: number): Grade {
  if (avg >= 90) return "A+"
  if (avg >= 80) return "A"
  if (avg >= 70) return "A-"
  if (avg >= 60) return "B"
  if (avg >= 50) return "C"
  if (avg >= 40) return "D"
  return "F"
}

function evalGrade(avg: number): EvalGrade {
  if (avg >= 88) return "Alpha"
  if (avg >= 75) return "Beta"
  if (avg >= 60) return "Charlie"
  if (avg >= 45) return "Delta"
  return "Echo"
}

const CLASS_7_SUBJECTS = [
  "Bangla", "English", "Math", "Science", "BGS", "ICT", "Religion",
]
const CLASS_9_10_SUBJECTS = [
  "Bangla", "English", "Math", "Physics", "Chemistry", "Biology",
  "Higher Math", "ICT", "Religion",
]
const CLASS_11_12_SUBJECTS = [
  "Bangla", "English", "Physics", "Chemistry", "Biology", "Math", "ICT",
]

function subjectsFor(cls: number) {
  if (cls === 7) return CLASS_7_SUBJECTS
  if (cls === 9 || cls === 10) return CLASS_9_10_SUBJECTS
  return CLASS_11_12_SUBJECTS
}

const BN_FIRST = [
  "Arifful","Md. Rakibul","Sadman","Hasan","Rahim","Didar","Mushfiqur",
  "Nayeem","Sharif","Fahim","Nadia","Sadia","Farhan","Mehedi","Tariq",
  "Raihan","Imran","Tanvir","Sabbir","Sumaiya","Tasnim","Farzana",
  "Minhaj","Zahid","Sakib","Arif","Nasim","Rubel","Rifat","Shafiq",
  "Tawhid","Mariam","Ishrat","Parvez","Shanto","Naim","Limon","Shoaib",
  "Mamun","Asif","Jobayer","Hamim","Labib","Shahed","Rasel","Monir",
  "Karim","Iftekhar","Tahsin","Abir",
]
const BN_LAST = [
  "Islam","Hasan","Hossain","Ahmed","Rahman","Akter","Khanam","Mahmud",
  "Chowdhury","Khan","Miah","Uddin","Ali","Begum","Sarkar","Alam",
  "Sheikh","Bhuiyan","Mollik","Siddiqui",
]

function makeName(i: number) {
  return `${BN_FIRST[i % BN_FIRST.length]} ${BN_LAST[i % BN_LAST.length]}`
}

const HOUSES: House[] = ["Alpha", "Beta", "Charlie"]

function generateStudent(
  cls: 7 | 9 | 10 | 11 | 12,
  index: number,
): Student {
  const subjects = subjectsFor(cls)
  const house: House = HOUSES[index % 3]

  // vary quality — top 10 students score higher
  const boost = index < 10 ? 15 : index < 25 ? 5 : 0
  const penalty = index > 40 ? -10 : 0

  const subjectMarks: SubjectMark[] = subjects.map((subject) => {
    const t1 = Math.min(100, Math.max(30, r(55, 82) + boost + penalty))
    const t2 = Math.min(100, Math.max(30, r(58, 85) + boost + penalty))
    const t3 = Math.min(100, Math.max(30, r(57, 88) + boost + penalty))
    const average = Math.round(((t1 + t2 + t3) / 3) * 10) / 10
    return { subject, t1, t2, t3, average, grade: letterGrade(average) }
  })

  const academicAvg =
    Math.round(
      (subjectMarks.reduce((s, m) => s + m.average, 0) / subjectMarks.length) * 10,
    ) / 10

  return {
    id: `C${cls}-S${String(index + 1).padStart(2, "0")}`,
    name: makeName(index + cls * 10),
    roll: index + 1,
    class: cls,
    house,
    subjects: subjectMarks,
    academicAvg,
    academicGrade: letterGrade(academicAvg),
    overallGrade: evalGrade(academicAvg),
  }
}

// ─── Generate all students ─────────────────────────────────────────────────────

function generateClass(cls: 7 | 9 | 10 | 11 | 12): Student[] {
  const students = Array.from({ length: 50 }, (_, i) => generateStudent(cls, i))
  // sort by academicAvg descending and assign rank
  students.sort((a, b) => b.academicAvg - a.academicAvg)
  students.forEach((s, i) => { s.rank = i + 1 })
  return students
}

export const class7Students: Student[]  = generateClass(7)
export const class9Students: Student[]  = generateClass(9)
export const class10Students: Student[] = generateClass(10)
export const class11Students: Student[] = generateClass(11)
export const class12Students: Student[] = generateClass(12)

export const allStudents: Student[] = [
  ...class7Students,
  ...class9Students,
  ...class10Students,
  ...class11Students,
  ...class12Students,
]

export function getStudentsByClass(cls: number): Student[] {
  switch (cls) {
    case 7:  return class7Students
    case 9:  return class9Students
    case 10: return class10Students
    case 11: return class11Students
    case 12: return class12Students
    default: return []
  }
}

// ─── Derived stats helpers ─────────────────────────────────────────────────────

export function classStats(students: Student[]) {
  const avgs = students.map((s) => s.academicAvg)
  const avg = Math.round((avgs.reduce((a, b) => a + b, 0) / avgs.length) * 10) / 10
  const highest = Math.max(...avgs)
  const lowest = Math.min(...avgs)
  const passRate = Math.round((students.filter((s) => s.academicAvg >= 50).length / students.length) * 100)
  const highestStudent = students.find((s) => s.academicAvg === highest)
  const lowestStudent = students.find((s) => s.academicAvg === lowest)
  return { avg, highest, lowest, passRate, highestStudent, lowestStudent }
}

export function gradeDistribution(students: Student[]) {
  const counts: Record<Grade, number> = {
    "A+": 0, A: 0, "A-": 0, B: 0, C: 0, D: 0, F: 0,
  }
  students.forEach((s) => { counts[s.academicGrade]++ })
  return Object.entries(counts).map(([grade, students]) => ({ grade, students }))
}

export function housePerformance(students: Student[]) {
  const houses: House[] = ["Alpha", "Beta", "Charlie"]
  const terms = ["T1", "T2", "T3"] as const
  return terms.map((term) => {
    const entry: Record<string, string | number> = { term }
    houses.forEach((h) => {
      const hs = students.filter((s) => s.house === h)
      const key = term === "T1" ? "t1" : term === "T2" ? "t2" : "t3"
      const avg =
        hs.length > 0
          ? Math.round(
              (hs.reduce(
                (sum, s) => sum + s.subjects.reduce((ss, sub) => ss + sub[key], 0) / s.subjects.length,
                0,
              ) /
                hs.length) *
                10,
            ) / 10
          : 0
      entry[h] = avg
    })
    return entry
  })
}

export function subjectClassAverage(students: Student[]) {
  if (students.length === 0) return []
  const subjects = students[0].subjects.map((s) => s.subject)
  return subjects.map((subject) => {
    const avg =
      Math.round(
        (students.reduce((sum, st) => {
          const sm = st.subjects.find((s) => s.subject === subject)
          return sum + (sm ? sm.average : 0)
        }, 0) /
          students.length) *
          10,
      ) / 10
    return { subject, average: avg }
  })
}

export function classCompositeScores() {
  const classes = [7, 9, 10, 11, 12] as const
  return classes.map((cls) => {
    const students = getStudentsByClass(cls)
    const avg = classStats(students).avg
    return { class: `Class ${cls}`, score: avg, grade: evalGrade(avg) }
  })
}

export function evalGradeDistributionAll() {
  const counts: Record<EvalGrade, number> = {
    Alpha: 0, Beta: 0, Charlie: 0, Delta: 0, Echo: 0,
  }
  allStudents.forEach((s) => { counts[s.overallGrade]++ })
  return Object.entries(counts).map(([grade, count]) => ({ grade, count }))
}
