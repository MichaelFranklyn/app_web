import { describe, expect, it } from "vitest";

import {
  PRIORITY_ALIASES,
  PRIORITY_OPTIONS,
  priorityMeta,
} from "./clientPriority";

describe("PRIORITY_OPTIONS", () => {
  it("usa o vocabulário do backend, não o inglês", () => {
    // O score só pontua a dimensão priority nesses termos: mandar
    // "high"/"medium"/"low" deixava a dimensão sempre em 0.
    expect(PRIORITY_OPTIONS.map((o) => o.value)).toEqual([
      "alta",
      "media",
      "baixa",
    ]);
  });

  it("mostra os rótulos em Title Case", () => {
    expect(PRIORITY_OPTIONS.map((o) => o.label)).toEqual([
      "Alta",
      "Média",
      "Baixa",
    ]);
  });
});

describe("priorityMeta", () => {
  it("traduz o vocabulário canônico com a cor de cada nível", () => {
    expect(priorityMeta("alta")).toEqual({ label: "Alta", color: "red" });
    expect(priorityMeta("media")).toEqual({ label: "Média", color: "amber" });
    expect(priorityMeta("baixa")).toEqual({ label: "Baixa", color: "subtle" });
  });

  it("entende as grafias legadas em inglês", () => {
    // Vínculos salvos antes do alinhamento de vocabulário continuam no banco.
    expect(priorityMeta("high")).toEqual(priorityMeta("alta"));
    expect(priorityMeta("medium")).toEqual(priorityMeta("media"));
    expect(priorityMeta("low")).toEqual(priorityMeta("baixa"));
  });

  it("sem prioridade, mostra travessão em vez de inventar um nível", () => {
    expect(priorityMeta(null)).toEqual({ label: "—", color: "neutral" });
    expect(priorityMeta("")).toEqual({ label: "—", color: "neutral" });
    expect(priorityMeta("qualquer-coisa")).toEqual({
      label: "—",
      color: "neutral",
    });
  });
});

describe("PRIORITY_ALIASES", () => {
  it("cada escolha do filtro casa as DUAS grafias no banco", () => {
    // Filtrar por um valor só faria os vínculos legados sumirem da lista sem
    // nada avisar.
    expect(PRIORITY_ALIASES.alta).toEqual(["alta", "high"]);
    expect(PRIORITY_ALIASES.media).toEqual(["media", "medium"]);
    expect(PRIORITY_ALIASES.baixa).toEqual(["baixa", "low"]);
  });

  it("toda opção do filtro tem alias declarado", () => {
    for (const { value } of PRIORITY_OPTIONS) {
      expect(PRIORITY_ALIASES[value]).toBeDefined();
      expect(PRIORITY_ALIASES[value]).toContain(value);
    }
  });

  it("toda grafia aceita no filtro é traduzível na tela", () => {
    for (const grafias of Object.values(PRIORITY_ALIASES)) {
      for (const grafia of grafias) {
        expect(priorityMeta(grafia).label).not.toBe("—");
      }
    }
  });
});
