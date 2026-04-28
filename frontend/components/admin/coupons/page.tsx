"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Coupon,
  getCoupons,
  toggleCoupon,
} from "@/lib/couponApi";
import CouponTable from "@/components/admin/coupons/CouponTable";
import CouponModal from "@/components/admin/coupons/CouponModal";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCoupons(search || undefined);
      setCoupons(data);
    } catch (err) {
      console.error("Failed to fetch coupons", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCoupons();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchCoupons]);

  const handleEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedCoupon(null);
    setIsModalOpen(true);
  };

  const handleToggle = async (coupon: Coupon) => {
    try {
      const updated = await toggleCoupon(coupon.id);
      // Optimistic update — no full refetch needed
      setCoupons((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
    } catch (err) {
      console.error("Toggle failed", err);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCoupon(null);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage discount coupons for your courses
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Add Coupon
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or code..."
          className="border rounded-lg px-4 py-2 text-sm w-full max-w-sm"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : (
        <CouponTable
          coupons={coupons}
          onEdit={handleEdit}
          onToggle={handleToggle}
        />
      )}

      {/* Modal */}
      <CouponModal
        isOpen={isModalOpen}
        coupon={selectedCoupon}
        onClose={handleModalClose}
        onSuccess={fetchCoupons}
      />
    </div>
  );
}