import { redirect } from "next/navigation";
import StudentResultClient from "./StudentResultClient";

export default function StudentStudentResultPage({
  params,
}: {
  params: { collegeId: string; studentId: string };
}) {
  // MOCK: hardcoded allowedId = 1 — replace with session/auth check in future
  const allowedId = 1;
  if (parseInt(params.studentId) !== allowedId) {
    redirect("/student/evaluation/inter-cadet");
  }

  return (
    <StudentResultClient
      collegeId={parseInt(params.collegeId, 10)}
      studentId={parseInt(params.studentId, 10)}
    />
  );
}
