// frontend/lib/evaluationData.ts
// SINGLE mock data source for the Centralized Evaluation System — Class 8

// ── EXPORTED TYPES ─────────────────────────────────────────────────────────────

export type SubjectScore = {
  quiz: [number, number, number];       // each out of 5
  assignment: [number, number, number]; // each out of 5
  termExam: number;                     // out of 70
};

export type SubjectKey =
  | 'bangla'
  | 'english'
  | 'mathematics'
  | 'science'
  | 'bgs'       // Bangladesh and Global Studies
  | 'ict'       // Information and Communication Technology
  | 'religion'; // Religion and Moral Education

export type TermResult = Record<SubjectKey, SubjectScore>;

export type Student = {
  id: number;
  name: string;
  gender: 'male' | 'female';
  house: 'Alpha' | 'Beta' | 'Charlie';
  rollNumber: number;
  avatar: string; // initials derived from name
  marks: {
    term1: TermResult;
    term2: TermResult;
    term3: TermResult;
  };
};

export type StudentRank = {
  student: Student;
  rank: number;
  overallAverage: number;
};

export type HouseStanding = {
  house: 'Alpha' | 'Beta' | 'Charlie';
  averageScore: number;
  rank: number;
  label: 'Champion' | '1st Runner Up' | '2nd Runner Up';
};

// ── INTERNAL CONSTANTS ─────────────────────────────────────────────────────────

type StudentCategory = 'strong' | 'average' | 'weak';

const SUBJECTS: SubjectKey[] = [
  'bangla',
  'english',
  'mathematics',
  'science',
  'bgs',
  'ict',
  'religion',
];

const RANGES: Record<
  StudentCategory,
  { quiz: [number, number]; assign: [number, number]; exam: [number, number] }
> = {
  strong:  { quiz: [3.5, 5.0], assign: [3.5, 5.0], exam: [55, 70] },
  average: { quiz: [2.5, 4.0], assign: [2.5, 4.0], exam: [40, 58] },
  weak:    { quiz: [1.5, 3.0], assign: [1.5, 3.0], exam: [25, 42] },
};

// ── SEEDED RNG (LCG) ───────────────────────────────────────────────────────────
// Deterministic: same seed → same data every render / hot-reload

