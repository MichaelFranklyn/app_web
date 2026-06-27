// Declaração mínima de `import.meta.glob` (recurso do Vite/Vitest), usado apenas
// pelo teste de contrato GraphQL (schema-contract.test.ts). Declaramos só o que
// o projeto usa — em vez de referenciar `vite/client` global, que traria a
// tipagem de ambiente do Vite e conflitaria com a do Next. O merge de interface
// adiciona `glob` ao ImportMeta existente.
interface ImportMeta {
  glob(
    pattern: string | string[],
    options?: { eager?: boolean }
  ): Record<string, Record<string, unknown>>;
}
