"use client";

import { useEffect, useMemo, useState, type ElementType , Suspense } from "react";
import {
  BookOpen,
  Users,
  TrendingUp,
  Star,
  ChevronRight,
  CheckCircle2,
  Clock,
  Loader2,
  Eye,
  Award,
} from "lucide-react";
import Link from "next/link";
import TopBar from "@/components/shared/TopBar";
import EarningsChart from "@/components/teacher/EarningsChart";
import api from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";

type SortBy = "enrollments" | "revenue" | "rating";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  iconBg,
  iconColor,
}: {
  icon: ElementType;
  label: string;
  value: string | number;
  sub: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-slate-300 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <TrendingUp className="w-4 h-4 text-emerald-500" />
      </div>
      <p className="text-2xl font-extrabold text-slate-900 mb-1">{value}</p>
      <p className="text-sm font-semibold text-slate-700 mb-0.5">{label}</p>
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
  );
}

function EnrollmentRow({ enrollment }: { enrollment: any }) {
  const isCompleted = enrollment.status === "COMPLETED";

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="py-3.5 px-4">
        <p className="font-medium text-slate-800 text-sm">
          {enrollment.student?.name ?? "Student"}
        </p>
        <p className="text-xs text-slate-400">
          {enrollment.student?.email ?? ""}
        </p>
      </td>

      <td className="py-3.5 px-4 text-sm text-slate-500 hidden sm:table-cell max-w-[180px] truncate">
        {enrollment.course?.title ?? "Course"}
      </td>

      <td className="py-3.5 px-4 hidden md:table-cell">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-100 rounded-full h-1.5 min-w-[60px]">
            <div
              className={`h-1.5 rounded-full ${
                isCompleted ? "bg-emerald-500" : "bg-indigo-500"
              }`}
              style={{ width: `${enrollment.progress ?? 0}%` }}
            />
          </div>
          <span className="text-xs font-medium text-slate-600">
            {enrollment.progress ?? 0}%
          </span>
        </div>
      </td>

      <td className="py-3.5 px-4">
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
            isCompleted
              ? "bg-emerald-100 text-emerald-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-3 h-3" />
          ) : (
            <Clock className="w-3 h-3" />
          )}
          {isCompleted ? "Completed" : "Active"}
        </span>
      </td>
    </tr>
  );
}

function ReviewCard({ review }: { review: any }) {
  const name = review.student?.name ?? "Student";
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex gap-3 py-4 border-b border-slate-100 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className="font-semibold text-slate-900 text-sm truncate">
            {name}
          </p>
          <div className="flex gap-0.5 flex-shrink-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < review.rating
                    ? "text-amber-400 fill-amber-400"
                    : "text-slate-200 fill-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-1">
          {review.course?.title ?? ""}
        </p>
        <p className="text-xs text-slate-600 line-clamp-2">{review.comment}</p>
      </div>
    </div>
  );
}

function getNumber(...values: unknown[]) {
  for (const value of values) {
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) return numeric;
  }
  return 0;
}

function getAverageRating(course: any) {
  return getNumber(course.average_rating, course.avgRating, course.rating);
}

function getEnrollmentCount(course: any) {
  return getNumber(
    course.enrollment_count,
    course.enrollmentCount,
    course.totalEnrollments,
    course._count?.enrollments,
  );
}

function getTotalRevenue(course: any) {
  return getNumber(
    course.total_revenue,
    course.totalRevenue,
    course.revenue,
    course.earnings,
  );
}

