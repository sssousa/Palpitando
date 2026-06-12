import { prisma } from "./db";

export async function getSetting(key: string): Promise<string | null> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function getInviteCode(): Promise<string> {
  const stored = await getSetting("inviteCode");
  if (stored) return stored;
  const initial = process.env.INVITE_CODE || "COPA2026";
  await setSetting("inviteCode", initial);
  return initial;
}

export async function getLastSyncAt(): Promise<Date | null> {
  const value = await getSetting("lastSyncAt");
  return value ? new Date(value) : null;
}
