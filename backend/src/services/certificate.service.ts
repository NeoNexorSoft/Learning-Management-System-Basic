import { prisma } from '../config/db';

export const certificateService = {
  async getMyCertificates(studentId: string) {
    return prisma.certificate.findMany({
      where:   { student_id: studentId },
      orderBy: { issued_at: 'desc' },
      select: {
        id:               true,
        certificate_code: true,
        issued_at:        true,
        course: { select: { id: true, title: true, slug: true, thumbnail: true } },
      },
    });
  },

  async verifyCertificate(code: string) {
    const cert = await prisma.certificate.findUnique({
      where:  { certificate_code: code },
      select: {
        certificate_code: true,
        issued_at:        true,
        student: { select: { name: true } },
        course:  { select: { title: true } },
      },
    });
    if (!cert) throw Object.assign(new Error('Certificate not found'), { statusCode: 404 });
    return {
      certificate_code: cert.certificate_code,
      student_name:     cert.student.name,
      course_name:      cert.course.title,
      issued_at:        cert.issued_at,
    };
  },
};
