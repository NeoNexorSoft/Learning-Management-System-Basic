import { prisma } from "../config/db";

export async function getSystemConfig(group?: string) {
  const settings = await prisma.systemSetting.findMany({
    where: group ? { group } : undefined,
  });

  const result: Record<string, Record<string, string>> = {};
  for (const s of settings) {
    if (!result[s.group]) result[s.group] = {};
    result[s.group][s.key] = s.value;
  }
  return result;
}

export async function updateSystemConfig(
  group: string,
  settings: Record<string, string>
) {
  const updates = Object.entries(settings).map(([key, value]) =>
    prisma.systemSetting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value), group },
    })
  );
  await Promise.all(updates);
  return { success: true };
}