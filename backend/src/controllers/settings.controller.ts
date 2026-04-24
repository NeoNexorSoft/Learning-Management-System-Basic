import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { v4 as uuidv4 } from "uuid";

export const settingsController = {
  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const group =
        typeof req.query.group === "string" ? req.query.group : undefined;

      const settings = await prisma.systemSetting.findMany({
        where: group ? { group } : undefined,
        orderBy: { key: "asc" },
      });

      const data = settings.reduce<Record<string, string>>((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});

      return res.json({
        status: "success",
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const group =
        typeof req.body.group === "string" && req.body.group.trim()
          ? req.body.group.trim()
          : "general";

      const settings = req.body.settings;

      if (
        !settings ||
        typeof settings !== "object" ||
        Array.isArray(settings)
      ) {
        return res.status(400).json({
          status: "error",
          message: "settings object is required",
        });
      }

      const entries = Object.entries(settings);

      await Promise.all(
        entries.map(([key, value]) =>
          prisma.systemSetting.upsert({
            where: { key },
            update: {
              value: String(value ?? ""),
              group,
            },
            create: {
              id: uuidv4(),
              key,
              value: String(value ?? ""),
              group,
            },
          }),
        ),
      );

      const updatedSettings = await prisma.systemSetting.findMany({
        where: { group },
        orderBy: { key: "asc" },
      });

      const data = updatedSettings.reduce<Record<string, string>>(
        (acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        },
        {},
      );

      return res.json({
        status: "success",
        message: "Settings updated successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};
