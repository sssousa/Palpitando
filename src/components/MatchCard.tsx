import { formatTime, stageLabel, statusLabel } from "@/lib/format";
import { isKnockout } from "@/lib/scoring";
import { teamNamePt } from "@/lib/teams";
import { PredictionForm } from "./PredictionForm";

export type PredictionView = {
  id: string;
  userName: string;
  isOwn: boolean;
  homeScore: number;
  awayScore: number;
  advancing: string | null;
  points: number | null;
  isExact: boolean;
};

export type MatchView = {
  id: number;
  stage: string;
  groupName: string | null;
  utcDate: Date;
  status: string;
  homeTeamName: string | null;
  homeTeamCrest: string | null;
  awayTeamName: string | null;
  awayTeamCrest: string | null;
  homeScore: number | null;
  awayScore: number | null;
  penaltyHomeScore: number | null;
  penaltyAwayScore: number | null;
};

type Props = {
  match: MatchView;
  locked: boolean;
  ownPrediction: PredictionView | null;
  allPredictions: PredictionView[]; // só preenchido quando o jogo já começou
};

function Crest({ url }: { url: string | null }) {
  if (!url) return <span className="inline-block w-6 h-6">🏳️</span>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" className="w-6 h-6 object-contain" />;
}

function PointsBadge({ points, isExact }: { points: number; isExact: boolean }) {
  if (isExact) {
    return (
      <span className="text-xs font-semibold rounded-full px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
        +3 placar exato
      </span>
    );
  }
  if (points === 1) {
    return (
      <span className="text-xs font-semibold rounded-full px-2 py-0.5 bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300">
        +1 resultado
      </span>
    );
  }
  return (
    <span className="text-xs rounded-full px-2 py-0.5 bg-zinc-100 text-zinc-500 dark:bg-zinc-800">
      0 pontos
    </span>
  );
}

export function MatchCard({ match, locked, ownPrediction, allPredictions }: Props) {
  const homeName = teamNamePt(match.homeTeamName);
  const awayName = teamNamePt(match.awayTeamName);
  const teamsDefined = Boolean(match.homeTeamName && match.awayTeamName);
  const finished = match.status === "FINISHED";
  const hasScore = match.homeScore !== null && match.awayScore !== null;
  const hasPenalties =
    match.penaltyHomeScore !== null && match.penaltyAwayScore !== null;

  return (
    <article className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
      <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
        <span>{stageLabel(match.stage, match.groupName)}</span>
        <span>
          {locked ? statusLabel(match.status) : `${formatTime(match.utcDate)}`}
        </span>
      </div>

      <div className="flex items-center justify-center gap-3">
        <div className="flex-1 flex items-center justify-end gap-2 font-medium">
          <span className="text-right">{homeName}</span>
          <Crest url={match.homeTeamCrest} />
        </div>
        <div className="text-xl font-bold tabular-nums min-w-16 text-center">
          {locked && hasScore ? (
            `${match.homeScore} × ${match.awayScore}`
          ) : (
            <span className="text-zinc-400 text-base">
              {locked ? "—" : formatTime(match.utcDate)}
            </span>
          )}
        </div>
        <div className="flex-1 flex items-center justify-start gap-2 font-medium">
          <Crest url={match.awayTeamCrest} />
          <span>{awayName}</span>
        </div>
      </div>
      {locked && hasPenalties && (
        <p className="text-center text-xs text-zinc-500 mt-1">
          Pênaltis: {match.penaltyHomeScore} × {match.penaltyAwayScore}
        </p>
      )}

      {!locked && teamsDefined && (
        <PredictionForm
          matchId={match.id}
          knockout={isKnockout(match.stage)}
          homeName={homeName}
          awayName={awayName}
          initialHome={ownPrediction?.homeScore ?? null}
          initialAway={ownPrediction?.awayScore ?? null}
          initialAdvancing={ownPrediction?.advancing ?? null}
        />
      )}
      {!locked && !teamsDefined && (
        <p className="text-center text-sm text-zinc-400 mt-3">
          Aguardando definição dos times
        </p>
      )}

      {locked && (
        <div className="mt-3 border-t border-zinc-100 dark:border-zinc-800 pt-2">
          {allPredictions.length === 0 ? (
            <p className="text-center text-sm text-zinc-400">
              Ninguém palpitou nesse jogo
            </p>
          ) : (
            <ul className="space-y-1">
              {allPredictions.map((p) => (
                <li
                  key={p.id}
                  className={`flex items-center justify-between text-sm rounded px-2 py-1 ${
                    p.isOwn ? "bg-emerald-50 dark:bg-emerald-950" : ""
                  }`}
                >
                  <span className={p.isOwn ? "font-semibold" : ""}>
                    {p.userName}
                    {p.isOwn && " (você)"}
                  </span>
                  <span className="flex items-center gap-2 tabular-nums">
                    {p.homeScore} × {p.awayScore}
                    {p.advancing && (
                      <span className="text-xs text-zinc-500">
                        ({p.advancing === "HOME" ? homeName : awayName} nos
                        pênaltis)
                      </span>
                    )}
                    {finished && p.points !== null && (
                      <PointsBadge points={p.points} isExact={p.isExact} />
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </article>
  );
}
