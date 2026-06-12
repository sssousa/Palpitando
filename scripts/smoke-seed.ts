// Dados temporários para teste manual — criados/removidos pelo smoke test
import "dotenv/config";
import { prisma } from "../src/lib/db";

const mode = process.argv[2];

async function main() {
  if (mode === "clean") {
    await prisma.prediction.deleteMany({
      where: { matchId: { gte: 900000 } },
    });
    await prisma.match.deleteMany({ where: { id: { gte: 900000 } } });
    await prisma.user.deleteMany({
      where: { email: { endsWith: "@smoke.test" } },
    });
    console.log("Dados de teste removidos.");
    return;
  }

  const in2h = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const ago1h = new Date(Date.now() - 60 * 60 * 1000);
  await prisma.match.createMany({
    data: [
      {
        id: 900001,
        stage: "GROUP_STAGE",
        groupName: "Group A",
        matchday: 1,
        utcDate: in2h,
        status: "TIMED",
        homeTeamName: "Brazil",
        awayTeamName: "France",
      },
      {
        id: 900002,
        stage: "GROUP_STAGE",
        groupName: "Group A",
        matchday: 1,
        utcDate: ago1h,
        status: "IN_PLAY",
        homeTeamName: "Spain",
        awayTeamName: "Germany",
        homeScore: 1,
        awayScore: 0,
      },
    ],
  });
  console.log("Jogos de teste criados (900001 futuro, 900002 em andamento).");
}

main().finally(() => prisma.$disconnect());
