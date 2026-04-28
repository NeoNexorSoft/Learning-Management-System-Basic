import { Request, Response } from "express";
import {
  getSystemConfig,
  updateSystemConfig,
} from "../services/systemConfig.service";

export async function getConfig(req: Request, res: Response) {
  try {
    const { group } = req.query;
    const data = await getSystemConfig(group as string | undefined);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch config" });
  }
}

export async function updateConfig(req: Request, res: Response) {
  try {
    const { group, settings } = req.body;
    if (!group || !settings) {
      return res.status(400).json({ error: "group and settings are required" });
    }
    const result = await updateSystemConfig(group, settings);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to update config" });
  }
}