import cron from "node-cron";
import { syncMatches } from "./sync";

const globalForCron = globalThis as unknown as { cronStarted?: boolean };

/**
 * Sincronização diária às 06:00 de Brasília — depois do término dos jogos
 * mais tardios da Copa 2026 (fuso da América do Norte).
 */
export function startDailySync(): void {
  if (globalForCron.cronStarted) return;
  globalForCron.cronStarted = true;

  cron.schedule(
    "0 6 * * *",
    async () => {
      try {
        const result = await syncMatches();
        console.log(
          `[cron] Sincronização diária ok: ${result.total} jogos, ${result.finished} encerrados`
        );
      } catch (err) {
        console.error("[cron] Falha na sincronização diária:", err);
      }
    },
    { timezone: "America/Sao_Paulo" }
  );
  console.log("[cron] Sincronização diária agendada para 06:00 (Brasília)");
}
