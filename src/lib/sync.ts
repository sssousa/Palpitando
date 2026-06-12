import { prisma } from "./db";
import { fetchWorldCupMatches, type ApiMatch } from "./football-data";
import { computePoints } from "./scoring";

/**
 * Placar sem os gols dos pênaltis. Em jogos decididos nos pênaltis a API
 * pode somar os gols da disputa em fullTime, então preferimos
 * regularTime + extraTime quando disponíveis.
 */
function scoreWithoutPenalties(
  m: ApiMatch
): { home: number; away: number } | null {
  const s = m.score;
  if (
    s.duration === "PENALTY_SHOOTOUT" &&
    s.regularTime &&
    s.regularTime.home !== null &&
    s.regularTime.away !== null
  ) {
    return {
      home: s.regularTime.home + (s.extraTime?.home ?? 0),
      away: s.regularTime.away + (s.extraTime?.away ?? 0),
    };
  }
  if (s.fullTime.home === null || s.fullTime.away === null) return null;
  return { home: s.fullTime.home, away: s.fullTime.away };
}

export async function syncMatches(): Promise<{
  total: number;
  finished: number;
}> {
  const data = await fetchWorldCupMatches();
  let finished = 0;

  for (const m of data.matches) {
    const base = {
      stage: m.stage,
      groupName: m.group,
      matchday: m.matchday,
      utcDate: new Date(m.utcDate),
      status: m.status,
      homeTeamId: m.homeTeam?.id ?? null,
      homeTeamName: m.homeTeam?.name ?? null,
      homeTeamCrest: m.homeTeam?.crest ?? null,
      awayTeamId: m.awayTeam?.id ?? null,
      awayTeamName: m.awayTeam?.name ?? null,
      awayTeamCrest: m.awayTeam?.crest ?? null,
    };
    const score = scoreWithoutPenalties(m);
    const scoreFields = {
      homeScore: score?.home ?? null,
      awayScore: score?.away ?? null,
      duration: m.score.duration ?? null,
      penaltyHomeScore: m.score.penalties?.home ?? null,
      penaltyAwayScore: m.score.penalties?.away ?? null,
      winner: m.score.winner ?? null,
    };
    if (m.status === "FINISHED") finished++;

    const existing = await prisma.match.findUnique({ where: { id: m.id } });
    if (existing?.manuallyEdited) {
      // preserva o placar corrigido pelo admin
      await prisma.match.update({ where: { id: m.id }, data: base });
    } else if (existing) {
      await prisma.match.update({
        where: { id: m.id },
        data: { ...base, ...scoreFields },
      });
    } else {
      await prisma.match.create({
        data: { id: m.id, ...base, ...scoreFields },
      });
    }
  }

  await recomputeAllPoints();
  await prisma.setting.upsert({
    where: { key: "lastSyncAt" },
    update: { value: new Date().toISOString() },
    create: { key: "lastSyncAt", value: new Date().toISOString() },
  });

  return { total: data.matches.length, finished };
}

export async function recomputeAllPoints(): Promise<number> {
  const matches = await prisma.match.findMany({
    where: {
      status: "FINISHED",
      homeScore: { not: null },
      awayScore: { not: null },
    },
    include: { predictions: true },
  });

  let updated = 0;
  for (const match of matches) {
    for (const pred of match.predictions) {
      const { points, isExact } = computePoints(
        {
          stage: match.stage,
          homeScore: match.homeScore!,
          awayScore: match.awayScore!,
          duration: match.duration,
          winner: match.winner,
          penaltyHomeScore: match.penaltyHomeScore,
          penaltyAwayScore: match.penaltyAwayScore,
        },
        {
          homeScore: pred.homeScore,
          awayScore: pred.awayScore,
          advancing: pred.advancing,
        }
      );
      if (pred.points !== points || pred.isExact !== isExact) {
        await prisma.prediction.update({
          where: { id: pred.id },
          data: { points, isExact },
        });
        updated++;
      }
    }
  }
  return updated;
}
