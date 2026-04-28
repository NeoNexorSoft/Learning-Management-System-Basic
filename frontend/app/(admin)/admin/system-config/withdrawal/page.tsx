"use client";

import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

type WithdrawalForm = {
  min_withdrawal_amount: string;
  max_withdrawal_amount: string;
  withdrawal_fee_type: string;
  withdrawal_fee_value: string;
  bank_transfer_enabled: string;
  bank_transfer_instructions: string;
  bkash_enabled: string;
  bkash_number: string;
  paypal_withdrawal_enabled: string;
  paypal_withdrawal_email: string;
};

export default function WithdrawalMethodsPage() {
  const [form, setForm] = useState<WithdrawalForm>({
    min_withdrawal_amount: "500",
    max_withdrawal_amount: "50000",
    withdrawal_fee_type: "percentage",
    withdrawal_fee_value: "5",
    bank_transfer_enabled: "false",
    bank_transfer_instructions: "",
    bkash_enabled: "false",
    bkash_number: "",
    paypal_withdrawal_enabled: "false",
    paypal_withdrawal_email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const token = localStorage.getItem("admin_token");
        // ✅ FIX 1: new//  endpoint
        const res = await fetch(`${API}/api/system-config?group=withdrawal`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        // ✅ FIX 2: data.success + data.data → data.withdrawal
        if (data.withdrawal) {
          setForm((prev) => ({ ...prev, ...data.withdrawal }));
        }
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  function handleChange(
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const token = localStorage.getItem("admin_token");
      // ✅ FIX 3: PUT → PATCH, new endpoint
      const res = await fetch(`${API}/api/system-config`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ group: "withdrawal", settings: form }),
      });
      const data = await res.json();
      setMessage(data.success ? "✓ Settings saved!" : "✗ Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800">
          Withdrawal Methods
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Setup payout methods for instructor withdrawals
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Limits & Fees */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Limits & Fees
          </h2>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700">
                Minimum Amount (৳)
              </label>
              <input
                name="min_withdrawal_amount"
                type="number"
                value={form.min_withdrawal_amount}
                onChange={handleChange}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700">
                Maximum Amount (৳)
              </label>
              <input
                name="max_withdrawal_amount"
                type="number"
                value={form.max_withdrawal_amount}
                onChange={handleChange}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700">
                Fee Type
              </label>
              <select
                name="withdrawal_fee_type"
                value={form.withdrawal_fee_type}
                onChange={handleChange}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (৳)</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700">
                Fee Value
              </label>
              <input
                name="withdrawal_fee_value"
                type="number"
                value={form.withdrawal_fee_value}
                onChange={handleChange}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Bank Transfer */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Bank Transfer
            </h2>
            <select
              name="bank_transfer_enabled"
              value={form.bank_transfer_enabled}
              onChange={handleChange}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>

          {form.bank_transfer_enabled === "true" && (
            <div>
              <label className="text-sm font-medium text-slate-700">
                Bank Transfer Instructions
              </label>
              <textarea
                name="bank_transfer_instructions"
                value={form.bank_transfer_instructions}
                onChange={handleChange}
                rows={3}
                placeholder="e.g. Bank: Dutch Bangla, Account: XXXXXXXXXX"
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          )}
        </div>

        {/* bKash */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              bKash
            </h2>
            <select
              name="bkash_enabled"
              value={form.bkash_enabled}
              onChange={handleChange}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>

          {form.bkash_enabled === "true" && (
            <div>
              <label className="text-sm font-medium text-slate-700">
                bKash Number
              </label>
              <input
                name="bkash_number"
                value={form.bkash_number}
                onChange={handleChange}
                placeholder="01XXXXXXXXX"
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        {/* PayPal Withdrawal */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              PayPal
            </h2>
            <select
              name="paypal_withdrawal_enabled"
              value={form.paypal_withdrawal_enabled}
              onChange={handleChange}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>

          {form.paypal_withdrawal_enabled === "true" && (
            <div>
              <label className="text-sm font-medium text-slate-700">
                PayPal Email
              </label>
              <input
                name="paypal_withdrawal_email"
                type="email"
                value={form.paypal_withdrawal_email}
                onChange={handleChange}
                placeholder="paypal@example.com"
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Save */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
          {message && <span className="text-sm text-slate-600">{message}</span>}
        </div>
      </form>
    </div>
  );
}