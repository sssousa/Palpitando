import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { isKnockout } from "@/lib/scoring";

const schema = z.object({
  matchId: z.number().int(),
  homeScore: z.number().int().min(0).max(30),
  awayScore: z.number().int().min(0).max(30),
  advancing: z.enum(["HOME", "AWAY"]).nullish(),
});

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Palpite inválido" }, { status: 400 });
  }
  const { matchId, homeScore, awayScore } = parsed.data;

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) {
    return NextResponse.json(
      { error: "Jogo não encontrado" },
      { status: 404 }
    );
  }
  if (new Date() >= match.utcDate) {
    return NextResponse.json(
      { error: "Esse jogo já começou — palpite encerrado" },
      { status: 403 }
    );
  }
  if (!match.homeTeamName || !match.awayTeamName) {
    return NextResponse.json(
      { error: "Os times desse jogo ainda não foram definidos" },
      { status: 403 }
    );
  }

  const knockoutDraw = isKnockout(match.stage) && homeScore === awayScore;
  const advancing = knockoutDraw ? parsed.data.advancing ?? null : null;
  if (knockoutDraw && !advancing) {
    return NextResponse.json(
      { error: "Em empate no mata-mata, escolha quem se classifica" },
      { status: 400 }
    );
  }

  const prediction = await prisma.prediction.upsert({
    where: { userId_matchId: { userId: session.id, matchId } },
    update: { homeScore, awayScore, advancing },
    create: { userId: session.id, matchId, homeScore, awayScore, advancing },
  });

  return NextResponse.json({ ok: true, prediction });
}
