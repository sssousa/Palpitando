import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { setSetting } from "@/lib/settings";

const schema = z.object({
  code: z
    .string()
    .trim()
    .min(4, "O código precisa de pelo menos 4 caracteres")
    .max(30),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }
  await setSetting("inviteCode", parsed.data.code.toUpperCase());
  return NextResponse.json({ ok: true });
}
