import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Como o vitest roda com `globals: false`, o auto-cleanup do Testing Library
// (que depende do `afterEach` global) não é registrado. Sem isso a árvore de
// um teste vaza para o próximo — ex.: dois gatilhos "Remover visita" no DOM
// fazem o findByRole falhar por múltiplos elementos. Registramos manualmente.
afterEach(() => {
  cleanup();
});

// helpersCookie.ts lança no import sem esta env; valor dummy só p/ os testes
// (mesmo padrão do workflow de CI). Definido aqui pois setupFiles roda antes
// dos módulos de teste.
process.env.NEXT_PUBLIC_COOKIE_SECRET_KEY ||= "test-secret-key";
