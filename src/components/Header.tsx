import Link from "next/link";
import { getSession } from "@/lib/session";
import { LogoutButton } from "./LogoutButton";

export async function Header() {
  const session = await getSession();

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-background/95 backdrop-blur z-10">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="font-bold text-lg text-emerald-600">
          ⚽ Palpitando
        </Link>
        {session && (
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="hover:text-emerald-600">
              Jogos
            </Link>
            <Link href="/ranking" className="hover:text-emerald-600">
              Ranking
            </Link>
            {session.isAdmin && (
              <Link href="/admin" className="hover:text-emerald-600">
                Admin
              </Link>
            )}
            <span className="hidden sm:inline text-zinc-500">
              {session.name}
            </span>
            <LogoutButton />
          </nav>
        )}
      </div>
    </header>
  );
}
