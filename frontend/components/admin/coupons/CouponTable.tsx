"use client";
import { Coupon } from "@/lib/couponApi";

interface Props {
  coupons: Coupon[];
  onEdit: (coupon: Coupon) => void;
  onToggle: (coupon: Coupon) => void;
}

export default function CouponTable({ coupons, onEdit, onToggle }: Props) {
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const isExpired = (dateStr: string) => new Date(dateStr) < new Date();

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left">Code</th>
            <th className="px-4 py-3 text-left">Type</th>
            <th className="px-4 py-3 text-left">Value</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Expires</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {coupons.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-10 text-gray-400">
                No coupons found
              </td>
            </tr>
          ) : (
            coupons.map((coupon) => (
              <tr
                key={coupon.id}
                className={isExpired(coupon.expiresAt) ? "opacity-50" : ""}
              >
                <td className="px-4 py-3 font-medium">{coupon.name}</td>
                <td className="px-4 py-3">
                  <span className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                    {coupon.code}
                  </span>
                </td>
                <td className="px-4 py-3">{coupon.discountType}</td>
                <td className="px-4 py-3">
                  {coupon.discountType === "PERCENTAGE"
                    ? `${coupon.discountValue}%`
                    : `$${coupon.discountValue}`}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      coupon.status
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {coupon.status ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={isExpired(coupon.expiresAt) ? "text-red-500" : ""}>
                    {formatDate(coupon.expiresAt)}
                    {isExpired(coupon.expiresAt) && (
                      <span className="ml-1 text-xs">(Expired)</span>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => onEdit(coupon)}
                    className="text-blue-600 hover:underline text-xs font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onToggle(coupon)}
                    className={`text-xs font-medium ${
                      coupon.status
                        ? "text-red-500 hover:underline"
                        : "text-green-600 hover:underline"
                    }`}
                  >
                    {coupon.status ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}