export interface SubjectResult {
  subjectCode: number;
  subjectName: string;
  marks: number;
  letterGrade: string;
  gradePoint: number;
  isOptional: boolean;
}

export interface CadetStudent {
  id: number;
  cadetCollegeId: number;
  cadetCollegeName: string;
  boardName: string;
  name: string;
  boardRollNumber: string;
  boardRegistrationNumber: string;
  year: number;
  group: "Science" | "Arts";
  subjects: SubjectResult[];
  gpaWithoutOptional: number;
  finalGPA: number;
}

export interface CollegeStats {
  collegeId: number;
  collegeName: string;
  boardName: string;
  totalStudents: number;
  totalAplusStudents: number;
  totalPassed: number;
  totalFailed: number;
  aplusPercentage: number;
  passPercentage: number;
  averageGPA: number;
  rank: number;
}

export interface CadetCollege {
  id: number;
  name: string;
  boardName: string;
}

// --------------- Constants ---------------

export const cadetColleges: CadetCollege[] = [
  { id: 1, name: "Faujdarhat Cadet College", boardName: "Chittagong" },
  { id: 2, name: "Jhenaidah Cadet College",  boardName: "Jessore"    },
  { id: 3, name: "Mirzapur Cadet College",   boardName: "Dhaka"      },
  { id: 4, name: "Rajshahi Cadet College",   boardName: "Rajshahi"   },
  { id: 5, name: "Sylhet Cadet College",     boardName: "Sylhet"     },
];

interface SubjectDef {
  subjectCode: number;
  subjectName: string;
  isOptional: boolean;
}

const compulsorySubjectDefs: SubjectDef[] = [
  { subjectCode: 101, subjectName: "Bangla 1st Paper",           isOptional: false },
  { subjectCode: 102, subjectName: "Bangla 2nd Paper",           isOptional: false },
  { subjectCode: 107, subjectName: "English 1st Paper",          isOptional: false },
  { subjectCode: 108, subjectName: "English 2nd Paper",          isOptional: false },
  { subjectCode: 109, subjectName: "Mathematics",                isOptional: false },
  { subjectCode: 154, subjectName: "ICT",                        isOptional: false },
  { subjectCode: 111, subjectName: "Religion & Moral Education", isOptional: false },
];

const scienceSubjectDefs: SubjectDef[] = [
  { subjectCode: 136, subjectName: "Physics",            isOptional: false },
  { subjectCode: 137, subjectName: "Chemistry",          isOptional: false },
  { subjectCode: 138, subjectName: "Biology",            isOptional: false },
  { subjectCode: 150, subjectName: "BGS",                isOptional: false },
  { subjectCode: 126, subjectName: "Higher Mathematics", isOptional: true  },
];

const artsSubjectDefs: SubjectDef[] = [
  { subjectCode: 153, subjectName: "History & World Civilization", isOptional: false },
  { subjectCode: 110, subjectName: "Geography & Environment",      isOptional: false },
  { subjectCode: 140, subjectName: "Civics & Citizenship",         isOptional: false },
  { subjectCode: 141, subjectName: "Economics",                    isOptional: false },
  { subjectCode: 134, subjectName: "Agriculture Studies",          isOptional: true  },
];

const bangladeshiFirstNames: string[] = [
  "Abdullah", "Ahsan",    "Akash",    "Ali",      "Alif",     "Anik",
  "Arafat",   "Arif",     "Arman",    "Asad",     "Asif",     "Ayman",
  "Aziz",     "Badhon",   "Babar",    "Didar",    "Dipu",     "Emon",
  "Fahad",    "Farhan",   "Faridul",  "Faysal",   "Fuad",     "Golam",
  "Habib",    "Hafiz",    "Hanif",    "Hasan",    "Himel",    "Imran",
  "Ishfaq",   "Jahangir", "Jalal",    "Jamal",    "Kamrul",   "Karim",
  "Limon",    "Lutfur",   "Mahbub",   "Maruf",    "Masum",    "Masud",
  "Mehedi",   "Milon",    "Minhaj",   "Mishuk",   "Monir",    "Md.Saiful ",
  "Mubin",    "Muhit",    "Nabil",    "Naim",     "Nayeem",   "Niloy",
  "Obaid",    "Omar",     "Parvez",   "Pervez",   "Quasem",   "Rahim",
  "Rafi",     "Raihan",   "Rakib",    "Rashid",   "Rezaul",   "Rezwan",
  "Rifat",    "Ripon",    "Rizwan",   "Sabbir",   "Sadik",    "Saiful",
  "Sajib",    "Salim",    "Samiul",   "Samin",    "Sazzad",   "Shahriar",
  "Shakib",   "Shamsul",  "Sohel",    "Sumon",    "Tahmid",   "Tanvir",
  "Tarek",    "Tawsif",   "Touhid",   "Umar",     "Uzzal",    "Wahid",
  "Yusuf",    "Zahirul",  "Zakir",    "Zubayer",  "Fazlur",   "Mujahid",
];

