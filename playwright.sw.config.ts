import { defineConfig, devices } from "@playwright/test";

import { STORAGE_STATE, STUB_BACKEND_PORT } from "./playwright.config";

/**
 * E2E com o SERVICE WORKER LIGADO.
 *
 * A suíte principal (`playwright.config.ts`) desliga o service worker de
 * propósito: com ele, um spec veria página e asset deixados pelo anterior. O
 * preço é que nada ali prova o app funcionando como PWA — abrir sem rede,
 * guardar a visita no aparelho, sobreviver a fechar a aba e reenviar uma vez só.
 *
 * Esta suíte é o contrário: build próprio COM service worker, poucos specs, um
 * por vez (o service worker e a fila são estado do navegador inteiro), e cada
 * teste num contexto novo.
 *
 *     npm run e2e:sw
 *
 * O backend continua simulado — o que se prova aqui é o NAVEGADOR (service
 * worker, armazenamento, abas, troca de usuário). Que o servidor aguenta o
 * reenvio é provado em `app_user/tests/integration`.
 */
// Sem isto o Playwright não enxerga as requisições que o PRÓPRIO service worker
// faz — e `context.setOffline` não as alcança: a navegação "sem sinal" passava
// pelo service worker e chegava ao servidor normalmente. Com a variável, o
// `context.route` intercepta também o que sai do service worker, e o teste
// consegue derrubar a rede de verdade (ver `cutNetwork` no spec).
process.env.PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS = "1";

export const SW_APP_PORT = 3101;
export const SW_BASE_URL = `http://localhost:${SW_APP_PORT}`;

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/support/global-setup.ts",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  timeout: 90_000,
  expect: { timeout: 15_000 },

  use: {
    baseURL: SW_BASE_URL,
    trace: "on-first-retry",
    serviceWorkers: "allow",
  },

  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "offline-sw",
      testMatch: "**/offline-sw/*.spec.ts",
      dependencies: ["setup"],
      use: { ...devices["Desktop Chrome"], storageState: STORAGE_STATE },
    },
  ],

  webServer: {
    command: `npm run e2e:build && npm run e2e:start -- -p ${SW_APP_PORT}`,
    url: SW_BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    env: {
      // Diretório próprio: o build da suíte principal inlina
      // NEXT_PUBLIC_DISABLE_SW=1 no bundle, e reaproveitá-lo desligaria aqui o
      // que esta suíte existe para testar.
      NEXT_DIST_DIR: ".next-e2e-sw",
      NEXT_PUBLIC_GRAPHQL_API_HOST: `http://localhost:${STUB_BACKEND_PORT}/graphql`,
    },
  },
});