function CourseStatusBadge({ status }: { status?: string }) {
  const normalized = status ?? "DRAFT";

  const styles: Record<string, string> = {
    APPROVED: "bg-emerald-100 text-emerald-700",
    PENDING: "bg-amber-100 text-amber-700",
    REJECTED: "bg-rose-100 text-rose-700",
    DRAFT: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
        styles[normalized] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {normalized}
    </span>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={`w-3.5 h-3.5 ${
              index < Math.round(rating)
                ? "text-amber-400 fill-amber-400"
                : "text-slate-200 fill-slate-200"
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-slate-600">
        {rating > 0 ? rating.toFixed(1) : "—"}
      </span>
    </div>
  );
}

function TopCourseRow({ course }: { course: any }) {
  const enrollmentCount = getEnrollmentCount(course);
  const averageRating = getAverageRating(course);
  const totalRevenue = getTotalRevenue(course);

  return (
    <div className="flex flex-col gap-4 p-4 border-b border-slate-100 last:border-0 lg:flex-row lg:items-center lg:justify-between hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-4 min-w-0">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-16 h-12 rounded-xl object-cover border border-slate-100 flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-indigo-600" />
          </div>
        )}

        <div className="min-w-0">
          <p className="font-bold text-slate-900 text-sm truncate">
            {course.title ?? "Untitled Course"}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <CourseStatusBadge status={course.status} />
            <RatingStars rating={averageRating} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 lg:w-[420px]">
        <div>
          <p className="text-xs text-slate-400">Enrollments</p>
          <p className="text-sm font-bold text-slate-900">{enrollmentCount}</p>
        </div>

        <div>
          <p className="text-xs text-slate-400">Revenue</p>
          <p className="text-sm font-bold text-slate-900">
            ৳{totalRevenue.toLocaleString()}
          </p>
        </div>

        <div className="flex justify-end items-center">
          <Link
            href={`/teacher/courses/${course.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-bold hover:bg-indigo-100 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            View Course
          </Link>
        </div>
      </div>
    </div>
  );
}

function TopPerformingCoursesSection({ courses }: { courses: any[] }) {
  const [sortBy, setSortBy] = useState<SortBy>("enrollments");

  const sortedCourses = useMemo(() => {
    const sorted = [...courses];

    sorted.sort((a, b) => {
      if (sortBy === "revenue") return getTotalRevenue(b) - getTotalRevenue(a);
      if (sortBy === "rating") return getAverageRating(b) - getAverageRating(a);
      return getEnrollmentCount(b) - getEnrollmentCount(a);
    });

    return sorted.slice(0, 5);
  }, [courses, sortBy]);

  return (
    <section className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Top Performing Courses
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked by enrollments, revenue, and ratings.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { key: "enrollments", label: "By Enrollments" },
            { key: "revenue", label: "By Revenue" },
            { key: "rating", label: "By Rating" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setSortBy(item.key as SortBy)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                sortBy === item.key
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {sortedCourses.length === 0 ? (
          <div className="py-14 text-center">
            <Award className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">
              No courses yet.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Top performing courses will appear here after publishing courses.
            </p>
          </div>
        ) : (
          sortedCourses.map((course) => (
            <TopCourseRow key={course.id} course={course} />
          ))
        )}
      </div>
    </section>
  );
}

function TeacherDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, coursesRes] = await Promise.all([
          api.get("/api/users/teacher/stats"),
          api.get("/api/teacher/courses"),
        ]);

        setStats(statsRes.data.data);

        const courseList: any[] = coursesRes.data.data.data ?? [];
        setCourses(courseList);

        if (courseList.length > 0) {
          const firstCourseIds = courseList.slice(0, 3).map((c: any) => c.id);

          const [enrollRes, ...reviewResults] = await Promise.all([
            api.get(
              `/api/courses/${firstCourseIds[0]}/enrolled-students?limit=5`,
            ),
            ...firstCourseIds.map((id: string) =>
              api.get(`/api/courses/${id}/reviews`),
            ),
          ]);

          const enrollData = enrollRes.data.data.data ?? [];
          const allReviews = reviewResults.flatMap(
            (r) => r.data.data.data ?? [],
          );

          setEnrollments(enrollData);
          setReviews(allReviews);
        }
      } catch {
        // Keep dashboard usable with empty states if one request fails.
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col flex-1">
        <TopBar placeholder="Search courses, students…" />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </main>
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const totalStudents = stats?.totalStudents ?? 0;
  const totalCourses = stats?.totalCourses ?? 0;
  const totalEarnings = stats?.totalEarnings ?? 0;

  const ratedCourses = courses.filter((c: any) => (c.totalReviews ?? 0) > 0);
  const avgRating =
    ratedCourses.length > 0
      ? (
          ratedCourses.reduce(
            (s: number, c: any) => s + (c.avgRating ?? 0),
            0,
          ) / ratedCourses.length
        ).toFixed(1)
      : "—";

  return (
    <div className="flex flex-col flex-1">
      <TopBar placeholder="Search courses, students…" />

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-slate-500 mt-1">
            You have{" "}
            <span className="font-semibold text-indigo-600">
              {totalStudents} total student{totalStudents !== 1 ? "s" : ""}
            </span>{" "}
            across {totalCourses} course{totalCourses !== 1 ? "s" : ""}.
          </p>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={BookOpen}
            label="Total Courses"
            value={totalCourses}
            sub="All your courses"
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
          />

          <StatCard
            icon={Users}
            label="Total Students"
            value={totalStudents}
            sub="Across all courses"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />

          <StatCard
            icon={TrendingUp}
            label="Total Earnings"
            value={`TK${totalEarnings.toLocaleString()}`}
            sub="BDT lifetime earnings"
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />

          <StatCard
            icon={Star}
            label="Avg Rating"
            value={avgRating}
            sub="Across rated courses"
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
        </div>

        <div className="grid xl:grid-cols-3 gap-6 mb-6">
          <div className="xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">
                Recent Enrollments
              </h2>
              <Link
                href="/teacher/enrollments"
                className="flex items-center gap-1 text-sm text-indigo-600 font-semibold hover:text-indigo-700"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Student
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">
                      Course
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">
                      Progress
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {enrollments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-slate-400 text-sm"
                      >
                        No enrollments yet.
                      </td>
                    </tr>
                  ) : (
                    enrollments
                      .slice(0, 5)
                      .map((enrollment: any) => (
                        <EnrollmentRow
                          key={enrollment.id}
                          enrollment={enrollment}
                        />
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">
                Recent Reviews
              </h2>
              <Link
                href="/teacher/reviews"
                className="flex items-center gap-1 text-sm text-indigo-600 font-semibold hover:text-indigo-700"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl px-5 py-2">
              {reviews.length > 0 ? (
                reviews
                  .slice(0, 3)
                  .map((review: any) => (
                    <ReviewCard key={review.id} review={review} />
                  ))
              ) : (
                <p className="py-8 text-center text-slate-400 text-sm">
                  No reviews yet.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">
                Earnings This Month
              </h2>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <p className="text-3xl font-extrabold text-slate-900">
                TK{(stats?.thisMonthEarnings ?? 0).toLocaleString()}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                BDT earned this month
              </p>
            </div>
          </div>

          <EarningsChart />
        </div>

        <TopPerformingCoursesSection courses={courses} />
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <TeacherDashboardPage />
    </Suspense>
  )
}