const bangladeshiLastNames: string[] = [
  "Ahmed",     "Alam",     "Ali",      "Bashar",   "Bhuiyan",  "Biswas",
  "Chowdhury", "Das",      "Dewan",    "Ghosh",    "Hossain",  "Islam",
  "Kabir",     "Karim",    "Khan",     "Majumder", "Miah",     "Mondal",
  "Morshed",   "Nath",     "Islam",     "Rahman",   "Reza",     "Roy",
  "Sarkar",    "Sheikh",   "Siddique", "Talukder", "Uddin",    "Hasan",
];

// 60% chance of "Md." prefix — realistic for Bangladesh
const namePrefixes = ["Md.", "Md.", "Md.", "", ""];

// --------------- Pure helpers ---------------

export function getGradeFromMarks(marks: number): { letterGrade: string; gradePoint: number } {
  if (marks >= 80) return { letterGrade: "A+", gradePoint: 5.00 };
  if (marks >= 70) return { letterGrade: "A",  gradePoint: 4.00 };
  if (marks >= 60) return { letterGrade: "A-", gradePoint: 3.50 };
  if (marks >= 50) return { letterGrade: "B",  gradePoint: 3.00 };
  if (marks >= 40) return { letterGrade: "C",  gradePoint: 2.00 };
  if (marks >= 33) return { letterGrade: "D",  gradePoint: 1.00 };
  return { letterGrade: "F", gradePoint: 0.00 };
}

