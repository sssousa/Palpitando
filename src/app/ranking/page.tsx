import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      predictions: {
        where: { points: { not: null } },
        select: { points: true, isExact: true },
      },
    },
  });

  const rows = users
    .map((u) => {
      const total = u.predictions.reduce((sum, p) => sum + (p.points ?? 0), 0);
      const exact = u.predictions.filter((p) => p.isExact).length;
      const results = u.predictions.filter((p) => p.points === 1).length;
      return { id: u.id, name: u.name, total, exact, results };
    })
    .sort(
      (a, b) =>
        b.total - a.total || b.exact - a.exact || a.name.localeCompare(b.name)
    );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Ranking</h1>
      <p className="text-sm text-zinc-500 mb-6">
        Placar exato vale 3 pontos, resultado vale 1. Desempate: mais placares
        exatos.
      </p>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500">
            <tr>
              <th className="text-left px-4 py-2 w-10">#</th>
              <th className="text-left px-4 py-2">Participante</th>
              <th className="text-right px-4 py-2">Exatos</th>
              <th className="text-right px-4 py-2">Resultados</th>
              <th className="text-right px-4 py-2 font-bold">Pontos</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isMe = row.id === session.id;
              return (
                <tr
                  key={row.id}
                  className={`border-t border-zinc-100 dark:border-zinc-800 ${
                    isMe ? "bg-emerald-50 dark:bg-emerald-950" : ""
                  }`}
                >
                  <td className="px-4 py-2 text-zinc-500">
                    {i === 0 && row.total > 0 ? "🏆" : i + 1}
                  </td>
                  <td className={`px-4 py-2 ${isMe ? "font-semibold" : ""}`}>
                    {row.name}
                    {isMe && " (você)"}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {row.exact}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {row.results}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums font-bold">
                    {row.total}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  Ninguém registrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
