import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// next/navigation exige o App Router montado, indisponível no jsdom. Vários
// componentes usam useRouter — inclusive o ConfirmModal, via
// useRedirectTransition. Mock global no-op para o render não estourar; testes
// que precisam de comportamento específico declaram o próprio vi.mock (que tem
// precedência no arquivo deles).
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

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

// jsdom não implementa ResizeObserver, usado por componentes que medem layout
// (ex.: Card.Header). Mock no-op só para não quebrar o render nos testes.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
