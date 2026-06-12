import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { getInviteCode, getLastSyncAt } from "@/lib/settings";
import { formatDateTime } from "@/lib/format";
import { isKnockout } from "@/lib/scoring";
import { teamNamePt } from "@/lib/teams";
import { SyncButton, InviteForm } from "@/components/AdminControls";
import {
  AdminMatchEditor,
  type AdminMatchRow,
} from "@/components/AdminMatchEditor";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  if (!session?.isAdmin) redirect("/");

  const [inviteCode, lastSync, matches, userCount] = await Promise.all([
    getInviteCode(),
    getLastSyncAt(),
    prisma.match.findMany({ orderBy: { utcDate: "asc" } }),
    prisma.user.count(),
  ]);

  const rows: AdminMatchRow[] = matches.map((m) => ({
    id: m.id,
    label: `${teamNamePt(m.homeTeamName)} × ${teamNamePt(m.awayTeamName)}`,
    dateLabel: formatDateTime(m.utcDate),
    status: m.status,
    knockout: isKnockout(m.stage),
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    manuallyEdited: m.manuallyEdited,
  }));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Administração</h1>

      <section className="space-y-2">
        <h2 className="font-semibold">Sincronização com a Football-Data.org</h2>
        <p className="text-sm text-zinc-500">
          Automática todos os dias às 06:00 (Brasília).{" "}
          {lastSync
            ? `Última sincronização: ${formatDateTime(lastSync)}.`
            : "Nenhuma sincronização feita ainda — clique abaixo para a carga inicial dos jogos."}
        </p>
        <SyncButton />
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Código de convite</h2>
        <p className="text-sm text-zinc-500">
          Compartilhe com os amigos para que possam se registrar ({userCount}{" "}
          {userCount === 1 ? "participante registrado" : "participantes registrados"}
          ).
        </p>
        <InviteForm currentCode={inviteCode} />
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Correção manual de placares</h2>
        <p className="text-sm text-zinc-500">
          Use apenas se a API trouxer um placar errado ou atrasado. Jogos
          editados manualmente deixam de ser atualizados pela sincronização até
          você clicar em &quot;Voltar a usar a API&quot;.
        </p>
        <AdminMatchEditor matches={rows} />
      </section>
    </div>
  );
}
