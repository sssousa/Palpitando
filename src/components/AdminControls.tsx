"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function SyncButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSync() {
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/admin/sync", { method: "POST" });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok) {
      setMessage(`Erro: ${data?.error ?? res.status}`);
      return;
    }
    setMessage(
      `Sincronizado: ${data.total} jogos (${data.finished} encerrados).`
    );
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleSync}
        disabled={busy}
        className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 disabled:opacity-50 cursor-pointer"
      >
        {busy ? "Sincronizando..." : "Sincronizar agora"}
      </button>
      {message && <p className="text-sm text-zinc-500">{message}</p>}
    </div>
  );
}

export function InviteForm({ currentCode }: { currentCode: string }) {
  const router = useRouter();
  const [code, setCode] = useState(currentCode);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    const res = await fetch("/api/admin/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setMessage(`Erro: ${data?.error ?? res.status}`);
      return;
    }
    setMessage("Código atualizado ✓");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-wrap">
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 font-mono"
        maxLength={30}
      />
      <button
        type="submit"
        className="rounded-lg border border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white font-semibold px-4 py-2 cursor-pointer"
      >
        Salvar código
      </button>
      {message && <span className="text-sm text-zinc-500">{message}</span>}
    </form>
  );
}
