"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Props = { mode: "login" | "register" };

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const url =
      mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Algo deu errado, tente novamente");
      return;
    }
    router.push("/");
    router.refresh();
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500";

  return (
    <div className="max-w-sm mx-auto mt-10">
      <h1 className="text-2xl font-bold text-center mb-1">
        {mode === "login" ? "Entrar" : "Criar conta"}
      </h1>
      <p className="text-center text-sm text-zinc-500 mb-6">
        Bolão da Copa do Mundo 2026 entre amigos
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "register" && (
          <input
            name="name"
            placeholder="Seu nome (como aparecerá no ranking)"
            required
            maxLength={40}
            className={inputClass}
          />
        )}
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className={inputClass}
        />
        <input
          name="password"
          type="password"
          placeholder="Senha"
          required
          minLength={mode === "register" ? 6 : 1}
          className={inputClass}
        />
        {mode === "register" && (
          <input
            name="inviteCode"
            placeholder="Código de convite"
            required
            className={inputClass}
          />
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 disabled:opacity-50 cursor-pointer"
        >
          {loading
            ? "Aguarde..."
            : mode === "login"
              ? "Entrar"
              : "Registrar"}
        </button>
      </form>
      <p className="text-center text-sm text-zinc-500 mt-4">
        {mode === "login" ? (
          <>
            Não tem conta?{" "}
            <Link href="/registro" className="text-emerald-600 hover:underline">
              Registre-se
            </Link>
          </>
        ) : (
          <>
            Já tem conta?{" "}
            <Link href="/login" className="text-emerald-600 hover:underline">
              Entre aqui
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
