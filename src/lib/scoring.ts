export const GROUP_STAGE = "GROUP_STAGE";

export function isKnockout(stage: string): boolean {
  return stage !== GROUP_STAGE;
}

export type FinishedMatch = {
  stage: string;
  homeScore: number;
  awayScore: number;
  duration: string | null; // REGULAR | EXTRA_TIME | PENALTY_SHOOTOUT
  winner: string | null; // HOME_TEAM | AWAY_TEAM | DRAW
  penaltyHomeScore: number | null;
  penaltyAwayScore: number | null;
};

export type PredictionValues = {
  homeScore: number;
  awayScore: number;
  advancing: string | null; // HOME | AWAY (empate no mata-mata)
};

export type Side = "HOME" | "AWAY";

/**
 * Lado que se classificou de fato (mata-mata), considerando pênaltis.
 */
export function actualAdvancingSide(match: FinishedMatch): Side | null {
  if (match.winner === "HOME_TEAM") return "HOME";
  if (match.winner === "AWAY_TEAM") return "AWAY";
  if (
    match.penaltyHomeScore !== null &&
    match.penaltyAwayScore !== null &&
    match.penaltyHomeScore !== match.penaltyAwayScore
  ) {
    return match.penaltyHomeScore > match.penaltyAwayScore ? "HOME" : "AWAY";
  }
  if (match.homeScore !== match.awayScore) {
    return match.homeScore > match.awayScore ? "HOME" : "AWAY";
  }
  return null;
}

/**
 * Lado que o palpite indica como classificado (mata-mata).
 */
export function predictedAdvancingSide(pred: PredictionValues): Side | null {
  if (pred.homeScore > pred.awayScore) return "HOME";
  if (pred.homeScore < pred.awayScore) return "AWAY";
  if (pred.advancing === "HOME" || pred.advancing === "AWAY") {
    return pred.advancing;
  }
  return null;
}

/**
 * Regras de pontuação (não cumulativas):
 * - Placar exato: 3 pontos. Na fase de grupos, placar do tempo normal;
 *   no mata-mata, placar ao fim da prorrogação (sem contar pênaltis).
 * - Resultado: 1 ponto. Na fase de grupos, acertar vitória/empate/derrota;
 *   no mata-mata, acertar quem se classificou (pênaltis contam).
 */
export function computePoints(
  match: FinishedMatch,
  pred: PredictionValues
): { points: number; isExact: boolean } {
  const exact =
    pred.homeScore === match.homeScore && pred.awayScore === match.awayScore;
  if (exact) return { points: 3, isExact: true };

  if (!isKnockout(match.stage)) {
    const actualSign = Math.sign(match.homeScore - match.awayScore);
    const predSign = Math.sign(pred.homeScore - pred.awayScore);
    return { points: actualSign === predSign ? 1 : 0, isExact: false };
  }

  const actual = actualAdvancingSide(match);
  const predicted = predictedAdvancingSide(pred);
  const hit = actual !== null && predicted !== null && actual === predicted;
  return { points: hit ? 1 : 0, isExact: false };
}
