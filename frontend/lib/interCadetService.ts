/**
 * interCadetService.ts — Inter Cadet College Service Layer
 *
 * HOW TO SWITCH TO REAL API:
 * 1. Import axios instance from "@/lib/axios"
 * 2. Replace each function body with the
 *    API call shown in the API-READY comment
 * 3. Backend must return same shape as types here
 * 4. No page files need to change at all
 *
 * BACKEND ENDPOINTS NEEDED:
 * GET /api/inter-cadet/colleges
 * GET /api/inter-cadet/colleges/:id/stats
 * GET /api/inter-cadet/colleges/:id/students
 * GET /api/inter-cadet/students/:id
 * GET /api/inter-cadet/ranking
 */

import {
  getAllCollegeStats   as _getAllCollegeStats,
  getCollegeStats     as _getCollegeStats,
  getStudentsByCollege as _getStudentsByCollege,
  getStudentById      as _getStudentById,
  getCollegeRanking   as _getCollegeRanking,
} from "@/lib/InterCadetCollegeEvaluationData";

export type { SubjectResult, CadetStudent, CollegeStats, CadetCollege } from "@/lib/InterCadetCollegeEvaluationData";

export async function getAllCollegeStats() {
  // API-READY:
  // const res = await api.get("/api/inter-cadet/colleges");
  // return res.data.data;
  return _getAllCollegeStats();
}

export async function getCollegeStats(collegeId: number) {
  // API-READY:
  // const res = await api.get(`/api/inter-cadet/colleges/${collegeId}/stats`);
  // return res.data.data;
  return _getCollegeStats(collegeId);
}

export async function getStudentsByCollege(collegeId: number) {
  // API-READY:
  // const res = await api.get(`/api/inter-cadet/colleges/${collegeId}/students`);
  // return res.data.data;
  return _getStudentsByCollege(collegeId);
}

export async function getStudentById(id: number) {
  // API-READY:
  // const res = await api.get(`/api/inter-cadet/students/${id}`);
  // return res.data.data;
  const student = _getStudentById(id);
  if (!student) throw new Error(`Student ${id} not found`);
  return student;
}

export async function getCollegeRanking() {
  // API-READY:
  // const res = await api.get("/api/inter-cadet/ranking");
  // return res.data.data;
  return _getCollegeRanking();
}
