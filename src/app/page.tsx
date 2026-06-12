import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { dayKey, formatDayHeading } from "@/lib/format";
import {
  MatchCard,
  type MatchView,
  type PredictionView,
} from "@/components/MatchCard";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ ver?: string }>;
};

export default async function JogosPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { ver } = await searchParams;
  const showFinished = ver === "encerrados";
  const now = new Date();

  const matches = await prisma.match.findMany({
    where: showFinished
      ? { status: "FINISHED" }
      : { status: { not: "FINISHED" } },
    orderBy: { utcDate: showFinished ? "desc" : "asc" },
    include: {
      predictions: {
        include: { user: { select: { name: true } } },
      },
    },
  });

  // agrupa por dia (fuso de Brasília)
  const groups = new Map<string, typeof matches>();
  for (const match of matches) {
    const key = dayKey(match.utcDate);
    const list = groups.get(key) ?? [];
    list.push(match);
    groups.set(key, list);
  }

  const tabClass = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-medium ${
      active
        ? "bg-emerald-600 text-white"
        : "border border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:text-emerald-600"
    }`;

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/" className={tabClass(!showFinished)}>
          Próximos jogos
        </Link>
        <Link href="/?ver=encerrados" className={tabClass(showFinished)}>
          Encerrados
        </Link>
      </div>

      {matches.length === 0 && (
        <div className="text-center text-zinc-500 py-16 space-y-2">
          <p>
            {showFinished
              ? "Nenhum jogo encerrado ainda."
              : "Nenhum jogo carregado ainda."}
          </p>
          {!showFinished && session.isAdmin && (
            <p>
              Vá ao{" "}
              <Link href="/admin" className="text-emerald-600 hover:underline">
                painel admin
              </Link>{" "}
              e clique em &quot;Sincronizar agora&quot; para importar a tabela
              da Copa.
            </p>
          )}
        </div>
      )}

      <div className="space-y-8">
        {[...groups.entries()].map(([key, dayMatches]) => (
          <section key={key}>
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">
              {formatDayHeading(dayMatches[0].utcDate)}
            </h2>
            <div className="space-y-3">
              {dayMatches.map((match) => {
                const locked = now >= match.utcDate;
                const own = match.predictions.find(
                  (p) => p.userId === session.id
                );
                const toView = (
                  p: (typeof match.predictions)[number]
                ): PredictionView => ({
                  id: p.id,
                  userName: p.user.name,
                  isOwn: p.userId === session.id,
                  homeScore: p.homeScore,
                  awayScore: p.awayScore,
                  advancing: p.advancing,
                  points: p.points,
                  isExact: p.isExact,
                });
                // palpites dos outros só ficam visíveis após o início do jogo
                const allPredictions = locked
                  ? match.predictions
                      .map(toView)
                      .sort(
                        (a, b) =>
                          (b.points ?? -1) - (a.points ?? -1) ||
                          a.userName.localeCompare(b.userName)
                      )
                  : [];
                const view: MatchView = {
                  id: match.id,
                  stage: match.stage,
                  groupName: match.groupName,
                  utcDate: match.utcDate,
                  status: match.status,
                  homeTeamName: match.homeTeamName,
                  homeTeamCrest: match.homeTeamCrest,
                  awayTeamName: match.awayTeamName,
                  awayTeamCrest: match.awayTeamCrest,
                  homeScore: match.homeScore,
                  awayScore: match.awayScore,
                  penaltyHomeScore: match.penaltyHomeScore,
                  penaltyAwayScore: match.penaltyAwayScore,
                };
                return (
                  <MatchCard
                    key={match.id}
                    match={view}
                    locked={locked}
                    ownPrediction={own ? toView(own) : null}
                    allPredictions={allPredictions}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
