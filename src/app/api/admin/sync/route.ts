import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { syncMatches } from "@/lib/sync";

export async function POST() {
  const session = await getSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }
  try {
    const result = await syncMatches();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Falha na sincronização" },
      { status: 502 }
    );
  }
}
