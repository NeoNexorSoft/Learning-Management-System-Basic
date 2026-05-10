"use client"

import { useState, useEffect, type FormEvent } from "react"
import { Wallet, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import TopBar from "@/components/shared/TopBar"
import api from "@/lib/axios"

const METHODS = ["bKash", "Nagad", "Bank Transfer"]

export default function WithdrawPage() {
  const [balance, setBalance]     = useState(0)
  const [amount, setAmount]       = useState("")
  const [method, setMethod]       = useState(METHODS[0])
  const [success, setSuccess]     = useState(false)
  const [error, setError]         = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    api.get("/api/users/teacher/stats")
      .then(({ data }) => {
        setBalance(Number(data.data?.availableBalance ?? 0))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const num = Number(amount)
    if (!num || num <= 0) { setError("Enter a valid amount."); return }
    if (num > balance)    { setError("Amount exceeds available balance."); return }
    if (num < 500)        { setError("Minimum withdrawal amount is TK500 BDT."); return }
    setError("")
    setSubmitting(true)
    try {
      await api.post("/api/withdrawals", { amount: num, method })
      setSuccess(true)
      setAmount("")
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to submit withdrawal request.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <TopBar placeholder="Search…" />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900">Withdraw</h1>
          <p className="text-slate-500 mt-1">Request a withdrawal to your preferred payment method.</p>
        </div>

        <div className="max-w-2xl space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-5 h-5 opacity-80" />
              <span className="text-sm font-medium opacity-80">Available Balance</span>
            </div>
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <p className="text-4xl font-extrabold mb-1">TK{balance.toLocaleString()}</p>
                <p className="text-sm opacity-70">BDT</p>
              </>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-base font-bold text-slate-900 mb-5">Withdrawal Request</h2>

            {success && (
              <div className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl mb-5 text-emerald-700 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                Withdrawal request submitted! It will be processed within 2–3 business days.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Amount (TK BDT)</label>
                <input
                  type="number" min={500} max={balance}
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setError(""); setSuccess(false) }}
                  placeholder="e.g. 5000"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
                <p className="text-xs text-slate-400 mt-1">Minimum: TK500 BDT</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-3 gap-3">
                  {METHODS.map((m) => (
                    <button key={m} type="button" onClick={() => setMethod(m)}
                      className={`py-2.5 rounded-xl text-sm font-semibold transition-all border ${method === m ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button type="submit" disabled={submitting || loading}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/20 disabled:opacity-70">
                {submitting ? "Submitting…" : "Request Withdrawal"}
              </button>
            </form>
          </div>

          <div className="flex items-start gap-2 text-sm text-slate-500 bg-slate-50 rounded-xl p-4 border border-slate-200">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p>Withdrawals are processed within 2–3 business days. Ensure your payment details are up to date in Settings.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