// LCG seeded PRNG — deterministic, same seed → same sequence
function seededRng(seed: number): () => number {
  let s = (seed ^ 0xdeadbeef) >>> 0;
  return (): number => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function randInt(rng: () => number, lo: number, hi: number): number {
  return Math.floor(rng() * (hi - lo + 1)) + lo;
}

// --------------- Data generation (runs once at module load) ---------------

function buildStudents(): CadetStudent[] {
  const students: CadetStudent[] = [];
  const usedNames = new Set<string>();
  let globalId = 1;
  let regNum    = 190000001;

  for (const college of cadetColleges) {
    // Roll base: college.id × 100 000 → 6-digit numbers (100001–100050, etc.)
    const rollBase = college.id * 100000;

    for (let pos = 0; pos < 50; pos++) {
      // Independent RNGs: one for marks, one for names
      const marksRng = seededRng(college.id * 10000 + pos + 7919);
      const nameRng  = seededRng(college.id * 10000 + pos + 97531);

      // Group: first 45 seats → Science, last 5 → Arts
      const group: "Science" | "Arts" = pos < 45 ? "Science" : "Arts";

      // Tier determines mark range for every subject of this student
      // Tier layout across 50 positions:
      //   0–19  → Elite   (20 students, marks 80–100)
      //   20–39 → Good    (20 students, marks 65–79)
      //   40–47 → Average ( 8 students, marks 50–64)
      //   48–49 → Weak    ( 2 students, marks 33–49)
      let lo: number, hi: number;
      if (college.id === 1) {
        lo = 88; hi = 100;
      } else if (college.id === 2) {
        if (pos < 40) { lo = 80; hi = 95; } else { lo = 70; hi = 79; }
      } else if (college.id === 3) {
        if (pos < 30) { lo = 80; hi = 90; } else { lo = 65; hi = 79; }
      } else if (college.id === 4) {
        if (pos < 20) { lo = 80; hi = 88; } else { lo = 60; hi = 75; }
      } else {
        if (pos < 15) { lo = 80; hi = 85; } else { lo = 55; hi = 72; }
      }

      const groupDefs = group === "Science" ? scienceSubjectDefs : artsSubjectDefs;
      const allDefs: SubjectDef[] = [...compulsorySubjectDefs, ...groupDefs];

      const subjects: SubjectResult[] = allDefs.map((def) => {
        const marks = randInt(marksRng, lo, hi);
        const { letterGrade, gradePoint } = getGradeFromMarks(marks);
        return {
          subjectCode: def.subjectCode,
          subjectName: def.subjectName,
          marks,
          letterGrade,
          gradePoint,
          isOptional: def.isOptional,
        };
      });

      const nonOptional = subjects.filter((s) => !s.isOptional);
      const gpaWithoutOptional = parseFloat(
        (nonOptional.reduce((sum, s) => sum + s.gradePoint, 0) / nonOptional.length).toFixed(2)
      );
      const finalGPA = parseFloat(
        (subjects.reduce((sum, s) => sum + s.gradePoint, 0) / subjects.length).toFixed(2)
      );

      // Generate a unique Bangladeshi male name
      let name = "";
      let attempts = 0;
      do {
        const prefix    = namePrefixes[Math.floor(nameRng() * namePrefixes.length)];
        const firstName = bangladeshiFirstNames[Math.floor(nameRng() * bangladeshiFirstNames.length)];
        const lastName  = bangladeshiLastNames[Math.floor(nameRng() * bangladeshiLastNames.length)];
        name = prefix ? `${prefix} ${firstName} ${lastName}` : `${firstName} ${lastName}`;
        attempts++;
        // Safety valve: append id suffix if pool exhausted
        if (attempts > 50) { name = `${name} ${globalId}`; break; }
      } while (usedNames.has(name));
      usedNames.add(name);

      students.push({
        id:                      globalId++,
        cadetCollegeId:          college.id,
        cadetCollegeName:        college.name,
        boardName:               college.boardName,
        name,
        boardRollNumber:         String(rollBase + pos + 1),
        boardRegistrationNumber: String(regNum++),
        year:                    2026,
        group,
        subjects,
        gpaWithoutOptional,
        finalGPA,
      });
    }
  }

  return students;
}

export const interCadetStudents: CadetStudent[] = buildStudents();

// --------------- Stats computation (cached) ---------------

function computeAllStats(): CollegeStats[] {
  const raw: CollegeStats[] = cadetColleges.map((college) => {
    const students           = interCadetStudents.filter((s) => s.cadetCollegeId === college.id);
    const totalAplusStudents = students.filter((s) => s.finalGPA === 5).length;
    const totalFailed        = students.filter((s) => s.subjects.some((sub) => sub.gradePoint === 0)).length;
    const totalPassed        = students.length - totalFailed;
    const averageGPA         = parseFloat(
      (students.reduce((sum, s) => sum + s.finalGPA, 0) / students.length).toFixed(2)
    );
    return {
      collegeId:          college.id,
      collegeName:        college.name,
      boardName:          college.boardName,
      totalStudents:      50,
      totalAplusStudents,
      totalPassed,
      totalFailed,
      aplusPercentage:    parseFloat(((totalAplusStudents / 50) * 100).toFixed(2)),
      passPercentage:     parseFloat(((totalPassed / 50) * 100).toFixed(2)),
      averageGPA,
      rank:               0,
    };
  });

  // Rank by averageGPA descending; ties broken by collegeId ascending
  raw.sort((a, b) => b.averageGPA - a.averageGPA || a.collegeId - b.collegeId);
  raw.forEach((s, i) => { s.rank = i + 1; });
  return raw;
}

const _collegeStatsCache: CollegeStats[] = computeAllStats();

// --------------- Exported helper functions ---------------

export function getCollegeStats(collegeId: number): CollegeStats {
  return _collegeStatsCache.find((s) => s.collegeId === collegeId)!;
}

export function getAllCollegeStats(): CollegeStats[] {
  return [..._collegeStatsCache].sort((a, b) => b.averageGPA - a.averageGPA);
}

export function getStudentsByCollege(collegeId: number): CadetStudent[] {
  return interCadetStudents.filter((s) => s.cadetCollegeId === collegeId);
}

export function getStudentById(id: number): CadetStudent | undefined {
  return interCadetStudents.find((s) => s.id === id);
}

export function getCollegeRanking(): CollegeStats[] {
  return [..._collegeStatsCache].sort((a, b) => a.rank - b.rank);
}

// API-READY: In future replace mock data
// with API calls from interCadetService.ts
// All pages import ONLY from
// interCadetService.ts, not from here.
