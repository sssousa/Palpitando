// Testes da regra de pontuação: npx tsx scripts/test-scoring.ts
import { computePoints, type FinishedMatch } from "../src/lib/scoring";

let failures = 0;

function check(
  name: string,
  match: FinishedMatch,
  pred: { homeScore: number; awayScore: number; advancing?: string | null },
  expected: number
) {
  const { points } = computePoints(match, {
    homeScore: pred.homeScore,
    awayScore: pred.awayScore,
    advancing: pred.advancing ?? null,
  });
  const ok = points === expected;
  if (!ok) failures++;
  console.log(`${ok ? "OK " : "FALHOU"} ${name}: ${points} (esperado ${expected})`);
}

const group = (h: number, a: number): FinishedMatch => ({
  stage: "GROUP_STAGE",
  homeScore: h,
  awayScore: a,
  duration: "REGULAR",
  winner: h > a ? "HOME_TEAM" : h < a ? "AWAY_TEAM" : "DRAW",
  penaltyHomeScore: null,
  penaltyAwayScore: null,
});

// fase de grupos
check("grupos: placar exato", group(2, 1), { homeScore: 2, awayScore: 1 }, 3);
check("grupos: só o vencedor", group(2, 1), { homeScore: 1, awayScore: 0 }, 1);
check("grupos: empate exato", group(1, 1), { homeScore: 1, awayScore: 1 }, 3);
check("grupos: empate certo, placar errado", group(1, 1), { homeScore: 2, awayScore: 2 }, 1);
check("grupos: tudo errado", group(2, 1), { homeScore: 0, awayScore: 1 }, 0);

// mata-mata decidido no tempo normal
const koRegular: FinishedMatch = {
  stage: "LAST_16",
  homeScore: 2,
  awayScore: 0,
  duration: "REGULAR",
  winner: "HOME_TEAM",
  penaltyHomeScore: null,
  penaltyAwayScore: null,
};
check("KO: placar exato", koRegular, { homeScore: 2, awayScore: 0 }, 3);
check("KO: classificado certo", koRegular, { homeScore: 1, awayScore: 0 }, 1);
check(
  "KO: palpite de empate com classificado certo",
  koRegular,
  { homeScore: 1, awayScore: 1, advancing: "HOME" },
  1
);
check(
  "KO: palpite de empate com classificado errado",
  koRegular,
  { homeScore: 1, awayScore: 1, advancing: "AWAY" },
  0
);

// mata-mata decidido nos pênaltis (1x1 na prorrogação, mandante venceu nos pênaltis)
const koPens: FinishedMatch = {
  stage: "QUARTER_FINALS",
  homeScore: 1,
  awayScore: 1,
  duration: "PENALTY_SHOOTOUT",
  winner: "HOME_TEAM",
  penaltyHomeScore: 4,
  penaltyAwayScore: 2,
};
check("KO pênaltis: placar exato", koPens, { homeScore: 1, awayScore: 1, advancing: "AWAY" }, 3);
check(
  "KO pênaltis: empate errado, classificado certo",
  koPens,
  { homeScore: 0, awayScore: 0, advancing: "HOME" },
  1
);
check("KO pênaltis: vitória do classificado", koPens, { homeScore: 2, awayScore: 1 }, 1);
check("KO pênaltis: classificado errado", koPens, { homeScore: 0, awayScore: 2 }, 0);

if (failures > 0) {
  console.error(`\n${failures} teste(s) falharam`);
  process.exit(1);
}
console.log("\nTodos os testes de pontuação passaram.");
