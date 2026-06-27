import { defineConfig, devices } from "@playwright/test";

/**
 * Testes E2E ponta-a-ponta (Playwright).
 *
 * Ficam em `e2e/` (fora de `src/`) para não colidirem com a suíte do vitest,
 * cujo `include` é `src/**`.
 *
 * Isolamento total do ambiente do dev:
 *  - O Playwright faz build/start de PRODUÇÃO próprio (`next start`) na porta
 *    APP_PORT, com `distDir` isolado (.next-e2e). Usa-se `next start` (não
 *    `next dev`) porque o dev tem lock por projeto e recusa uma 2ª instância
 *    quando há um `next dev` (:3000) já aberto. O build isolado também não
 *    toca no `.next` do dev em uso.
 *  - O server é apontado para um stub GraphQL local (STUB_BACKEND_PORT,
 *    iniciado em e2e/support/global-setup.ts), então as queries SERVER-SIDE do
 *    Next também ficam determinísticas — a suíte NÃO depende do backend real.
 *  - As chamadas do browser são controladas por `page.route` em cada teste
 *    (ver e2e/support/graphql.ts).
 *
 * Projetos:
 *  - `setup`         → faz login (mockado) uma vez e salva o storageState.
 *  - `logged-out`    → specs que precisam começar deslogado (o próprio login).
 *  - `authenticated` → specs de rota; reaproveitam o storageState do setup.
 */
export const APP_PORT = 3100;
export const STUB_BACKEND_PORT = 8099;
export const BASE_URL = `http://localhost:${APP_PORT}`;
export const STORAGE_STATE = "e2e/.auth/user.json";

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/support/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  timeout: 60_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: "logged-out",
      testMatch: "**/auth/*.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "authenticated",
      testMatch: "**/routes/**/*.spec.ts",
      dependencies: ["setup"],
      use: { ...devices["Desktop Chrome"], storageState: STORAGE_STATE },
    },
  ],

  // Build/start de produção próprio da suíte, isolado e apontado ao stub.
  // O build inlina NEXT_PUBLIC_GRAPHQL_API_HOST (stub) no bundle; as chamadas
  // do browser são interceptadas por page.route antes de chegarem à rede.
  webServer: {
    command: `npm run e2e:build && npm run e2e:start -- -p ${APP_PORT}`,
    url: BASE_URL,
    // Em COVERAGE não reaproveita server: precisa de um build instrumentado
    // (source maps) e do NODE_V8_COVERAGE no processo do `next start`.
    reuseExistingServer: !process.env.CI && !process.env.COVERAGE,
    timeout: 300_000,
    env: {
      NEXT_DIST_DIR: ".next-e2e",
      NEXT_PUBLIC_GRAPHQL_API_HOST: `http://localhost:${STUB_BACKEND_PORT}/graphql`,
      ...(process.env.COVERAGE
        ? { COVERAGE: "1", NODE_V8_COVERAGE: "coverage/e2e-server" }
        : {}),
    },
  },
});