function createRng(seed: number) {
  let s = seed >>> 0;
  const next = (): number => {
    s = ((s * 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
  const float = (min: number, max: number): number =>
    Math.round((min + next() * (max - min)) * 10) / 10;
  return { float };
}

// Single global RNG advanced sequentially through all 51 × 3 × 7 × 7 values
const rng = createRng(0x4a7f2c9e);

// ── SCORE GENERATION ───────────────────────────────────────────────────────────

function genScore(cat: StudentCategory): SubjectScore {
  const { quiz: q, assign: a, exam: e } = RANGES[cat];
  return {
    quiz: [
      rng.float(q[0], q[1]),
      rng.float(q[0], q[1]),
      rng.float(q[0], q[1]),
    ] as [number, number, number],
    assignment: [
      rng.float(a[0], a[1]),
      rng.float(a[0], a[1]),
      rng.float(a[0], a[1]),
    ] as [number, number, number],
    termExam: rng.float(e[0], e[1]),
  };
}

function genTerm(cat: StudentCategory): TermResult {
  return Object.fromEntries(
    SUBJECTS.map(subj => [subj, genScore(cat)])
  ) as TermResult;
}

// ── AVATAR INITIALS ────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name
    .replace(/^Md\.\s+/, '')
    .replace(/^Mst\.\s+/, '')
    .split(' ')
    .filter(p => p.length > 1)
    .slice(0, 2)
    .map(p => p[0])
    .join('')
    .toUpperCase();
}

// ── BASE STUDENT DEFINITIONS ───────────────────────────────────────────────────
// Strong: 15 students — Average: 25 students — Weak: 11 students

type BaseDef = {
  id: number;
  name: string;
  gender: 'male' | 'female';
  house: 'Alpha' | 'Beta' | 'Charlie';
  rollNumber: number;
  category: StudentCategory;
};

const BASE: BaseDef[] = [
  // ── Alpha House (IDs 1–17) — 5 strong · 8 average · 4 weak ──────────────────
  { id:  1, name: 'Md. Rakibul Hasan',  gender: 'male', house: 'Alpha', rollNumber:  1, category: 'strong'  },
  { id:  2, name: 'Fahad Hossain',      gender: 'male', house: 'Alpha', rollNumber:  2, category: 'average' },
  { id:  3, name: 'Mehedi Hassan',      gender: 'male', house: 'Alpha', rollNumber:  3, category: 'weak'    },
  { id:  4, name: 'Tasnimul Islam',     gender: 'male', house: 'Alpha', rollNumber:  4, category: 'average' },
  { id:  5, name: 'Ariful Islam',       gender: 'male', house: 'Alpha', rollNumber:  5, category: 'strong'  },
  { id:  6, name: 'Nafis Ahmed',        gender: 'male', house: 'Alpha', rollNumber:  6, category: 'average' },
  { id:  7, name: 'Sakib Al Hasan',     gender: 'male', house: 'Alpha', rollNumber:  7, category: 'average' },
  { id:  8, name: 'Shafayet Hossain',   gender: 'male', house: 'Alpha', rollNumber:  8, category: 'weak'    },
  { id:  9, name: 'Tanvir Ahmed',       gender: 'male', house: 'Alpha', rollNumber:  9, category: 'average' },
  { id: 10, name: 'Sadman Fahim',       gender: 'male', house: 'Alpha', rollNumber: 10, category: 'strong'  },
  { id: 11, name: 'Farhan Hossain',     gender: 'male', house: 'Alpha', rollNumber: 11, category: 'average' },
  { id: 12, name: 'Sabbir Rahman',      gender: 'male', house: 'Alpha', rollNumber: 12, category: 'weak'    },
  { id: 13, name: 'Shahriar Kabir',     gender: 'male', house: 'Alpha', rollNumber: 13, category: 'average' },
  { id: 14, name: 'Mushfiqur Rahman',   gender: 'male', house: 'Alpha', rollNumber: 14, category: 'strong'  },
  { id: 15, name: 'Imran Hossain',      gender: 'male', house: 'Alpha', rollNumber: 15, category: 'average' },
  { id: 16, name: 'Jobayer Ahmed',      gender: 'male', house: 'Alpha', rollNumber: 16, category: 'weak'    },
  { id: 17, name: 'Abir Hassan',        gender: 'male', house: 'Alpha', rollNumber: 17, category: 'strong'  },

  // ── Beta House (IDs 18–34) — 5 strong · 9 average · 3 weak ─────────────────
  { id: 18, name: 'Rifat Hossain',      gender: 'male', house: 'Beta',  rollNumber: 18, category: 'average' },
  { id: 19, name: 'Rafiqul Islam',      gender: 'male', house: 'Beta',  rollNumber: 19, category: 'strong'  },
  { id: 20, name: 'Farhan Kabir',       gender: 'male', house: 'Beta',  rollNumber: 20, category: 'average' },
  { id: 21, name: 'Tahmid Rahman',      gender: 'male', house: 'Beta',  rollNumber: 21, category: 'weak'    },
  { id: 22, name: 'Munim Hossain',      gender: 'male', house: 'Beta',  rollNumber: 22, category: 'average' },
  { id: 23, name: 'Nayeem Islam',       gender: 'male', house: 'Beta',  rollNumber: 23, category: 'strong'  },
  { id: 24, name: 'Bristy Roy',         gender: 'male', house: 'Beta',  rollNumber: 24, category: 'average' },
  { id: 25, name: 'Jubayer Ahmed',      gender: 'male', house: 'Beta',  rollNumber: 25, category: 'average' },
  { id: 26, name: 'Pritom Das',         gender: 'male', house: 'Beta',  rollNumber: 26, category: 'average' },
  { id: 27, name: 'Asif Hossain',       gender: 'male', house: 'Beta',  rollNumber: 27, category: 'strong'  },
  { id: 28, name: 'Rakibul Khatun',     gender: 'male', house: 'Beta',  rollNumber: 28, category: 'average' },
  { id: 29, name: 'Rafi Ahmed',         gender: 'male', house: 'Beta',  rollNumber: 29, category: 'weak'    },
  { id: 30, name: 'Tanzil Ahmed',       gender: 'male', house: 'Beta',  rollNumber: 30, category: 'strong'  },
  { id: 31, name: 'Mahmudul Hasan',     gender: 'male', house: 'Beta',  rollNumber: 31, category: 'average' },
  { id: 32, name: 'Fahim Islam',        gender: 'male', house: 'Beta',  rollNumber: 32, category: 'weak'    },
  { id: 33, name: 'Siam Ahmed',         gender: 'male', house: 'Beta',  rollNumber: 33, category: 'average' },
  { id: 34, name: 'Ayaan Siddique',     gender: 'male', house: 'Beta',  rollNumber: 34, category: 'strong'  },

  // ── Charlie House (IDs 35–51) — 5 strong · 8 average · 4 weak ──────────────
  { id: 35, name: 'Hasan Mahmud',       gender: 'male', house: 'Charlie', rollNumber: 35, category: 'strong'  },
  { id: 36, name: 'Meherin Nessa',      gender: 'male', house: 'Charlie', rollNumber: 36, category: 'weak'    },
  { id: 37, name: 'Nasir Uddin',        gender: 'male', house: 'Charlie', rollNumber: 37, category: 'average' },
  { id: 38, name: 'Nadim Islam',        gender: 'male', house: 'Charlie', rollNumber: 38, category: 'strong'  },
  { id: 39, name: 'Tamim Iqbal',        gender: 'male', house: 'Charlie', rollNumber: 39, category: 'average' },
  { id: 40, name: 'Shakil Hossain',     gender: 'male', house: 'Charlie', rollNumber: 40, category: 'weak'    },
  { id: 41, name: 'Iqbal Hossain',      gender: 'male', house: 'Charlie', rollNumber: 41, category: 'average' },
  { id: 42, name: 'Sharif Akter',       gender: 'male', house: 'Charlie', rollNumber: 42, category: 'strong'  },
  { id: 43, name: 'Raihan Ali',         gender: 'male', house: 'Charlie', rollNumber: 43, category: 'weak'    },
  { id: 44, name: 'Labib Hossain',      gender: 'male', house: 'Charlie', rollNumber: 44, category: 'average' },
  { id: 45, name: 'Shohel Rana',        gender: 'male', house: 'Charlie', rollNumber: 45, category: 'weak'    },
  { id: 46, name: 'Didar Hossain',      gender: 'male', house: 'Charlie', rollNumber: 46, category: 'strong'  },
  { id: 47, name: 'Sabbir Hossain',     gender: 'male', house: 'Charlie', rollNumber: 47, category: 'average' },
  { id: 48, name: 'Rahim Khatun',       gender: 'male', house: 'Charlie', rollNumber: 48, category: 'strong'  },
  { id: 49, name: 'Maruf Hossain',      gender: 'male', house: 'Charlie', rollNumber: 49, category: 'average' },
  { id: 50, name: 'Sumaiy Ahmed',       gender: 'male', house: 'Charlie', rollNumber: 50, category: 'average' },
  { id: 51, name: 'Zahid Hasan',        gender: 'male', house: 'Charlie', rollNumber: 51, category: 'average' },
];

// ── STUDENT DATA (EXPORTED) ────────────────────────────────────────────────────

export const students: Student[] = BASE.map(b => ({
  id:         b.id,
  name:       b.name,
  gender:     b.gender,
  house:      b.house,
  rollNumber: b.rollNumber,
  avatar:     initials(b.name),
  marks: {
    term1: genTerm(b.category),
    term2: genTerm(b.category),
    term3: genTerm(b.category),
  },
}));

// ── HELPER FUNCTIONS (EXPORTED) ────────────────────────────────────────────────

/** Averages 3 quiz scores (each /5), scales result to /15. */
export function getQuizAverage(quizzes: number[]): number {
  const mean = quizzes.reduce((a, b) => a + b, 0) / quizzes.length;
  return Math.round((mean / 5) * 15 * 10) / 10;
}

/** Averages 3 assignment scores (each /5), scales result to /15. */
export function getAssignmentAverage(assignments: number[]): number {
  const mean = assignments.reduce((a, b) => a + b, 0) / assignments.length;
  return Math.round((mean / 5) * 15 * 10) / 10;
}

/** Quiz avg (15) + Assignment avg (15) + Term exam (70) = subject total (/100). */
export function getSubjectTotal(subject: SubjectScore): number {
  return Math.round(
    (getQuizAverage(subject.quiz) +
      getAssignmentAverage(subject.assignment) +
      subject.termExam) *
      10
  ) / 10;
}

/** Sum of all 7 subject totals → term total out of 700. */
export function getTermTotal(term: TermResult): number {
  return Math.round(
    SUBJECTS.reduce((sum, key) => sum + getSubjectTotal(term[key]), 0) * 10
  ) / 10;
}

/** (termTotal / 700) × 100, rounded to 1 decimal. */
export function getTermPercentage(term: TermResult): number {
  return Math.round((getTermTotal(term) / 700) * 100 * 10) / 10;
}

/** Average of the three term percentages, rounded to 1 decimal. */
export function getOverallAverage(student: Student): number {
  const perTermPct = [
    getTermPercentage(student.marks.term1),
    getTermPercentage(student.marks.term2),
    getTermPercentage(student.marks.term3),
  ];
  return Math.round(
    (perTermPct.reduce((a, b) => a + b, 0) / 3) * 10
  ) / 10;
}

/** Bangladesh grading scale. */
export function getGrade(percentage: number): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'A-';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
}

export function getComment(percentage: number): string {
  if (percentage >= 90) return 'Highest achievement level';
  if (percentage >= 80) return 'Excellent performance';
  if (percentage >= 70) return 'Good standing';
  if (percentage >= 60) return 'Needs improvement';
  return 'Below standard — requires intervention';
}

/** Students in a given house ranked by overallAverage descending. */
export function getHouseRanking(house: string): StudentRank[] {
  return students
    .filter(s => s.house === house)
    .map(s => ({ student: s, overallAverage: getOverallAverage(s) }))
    .sort((a, b) => b.overallAverage - a.overallAverage)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));
}

