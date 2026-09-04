import { describe, expect, it } from "vitest";
import {
  NEXT_STATUS_OPTIONS,
  isClosingStatus,
  statusChangeLabel,
} from "./utils";

describe("statusChangeLabel", () => {
  // O de-para é o que responde "quanto tempo isso ficou com a fábrica?" — a
  // frase sai do que foi GRAVADO, não do texto que a pessoa escreveu.
  it("mostra de onde para onde o caso foi", () => {
    expect(statusChangeLabel("WAITING_FACTORY", "RESOLVED")).toBe(
      "Aguardando a fábrica → Resolvido"
    );
  });

  it("sem origem gravada, diz apenas o destino", () => {
    expect(statusChangeLabel(null, "IN_PROGRESS")).toBe(
      "Passou para Em andamento"
    );
  });

  it("andamento comum não é mudança de situação", () => {
    expect(statusChangeLabel(null, null)).toBeNull();
    expect(statusChangeLabel("OPEN", null)).toBeNull();
  });
});

describe("isClosingStatus", () => {
  it("encerrar pede a solução por escrito", () => {
    expect(isClosingStatus("RESOLVED")).toBe(true);
    expect(isClosingStatus("CANCELLED")).toBe(true);
  });

  it("as demais situações não encerram nada", () => {
    expect(isClosingStatus("WAITING_CLIENT")).toBe(false);
    expect(isClosingStatus("")).toBe(false);
  });
});

describe("NEXT_STATUS_OPTIONS", () => {
  // A mudança de situação é gravada pelo sistema no andamento: oferecê-la como
  // escolha faria a pessoa registrar "mudou de situação" sem mudar nada.
  it("não oferece a mudança automática como escolha", () => {
    expect(NEXT_STATUS_OPTIONS).not.toContain("STATUS_CHANGE");
  });
});
