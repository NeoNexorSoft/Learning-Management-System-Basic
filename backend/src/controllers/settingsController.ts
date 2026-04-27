import { Request, Response } from "express";
import { prisma } from "../config/db";

/**
 * @desc    Get system settings (optionally filtered by group)
 * @route   GET /api/settings?group=general
 * @access  Admin
 */
export async function getSettings(req: Request, res: Response) {
  try {
    const group = req.query.group as string | undefined;

    const settings = await prisma.systemSetting.findMany({
      where: group ? { group } : undefined,
    });

    // Convert array of settings into key-value object
    const result: Record<string, string> = {};
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch settings",
    });
  }
}

/**
 * @desc    Update system settings (bulk upsert)
 * @route   PUT /api/settings
 * @access  Admin
 */
export async function updateSettings(req: Request, res: Response) {
  try {
    const { group, settings } = req.body as {
      group?: string;
      settings?: Record<string, unknown>;
    };

    // Basic validation
    if (!group || typeof group !== "string") {
      return res.status(400).json({
        success: false,
        message: "Valid 'group' is required",
      });
    }

    if (!settings || typeof settings !== "object") {
      return res.status(400).json({
        success: false,
        message: "'settings' must be a valid object",
      });
    }

    const entries = Object.entries(settings);

    if (entries.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Settings object cannot be empty",
      });
    }

    // Prepare upsert operations
    const operations = entries.map(([key, value]) => {
      return prisma.systemSetting.upsert({
        where: { key },
        update: {
          value: String(value),
          group,
        },
        create: {
          key,
          value: String(value),
          group,
        },
      });
    });

    // Execute all operations in a transaction
    await prisma.$transaction(operations);

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating settings:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update settings",
    });
  }
}
