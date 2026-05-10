import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Access Denied – Neo Nexor" }

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Access Denied</h1>
        <p className="text-slate-500 mb-8">
          You do not have permission to view this page. Please log in with an account that has the required role.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth/login/student"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            Student Login
          </Link>
          <Link
            href="/auth/login/teacher"
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl transition-colors text-sm"
          >
            Teacher Login
          </Link>
        </div>
        <Link href="/" className="inline-block mt-6 text-sm text-slate-400 hover:text-indigo-600 transition-colors">
          ← Back to Home
        </Link>
      </div>
    </main>
  )
}
