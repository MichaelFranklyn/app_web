import { describe, expect, it } from "vitest";

import { WalletRow } from "./interface";
import { WALLET_FILTER_FIELDS } from "./useWalletFilters";
import {
  buildWalletExportRows,
  cadenceLabel,
  cityAndState,
  idleLabel,
  riskLabel,
  summarize,
  WALLET_SORT_COLUMNS,
  WALLET_SORT_LABELS,
} from "./utils";

const row = (patch: Partial<WalletRow>): WalletRow => ({
  clientId: "c1",
  companyClientId: "cc1",
  clientName: "CLIENTE",
  city: "Salvador",
  state: "BA",
  situation: "ACTIVE",
  lastOrderDate: "2026-07-01",
  daysSinceLastOrder: 20,
  avgIntervalDays: 30,
  riskRatio: 0.66,
  orderCount: 4,
  periodOrderCount: 1,
  periodAmount: "500",
  ...patch,
});

describe("WALLET_FILTER_FIELDS", () => {
  it("recorta por situação e por UF", () => {
    const cliente = row({ situation: "AT_RISK", state: "BA" });
    expect(WALLET_FILTER_FIELDS.situation.match(cliente, "AT_RISK")).toBe(true);
    expect(WALLET_FILTER_FIELDS.situation.match(cliente, "ACTIVE")).toBe(false);
    expect(WALLET_FILTER_FIELDS.state.match(cliente, "BA")).toBe(true);
    expect(WALLET_FILTER_FIELDS.state.match(cliente, "SP")).toBe(false);
  });

  it("busca o cliente sem exigir a caixa certa", () => {
    const cliente = row({ clientName: "Mercado Bom Preço" });
    expect(WALLET_FILTER_FIELDS.search.match(cliente, "bom")).toBe(true);
    expect(WALLET_FILTER_FIELDS.search.match(cliente, "zeta")).toBe(false);
  });
});

describe("WALLET_SORT_COLUMNS", () => {
  it("tem rótulo de papel para toda coluna ordenável", () => {
    // As duas metades são um contrato: coluna sem rótulo sairia do PDF sem
    // dizer em que ordem o papel está.
    expect(Object.keys(WALLET_SORT_LABELS).sort()).toEqual(
      Object.keys(WALLET_SORT_COLUMNS).sort()
    );
  });

  it("ordena dinheiro como número, não como texto", () => {
    expect(WALLET_SORT_COLUMNS.periodAmount(row({ periodAmount: "900" }))).toBe(
      900
    );
  });
});

describe("cityAndState", () => {
  it("junta cidade e UF", () => {
    expect(cityAndState(row({}))).toBe("Salvador / BA");
  });

  it("cai no traço quando o endereço não foi preenchido", () => {
    expect(cityAndState(row({ city: null, state: null }))).toBe("—");
  });

  it("mostra o que existe quando só um dos dois foi preenchido", () => {
    expect(cityAndState(row({ city: null }))).toBe("BA");
  });
});

describe("idleLabel", () => {
  it("diz que nunca comprou em vez de mostrar zero dias", () => {
    // Zero dias parado seria lido como "comprou hoje" — o oposto do fato.
    expect(idleLabel(row({ daysSinceLastOrder: null }))).toBe("nunca comprou");
  });

  it("escreve os dias parados", () => {
    expect(idleLabel(row({ daysSinceLastOrder: 18 }))).toBe("18 dias");
  });
});

describe("cadenceLabel", () => {
  it("não inventa ritmo para quem só comprou uma vez", () => {
    expect(cadenceLabel(row({ avgIntervalDays: null }))).toBe("—");
  });

  it("escreve o intervalo próprio do cliente", () => {
    expect(cadenceLabel(row({ avgIntervalDays: 30 }))).toBe("a cada 30 dias");
  });
});

describe("riskLabel", () => {
  it("mostra o atraso como múltiplo do próprio ritmo", () => {
    expect(riskLabel(row({ riskRatio: 1.85 }))).toBe("1.9×");
  });

  it("sem ritmo próprio não há múltiplo a mostrar", () => {
    expect(riskLabel(row({ riskRatio: null }))).toBe("—");
  });
});

describe("summarize", () => {
  it("conta atrasados e parados do recorte exportado", () => {
    const totals = summarize([
      row({ situation: "AT_RISK", periodAmount: "100" }),
      row({ situation: "INACTIVE", periodAmount: "50" }),
      row({ situation: "ACTIVE", periodAmount: "25" }),
    ]);
    expect(totals.clients).toBe(3);
    expect(totals.atRisk).toBe(1);
    expect(totals.inactive).toBe(1);
    expect(totals.amount).toContain("175");
  });
});

describe("buildWalletExportRows", () => {
  it("exporta o valor como número e o resto legível", () => {
    const [line] = buildWalletExportRows([
      row({ periodAmount: "1500.75", situation: "AT_RISK" }),
    ]);
    expect(line[2]).toBe("Atrasado");
    expect(line[9]).toBe(1500.75);
  });

  it("cliente que nunca comprou não recebe data nem ritmo", () => {
    const [line] = buildWalletExportRows([
      row({
        situation: "NEVER",
        lastOrderDate: null,
        daysSinceLastOrder: null,
        avgIntervalDays: null,
        riskRatio: null,
      }),
    ]);
    expect(line[3]).toBe("nunca comprou");
    expect(line[4]).toBe("—");
    expect(line[5]).toBe("—");
  });
});
