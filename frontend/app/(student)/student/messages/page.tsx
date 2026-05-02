import { Suspense } from "react"
import { MessageSquare } from "lucide-react"
import PageHeader from "@/components/shared/PageHeader"

function StudentMessagesPage() {
  return (
    <div className="flex flex-col flex-1">

      <main className="flex-1 p-6 overflow-y-auto">
        <PageHeader title="Messages" subtitle="Your conversations with instructors" />
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-indigo-400" />
          </div>
          <p className="text-slate-700 font-semibold mb-1">No messages yet</p>
          <p className="text-slate-400 text-sm">Messages from your instructors will appear here.</p>
        </div>
      </main>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense>
      <StudentMessagesPage />
    </Suspense>
  )
}
