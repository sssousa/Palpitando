export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startDailySync } = await import("./lib/cron");
    startDailySync();
  }
}
