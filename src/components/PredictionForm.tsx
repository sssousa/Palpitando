"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Props = {
  matchId: number;
  knockout: boolean;
  homeName: string;
  awayName: string;
  initialHome: number | null;
  initialAway: number | null;
  initialAdvancing: string | null;
};

export function PredictionForm({
  matchId,
  knockout,
  homeName,
  awayName,
  initialHome,
  initialAway,
  initialAdvancing,
}: Props) {
  const router = useRouter();
  const [home, setHome] = useState(initialHome?.toString() ?? "");
  const [away, setAway] = useState(initialAway?.toString() ?? "");
  const [advancing, setAdvancing] = useState(initialAdvancing ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  const isDraw = home !== "" && away !== "" && home === away;
  const needsAdvancing = knockout && isDraw;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (home === "" || away === "") {
      setError("Preencha os dois placares");
      return;
    }
    if (needsAdvancing && !advancing) {
      setError("Empate no mata-mata: escolha quem se classifica nos pênaltis");
      return;
    }
    setStatus("saving");
    const res = await fetch("/api/predictions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchId,
        homeScore: Number(home),
        awayScore: Number(away),
        advancing: needsAdvancing ? advancing : null,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível salvar");
      setStatus("error");
      return;
    }
    setStatus("saved");
    router.refresh();
  }

  const scoreInput =
    "w-14 text-center rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500";

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2">
      <div className="flex items-center justify-center gap-2">
        <input
          type="number"
          min={0}
          max={30}
          value={home}
          onChange={(e) => {
            setHome(e.target.value);
            setStatus("idle");
          }}
          aria-label={`Gols de ${homeName}`}
          className={scoreInput}
        />
        <span className="text-zinc-400">×</span>
        <input
          type="number"
          min={0}
          max={30}
          value={away}
          onChange={(e) => {
            setAway(e.target.value);
            setStatus("idle");
          }}
          aria-label={`Gols de ${awayName}`}
          className={scoreInput}
        />
        <button
          type="submit"
          disabled={status === "saving"}
          className="ml-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-1.5 disabled:opacity-50 cursor-pointer"
        >
          {status === "saving" ? "Salvando..." : "Salvar"}
        </button>
      </div>
      {needsAdvancing && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="text-zinc-500">Classifica nos pênaltis:</span>
          <select
            value={advancing}
            onChange={(e) => {
              setAdvancing(e.target.value);
              setStatus("idle");
            }}
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1"
          >
            <option value="">Escolha...</option>
            <option value="HOME">{homeName}</option>
            <option value="AWAY">{awayName}</option>
          </select>
        </div>
      )}
      {status === "saved" && (
        <p className="text-center text-sm text-emerald-600">Palpite salvo ✓</p>
      )}
      {error && <p className="text-center text-sm text-red-600">{error}</p>}
    </form>
  );
}
