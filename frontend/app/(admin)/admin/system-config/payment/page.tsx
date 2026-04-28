"use client";

import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

type PaymentForm = {
  currency: string;
  currency_symbol: string;
  stripe_enabled: string;
  stripe_public_key: string;
  stripe_secret_key: string;
  paypal_enabled: string;
  paypal_client_id: string;
  paypal_client_secret: string;
  manual_payment_enabled: string;
  manual_payment_instructions: string;
};

export default function PaymentGatewaysPage() {
  const [form, setForm] = useState<PaymentForm>({
    currency: "BDT",
    currency_symbol: "৳",
    stripe_enabled: "false",
    stripe_public_key: "",
    stripe_secret_key: "",
    paypal_enabled: "false",
    paypal_client_id: "",
    paypal_client_secret: "",
    manual_payment_enabled: "false",
    manual_payment_instructions: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const token = localStorage.getItem("admin_token");
        // ✅ FIX 1:  new endpoint
        const res = await fetch(`${API}/api/system-config?group=payment`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        // ✅ FIX 2: data.success + data.data → data.payment
        if (data.payment) {
          setForm((prev) => ({ ...prev, ...data.payment }));
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
        body: JSON.stringify({ group: "payment", settings: form }),
      });
      const data = await res.json();
      setMessage(data.payment ? "✓ Settings saved!" : "✗ Failed to save.");
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
          Payment Gateways
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure payment methods to accept payments from students
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Stripe */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Stripe
            </h2>
            <select
              name="stripe_enabled"
              value={form.stripe_enabled}
              onChange={handleChange}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>

          {form.stripe_enabled === "true" && (
            <>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Stripe Public Key
                </label>
                <input
                  name="stripe_public_key"
                  value={form.stripe_public_key}
                  onChange={handleChange}
                  placeholder="pk_live_..."
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Stripe Secret Key
                </label>
                <input
                  name="stripe_secret_key"
                  value={form.stripe_secret_key}
                  onChange={handleChange}
                  type="password"
                  placeholder="sk_live_..."
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </>
          )}
        </div>

        {/* PayPal */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              PayPal
            </h2>
            <select
              name="paypal_enabled"
              value={form.paypal_enabled}
              onChange={handleChange}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>

          {form.paypal_enabled === "true" && (
            <>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  PayPal Client ID
                </label>
                <input
                  name="paypal_client_id"
                  value={form.paypal_client_id}
                  onChange={handleChange}
                  placeholder="AXxx..."
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  PayPal Client Secret
                </label>
                <input
                  name="paypal_client_secret"
                  value={form.paypal_client_secret}
                  onChange={handleChange}
                  type="password"
                  placeholder="EXxx..."
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </>
          )}
        </div>

        {/* Manual Payment */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Manual Payment
            </h2>
            <select
              name="manual_payment_enabled"
              value={form.manual_payment_enabled}
              onChange={handleChange}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>

          {form.manual_payment_enabled === "true" && (
            <div>
              <label className="text-sm font-medium text-slate-700">
                Payment Instructions
              </label>
              <textarea
                name="manual_payment_instructions"
                value={form.manual_payment_instructions}
                onChange={handleChange}
                rows={3}
                placeholder="e.g. Send payment to bKash: 01XXXXXXXXX"
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
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