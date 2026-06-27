import { rmSync } from "node:fs";

import { STUB_BACKEND_PORT } from "../../playwright.config";
import { startStubBackend } from "./stub-backend";

/**
 * Sobe o stub GraphQL antes da suíte. O dev server gerenciado pelo Playwright
 * é apontado para ele (ver `webServer.env` em playwright.config.ts), tornando
 * as queries server-side determinísticas e a suíte independente do backend.
 *
 * Em COVERAGE=1, zera as pastas de cobertura V8 do E2E para não acumular dados
 * de execuções anteriores antes de coletar a nova rodada.
 */
export default async function globalSetup() {
  if (process.env.COVERAGE) {
    rmSync("coverage/e2e-v8", { recursive: true, force: true });
    rmSync("coverage/e2e-server", { recursive: true, force: true });
  }
  await startStubBackend(STUB_BACKEND_PORT);
}
