import { Request, Response } from "express";
import { PrismaClient, DiscountType } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/admin/coupons?search=
export const getCoupons = async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string | undefined;

    const coupons = await prisma.coupon.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { code: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { created_at: "desc" },
    });

    return res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/admin/coupons
export const createCoupon = async (req: Request, res: Response) => {
  try {
    const { name, code, discountType, discountValue, expiresAt, status } =
      req.body;

    if (!name || !code || !discountType || !discountValue || !expiresAt) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (!Object.values(DiscountType).includes(discountType)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid discount type" });
    }

    const parsedValue = Number(discountValue);

    if (isNaN(parsedValue) || parsedValue <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Discount value must be a positive number" });
    }

    if (discountType === DiscountType.PERCENTAGE && parsedValue > 100) {
      return res
        .status(400)
        .json({ success: false, message: "Percentage cannot exceed 100" });
    }

    const expiry = new Date(expiresAt);
    if (isNaN(expiry.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid expiry date format" });
    }

    if (expiry <= new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "Expiry date must be in the future" });
    }

    const normalizedCode = String(code).toUpperCase().trim();

    const coupon = await prisma.coupon.create({
      data: {
        name: String(name).trim(),
        code: normalizedCode,
        discount_type: discountType as DiscountType,
        value: parsedValue,
        expires_at: expiry,
        is_active: status !== undefined ? Boolean(status) : true,
      },
    });

    return res.status(201).json({ success: true, data: coupon });
  } catch (error: any) {
    console.error("CREATE COUPON ERROR:", error);  // new line added for debugging
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ success: false, message: "Coupon code already exists" });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/admin/coupons/:id
export const updateCoupon = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, code, discountType, discountValue, expiresAt, status } =
      req.body;

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }

    if (discountType && !Object.values(DiscountType).includes(discountType)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid discount type" });
    }

    const resolvedDiscountType: DiscountType =
      discountType ?? existing.discount_type;

    const resolvedDiscountValue =
      discountValue !== undefined ? Number(discountValue) : existing.value;

    if (isNaN(Number(resolvedDiscountValue)) || Number(resolvedDiscountValue) <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Discount value must be a positive number" });
    }

    if (
      resolvedDiscountType === DiscountType.PERCENTAGE &&
      Number(resolvedDiscountValue) > 100
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Percentage cannot exceed 100" });
    }

    if (expiresAt) {
      const expiry = new Date(expiresAt);
      if (isNaN(expiry.getTime())) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid expiry date format" });
      }
      if (expiry <= new Date()) {
        return res
          .status(400)
          .json({ success: false, message: "Expiry date must be in the future" });
      }
    }

    const normalizedCode = code
      ? String(code).toUpperCase().trim()
      : existing.code;

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        name: name ? String(name).trim() : existing.name,
        code: normalizedCode,
        discount_type: resolvedDiscountType,
        value: resolvedDiscountValue,
        expires_at: expiresAt ? new Date(expiresAt) : existing.expires_at,
        is_active: status !== undefined ? Boolean(status) : existing.is_active,
      },
    });

    return res.status(200).json({ success: true, data: coupon });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ success: false, message: "Coupon code already exists" });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// PATCH /api/admin/coupons/:id/toggle
export const toggleCoupon = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: { is_active: !existing.is_active },
    });

    return res.status(200).json({ success: true, data: coupon });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/admin/coupons/:id
export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }

    await prisma.coupon.delete({ where: { id } });

    return res.status(200).json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/coupons/validate
// Body: { code: string, cartTotal: number }
export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon code is required" });
    }

    const normalizedCode = String(code).toUpperCase().trim();

    const coupon = await prisma.coupon.findUnique({
      where: { code: normalizedCode },
    });

    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid coupon code" });
    }

    if (!coupon.is_active) {
      return res
        .status(400)
        .json({ success: false, message: "This coupon is no longer active" });
    }

    if (coupon.expires_at && new Date(coupon.expires_at) <= new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "This coupon has expired" });
    }

    const total = Number(cartTotal) || 0;
    let discountAmount = 0;

    if (coupon.discount_type === DiscountType.PERCENTAGE) {
      discountAmount = (total * Number(coupon.value)) / 100;
    } else {
      // FLAT discount
    discountAmount = Math.min(Number(coupon.value), total);
    }

    const finalTotal = Math.max(0, total - discountAmount);

    return res.status(200).json({
      success: true,
      data: {
        couponId: coupon.id,
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: coupon.value,
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        finalTotal: parseFloat(finalTotal.toFixed(2)),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};