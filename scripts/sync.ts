// Carga/sincronização manual via terminal: npm run sync
import "dotenv/config";
import { syncMatches } from "../src/lib/sync";

syncMatches()
  .then((r) => {
    console.log(`Sincronizado: ${r.total} jogos (${r.finished} encerrados).`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Falha na sincronização:", err.message ?? err);
    process.exit(1);
  });