/** All 51 students ranked by overallAverage descending. */
export function getOverallRanking(): StudentRank[] {
  return students
    .map(s => ({ student: s, overallAverage: getOverallAverage(s) }))
    .sort((a, b) => b.overallAverage - a.overallAverage)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));
}

/** Three houses ranked by their cohort's mean overallAverage. */
export function getHouseStandings(): HouseStanding[] {
  const labels: Array<'Champion' | '1st Runner Up' | '2nd Runner Up'> = [
    'Champion',
    '1st Runner Up',
    '2nd Runner Up',
  ];
  return (['Alpha', 'Beta', 'Charlie'] as const)
    .map(house => {
      const cohort = students.filter(s => s.house === house);
      const avg =
        cohort.reduce((sum, s) => sum + getOverallAverage(s), 0) /
        cohort.length;
      return { house, averageScore: Math.round(avg * 10) / 10 };
    })
    .sort((a, b) => b.averageScore - a.averageScore)
    .map((entry, i) => ({ ...entry, rank: i + 1, label: labels[i] }));
}

/** Throws if id not found. */
export function getStudentById(id: number): Student {
  const s = students.find(s => s.id === id);
  if (!s) throw new Error(`Student with id ${id} not found`);
  return s;
}

// ── STRUCTURAL VERIFICATION ────────────────────────────────────────────────────
// Remove or gate behind NODE_ENV check before production deploy.

console.log('[evaluationData] Student #1 full object:\n', JSON.stringify(students[0], null, 2));

// API-READY: In future, replace this mock data and helper functions
// with API calls from frontend/lib/evaluationService.ts
// All pages import ONLY from evaluationService.ts, not directly from here.
