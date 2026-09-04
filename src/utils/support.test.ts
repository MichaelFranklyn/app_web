import { describe, expect, it } from "vitest";
import {
  OPEN_SUPPORT_STATUSES,
  SUPPORT_STATUS_LABEL,
  SupportStatus,
  isSupportCaseOpen,
  supportAgeLabel,
} from "./support";

describe("isSupportCaseOpen", () => {
  it("aberto é tudo que ainda pede trabalho de alguém", () => {
    expect(isSupportCaseOpen("OPEN")).toBe(true);
    expect(isSupportCaseOpen("WAITING_FACTORY")).toBe(true);
    expect(isSupportCaseOpen("WAITING_CLIENT")).toBe(true);
  });

  it("resolvido e cancelado estão encerrados", () => {
    expect(isSupportCaseOpen("RESOLVED")).toBe(false);
    expect(isSupportCaseOpen("CANCELLED")).toBe(false);
  });

  // O recorte da fila e o rótulo têm de cobrir o MESMO vocabulário: um status
  // novo no backend sem rótulo aqui apareceria como `undefined` na tela.
  it("todo status aberto tem rótulo", () => {
    OPEN_SUPPORT_STATUSES.forEach((status: SupportStatus) => {
      expect(SUPPORT_STATUS_LABEL[status]).toBeTruthy();
    });
  });
});

describe("supportAgeLabel", () => {
  it("caso aberto conta o que o cliente está esperando", () => {
    expect(supportAgeLabel(12, true)).toBe("12 dias esperando");
    expect(supportAgeLabel(1, true)).toBe("1 dia esperando");
    expect(supportAgeLabel(0, true)).toBe("hoje");
  });

  it("caso encerrado conta quanto levou", () => {
    expect(supportAgeLabel(3, false)).toBe("resolvido em 3 dias");
    expect(supportAgeLabel(0, false)).toBe("no mesmo dia");
  });
});
