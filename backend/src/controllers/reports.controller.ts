import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

function parseBooleanFilter(value: unknown): boolean | undefined {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

function parseDate(value: unknown): Date | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export const reportsController = {
  async getNotificationHistory(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const search =
        typeof req.query.search === "string" ? req.query.search.trim() : "";

      const isRead = parseBooleanFilter(req.query.is_read);
      const dateFrom = parseDate(req.query.date_from);
      const dateTo = parseDate(req.query.date_to);

      const page = Math.max(Number(req.query.page) || DEFAULT_PAGE, 1);
      const limit = Math.min(
        Math.max(Number(req.query.limit) || DEFAULT_LIMIT, 1),
        MAX_LIMIT,
      );
      const skip = (page - 1) * limit;

      const where: Prisma.NotificationWhereInput = {};

      if (typeof isRead === "boolean") {
        where.is_read = isRead;
      }

      if (dateFrom || dateTo) {
        where.created_at = {};

        if (dateFrom) {
          where.created_at.gte = dateFrom;
        }

        if (dateTo) {
          where.created_at.lte = dateTo;
        }
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { message: { contains: search, mode: "insensitive" } },
          { user: { name: { contains: search, mode: "insensitive" } } },
          { user: { email: { contains: search, mode: "insensitive" } } },
        ];
      }

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            created_at: "desc",
          },
          skip,
          take: limit,
        }),
        prisma.notification.count({ where }),
      ]);

      return res.json({
        status: "success",
        data: {
          notifications,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
