import StudentResultClient from "./StudentResultClient";

export default function AdminStudentResultPage({
  params,
}: {
  params: { collegeId: string; studentId: string };
}) {
  return (
    <StudentResultClient
      collegeId={parseInt(params.collegeId, 10)}
      studentId={parseInt(params.studentId, 10)}
    />
  );
}
