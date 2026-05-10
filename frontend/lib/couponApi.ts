import api from "./axios";

export interface Coupon {
  id: number;
  name: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  status: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CouponPayload {
  name: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  expiresAt: string;
  status?: boolean;
}

export const getCoupons = async (search?: string): Promise<Coupon[]> => {
  const params = search ? { search } : {};
  const res = await api.get("/api/admin/coupons", { params });
  return res.data.data;
};

export const createCoupon = async (data: CouponPayload): Promise<Coupon> => {
  const res = await api.post("/api/admin/coupons", data);
  return res.data.data;
};

export const updateCoupon = async (
  id: number,
  data: Partial<CouponPayload>
): Promise<Coupon> => {
  const res = await api.put(`/api/admin/coupons/${id}`, data);
  return res.data.data;
};

export const toggleCoupon = async (id: number): Promise<Coupon> => {
  const res = await api.patch(`/api/admin/coupons/${id}/toggle`);
  return res.data.data;
};