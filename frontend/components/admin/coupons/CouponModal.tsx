"use client";
import { useEffect, useState } from "react";
import { Coupon, CouponPayload, createCoupon, updateCoupon } from "@/lib/couponApi";

interface Props {
  isOpen: boolean;
  coupon: Coupon | null;
  onClose: () => void;
  onSuccess: () => void;
}

const defaultForm: CouponPayload = {
  name: "",
  code: "",
  discountType: "PERCENTAGE",
  discountValue: 0,
  expiresAt: "",
  status: true,
};

export default function CouponModal({ isOpen, coupon, onClose, onSuccess }: Props) {
  const [form, setForm] = useState<CouponPayload>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (coupon) {
      setForm({
        name: coupon.name,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        expiresAt: coupon.expiresAt.slice(0, 10), // yyyy-mm-dd format
        status: coupon.status,
      });
    } else {
      setForm(defaultForm);
    }
    setError("");
  }, [coupon, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "code"
          ? value.toUpperCase()
          : value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      if (coupon) {
        await updateCoupon(coupon.id, form);
      } else {
        await createCoupon(form);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4">
          {coupon ? "Edit Coupon" : "Add Coupon"}
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-3 bg-red-50 p-2 rounded">{error}</p>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
              placeholder="Summer Sale"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Code</label>
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1 text-sm uppercase"
              placeholder="SUMMER20"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Discount Type</label>
            <select
              name="discountType"
              value={form.discountType}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED">Fixed Amount ($)</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Discount Value</label>
            <input
              name="discountValue"
              type="number"
              value={form.discountValue}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
              placeholder="20"
              min={1}
              max={form.discountType === "PERCENTAGE" ? 100 : undefined}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Expiry Date</label>
            <input
              name="expiresAt"
              type="date"
              value={form.expiresAt}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
              min={new Date().toISOString().slice(0, 10)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              name="status"
              type="checkbox"
              checked={form.status}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <label className="text-sm font-medium">Active</label>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : coupon ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}