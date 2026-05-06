"use client";

import { useState , Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  Image,
  Award,
  CreditCard,
  Wallet,
  Globe,
  Monitor,
  Languages,
  Search,
} from "lucide-react";

const configCards = [
  {
    icon: Settings,
    title: "General Settings",
    desc: "Site name, email, phone, timezone and basic info.",
    href: "/admin/system-config/general",
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    icon: Image,
    title: "Logo & Favicon",
    desc: "Upload your site logo and browser favicon.",
    href: "/admin/system-config/logo",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: Award,
    title: "Certificate Setup",
    desc: "Design and configure course completion certificates.",
    href: "/admin/system-config/certificate",
    color: "bg-amber-100 text-amber-600",
  },
  {
    icon: CreditCard,
    title: "Payment Gateways",
    desc: "Configure payment methods to accept payments.",
    href: "/admin/system-config/payment",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Wallet,
    title: "Withdrawal Methods",
    desc: "Setup payout methods for instructor withdrawals.",
    href: "/admin/system-config/withdrawal",
    color: "bg-pink-100 text-pink-600",
  },
  {
    icon: Globe,
    title: "SEO Configuration",
    desc: "Meta title, description and keywords for search engines.",
    href: "/admin/system-config/seo",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: Monitor,
    title: "Frontend Management",
    desc: "Control homepage content, banners and layout.",
    href: "/admin/system-config/frontend",
    color: "bg-orange-100 text-orange-600",
  },
  {
    icon: Languages,
    title: "Language Settings",
    desc: "Set site language and configure localization options.",
    href: "/admin/system-config/language",
    color: "bg-slate-100 text-slate-600",
  },
];

function SystemConfigPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = configCards.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.desc.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">
          System Configuration
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage all system-wide settings
        </p>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search settings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.href}
              onClick={() => router.push(card.href)}
              className="flex items-start gap-4 p-5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-400 hover:shadow-md transition-all text-left"
            >
              <div className={`p-2.5 rounded-xl ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-slate-800 text-sm">
                  {card.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {card.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <SystemConfigPage />
    </Suspense>
  )
}
