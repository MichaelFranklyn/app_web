import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": resolve(__dirname, "./src") },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    css: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "html"],
      reportsDirectory: "./coverage",
      // O Vitest cobre a CAMADA DE LÓGICA PURA (utils/hooks). A UI (componentes
      // e páginas) é verificada pelos testes E2E do Playwright, que o v8 não
      // instrumenta — por isso o include é escopado, senão o % fica enganoso.
      include: [
        "src/utils/**/*.ts",
        "src/hooks/**/*.ts",
        "src/components/FormBuilder/utils/**/*.ts",
      ],
      exclude: [
        "src/**/*.{test,spec}.{ts,tsx}",
        "src/**/*.d.ts",
        "src/**/interface.ts",
        "src/utils/mocks/**",
      ],
    },
  },
});
