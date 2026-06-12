import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { recomputeAllPoints } from "@/lib/sync";
import { isKnockout } from "@/lib/scoring";

const schema = z.union([
  z.object({
    revert: z.literal(true),
  }),
  z.object({
    homeScore: z.number().int().min(0).max(30),
    awayScore: z.number().int().min(0).max(30),
    penaltyWinner: z.enum(["HOME", "AWAY"]).nullish(),
  }),
]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { id } = await params;
  const matchId = Number(id);
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) {
    return NextResponse.json({ error: "Jogo não encontrado" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  if ("revert" in parsed.data) {
    // volta a aceitar o placar da API na próxima sincronização
    await prisma.match.update({
      where: { id: matchId },
      data: { manuallyEdited: false },
    });
    return NextResponse.json({ ok: true });
  }

  const { homeScore, awayScore, penaltyWinner } = parsed.data;
  const knockoutDraw = isKnockout(match.stage) && homeScore === awayScore;
  if (knockoutDraw && !penaltyWinner) {
    return NextResponse.json(
      { error: "Empate no mata-mata: informe quem venceu nos pênaltis" },
      { status: 400 }
    );
  }

  let winner: string;
  if (homeScore > awayScore) winner = "HOME_TEAM";
  else if (homeScore < awayScore) winner = "AWAY_TEAM";
  else if (knockoutDraw)
    winner = penaltyWinner === "HOME" ? "HOME_TEAM" : "AWAY_TEAM";
  else winner = "DRAW";

  await prisma.match.update({
    where: { id: matchId },
    data: {
      homeScore,
      awayScore,
      winner,
      duration: knockoutDraw ? "PENALTY_SHOOTOUT" : "REGULAR",
      status: "FINISHED",
      manuallyEdited: true,
    },
  });
  await recomputeAllPoints();

  return NextResponse.json({ ok: true });
}
