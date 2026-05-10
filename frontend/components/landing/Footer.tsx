import Link from "next/link"
import { BrandIcon, BRAND_NAME, BRAND_ICON_BG, BRAND_ICON_COLOR } from "@/lib/brand"

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className={`w-9 h-9 ${BRAND_ICON_BG} rounded-xl flex items-center justify-center`}>
                <BrandIcon className={`w-5 h-5 ${BRAND_ICON_COLOR}`} />
              </div>
              <span className="text-lg font-bold text-white">{BRAND_NAME}</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Empowering learners and educators with world-class online education.
            </p>
          </div>

          {[
            { title: "Platform", links: [{ href: "/courses", label: "Browse Courses" }, { href: "/about", label: "About Us" }, { href: "/blogs", label: "Blog" }] },
            { title: "For Teachers", links: [{ href: "/auth/register/teacher", label: "Become a Teacher" }, { href: "/auth/login/teacher", label: "Teacher Login" }] },
            { title: "Support", links: [{ href: "/contact", label: "Contact Us" }, { href: "/auth/login/student", label: "Student Login" }, { href: "/auth/register/student", label: "Sign Up Free" }] },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-6 text-center text-xs">
          &copy; {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
