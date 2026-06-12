"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type AdminMatchRow = {
  id: number;
  label: string; // "Brasil × França"
  dateLabel: string; // "13/06 16:00"
  status: string;
  knockout: boolean;
  homeScore: number | null;
  awayScore: number | null;
  manuallyEdited: boolean;
};

function EditRow({ match }: { match: AdminMatchRow }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [home, setHome] = useState(match.homeScore?.toString() ?? "");
  const [away, setAway] = useState(match.awayScore?.toString() ?? "");
  const [penaltyWinner, setPenaltyWinner] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDraw = home !== "" && home === away;

  async function save() {
    setError(null);
    if (home === "" || away === "") {
      setError("Preencha os dois placares");
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/admin/matches/${match.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        homeScore: Number(home),
        awayScore: Number(away),
        penaltyWinner:
          match.knockout && isDraw && penaltyWinner ? penaltyWinner : null,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Falha ao salvar");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  async function revert() {
    setBusy(true);
    await fetch(`/api/admin/matches/${match.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ revert: true }),
    });
    setBusy(false);
    router.refresh();
  }

  const input =
    "w-12 text-center rounded border border-zinc-300 dark:border-zinc-700 bg-transparent py-1";

  return (
    <li className="px-3 py-2 border-t border-zinc-100 dark:border-zinc-800 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span>
          <span className="text-zinc-500 mr-2 tabular-nums">
            {match.dateLabel}
          </span>
          {match.label}
          {match.manuallyEdited && (
            <span className="ml-2 text-xs text-amber-600">editado</span>
          )}
        </span>
        <span className="flex items-center gap-3">
          <span className="tabular-nums">
            {match.homeScore !== null && match.awayScore !== null
              ? `${match.homeScore} × ${match.awayScore}`
              : "—"}
          </span>
          <button
            onClick={() => setOpen(!open)}
            className="text-emerald-600 hover:underline cursor-pointer"
          >
            {open ? "Fechar" : "Editar"}
          </button>
        </span>
      </div>
      {open && (
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <input
            type="number"
            min={0}
            max={30}
            value={home}
            onChange={(e) => setHome(e.target.value)}
            className={input}
          />
          <span className="text-zinc-400">×</span>
          <input
            type="number"
            min={0}
            max={30}
            value={away}
            onChange={(e) => setAway(e.target.value)}
            className={input}
          />
          {match.knockout && isDraw && (
            <select
              value={penaltyWinner}
              onChange={(e) => setPenaltyWinner(e.target.value)}
              className="rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1"
            >
              <option value="">Vencedor nos pênaltis...</option>
              <option value="HOME">Mandante</option>
              <option value="AWAY">Visitante</option>
            </select>
          )}
          <button
            onClick={save}
            disabled={busy}
            className="rounded bg-emerald-600 text-white px-3 py-1 disabled:opacity-50 cursor-pointer"
          >
            Salvar placar
          </button>
          {match.manuallyEdited && (
            <button
              onClick={revert}
              disabled={busy}
              className="rounded border border-zinc-300 dark:border-zinc-700 px-3 py-1 disabled:opacity-50 cursor-pointer"
            >
              Voltar a usar a API
            </button>
          )}
          {error && <span className="text-red-600">{error}</span>}
        </div>
      )}
    </li>
  );
}

export function AdminMatchEditor({ matches }: { matches: AdminMatchRow[] }) {
  const [filter, setFilter] = useState("");
  const visible = matches.filter((m) =>
    m.label.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="p-3 bg-zinc-50 dark:bg-zinc-900">
        <input
          placeholder="Filtrar por time..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-1.5 text-sm"
        />
      </div>
      <ul className="max-h-96 overflow-y-auto">
        {visible.map((m) => (
          <EditRow key={m.id} match={m} />
        ))}
        {visible.length === 0 && (
          <li className="px-3 py-6 text-center text-sm text-zinc-500">
            Nenhum jogo encontrado.
          </li>
        )}
      </ul>
    </div>
  );
}
