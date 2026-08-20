import { describe, expect, it } from "vitest";

import { buildQueryFilters } from "@/hooks/useTableData";
import {
  buildKpis,
  formatCity,
  KPI_IGNORED_FILTERS,
  listFilters,
  STATE_OPTIONS,
  TABLE_FIELDS,
} from "./utils";

describe("formatCity", () => {
  it("junta cidade e UF", () => {
    expect(formatCity("Salvador", "BA")).toBe("Salvador / BA");
  });

  it("mostra o que tiver quando falta uma das pontas", () => {
    expect(formatCity("Salvador", null)).toBe("Salvador");
    expect(formatCity(null, "BA")).toBe("BA");
  });

  it("cai no traço quando não há endereço", () => {
    expect(formatCity(null, null)).toBe("—");
  });
});

describe("TABLE_FIELDS", () => {
  it("busca por razão social e nome fantasia com like (o backend combina com OR)", () => {
    expect(buildQueryFilters(TABLE_FIELDS, { search: "padaria" })).toEqual([
      {
        field: "razao_social,nome_fantasia",
        operator: "like",
        value: "padaria",
      },
    ]);
  });

  it("traduz os filtros do painel nas colunas do backend", () => {
    expect(
      buildQueryFilters(TABLE_FIELDS, {
        sellerId: "s1",
        state: "BA",
        needsAttention: "true",
      })
    ).toEqual([
      { field: "seller_id", operator: "eq", value: "s1" },
      { field: "address_state", operator: "eq", value: "BA" },
      { field: "is_needs_attention", operator: "eq", value: "true" },
    ]);
  });

  it("manda 'false' quando a pessoa pede só os cadastros sem pendência", () => {
    // Não pode virar "campo sem valor": "false" é uma escolha, não a ausência
    // de filtro — quem escolheu isso não quer ver a carteira inteira.
    expect(
      buildQueryFilters(TABLE_FIELDS, { needsAttention: "false" })
    ).toEqual([
      { field: "is_needs_attention", operator: "eq", value: "false" },
    ]);
  });

  it("ignora campo sem valor", () => {
    expect(buildQueryFilters(TABLE_FIELDS, {})).toEqual([]);
  });
});

describe("STATE_OPTIONS", () => {
  it("traz as 27 unidades da federação, sem repetir", () => {
    expect(STATE_OPTIONS).toHaveLength(27);
    expect(new Set(STATE_OPTIONS.map((o) => o.value)).size).toBe(27);
  });

  it("usa a sigla como valor e como rótulo (é o que a coluna Cidade mostra)", () => {
    STATE_OPTIONS.forEach((option) => {
      expect(option.label).toBe(option.value);
      expect(option.value).toMatch(/^[A-Z]{2}$/);
    });
  });
});

/**
 * O aviso da tela e o recorte real têm de dizer a mesma coisa.
 *
 * `KPI_IGNORED_FILTERS` alimenta a tarja "isto filtra só a lista abaixo". Ela lê
 * os mesmos `filterFields` que desenham o painel, então um filtro novo entra no
 * aviso sozinho — e o único que os cartões de fato seguem (`sellerId`) precisa
 * continuar de fora. Se alguém ensinar o backend a recortar os KPIs por rede e
 * esquecer daqui, a tela passa a avisar de um limite que não existe mais.
 */
describe("KPI_IGNORED_FILTERS", () => {
  // Os mesmos campos do painel (ver useClientFilters), nome por nome.
  const FIELDS = [
    { key: "search", label: "Busca" },
    { key: "sellerId", label: "Vendedor" },
    { key: "networkId", label: "Rede" },
    { key: "segmentId", label: "Segmento" },
    { key: "state", label: "Estado" },
    { key: "needsAttention", label: "Cadastro" },
  ];

  it("não avisa nada com a carteira inteira à vista", () => {
    expect(KPI_IGNORED_FILTERS(FIELDS, {})).toEqual([]);
  });

  it("não avisa por vendedor: os cartões seguem esse recorte", () => {
    expect(KPI_IGNORED_FILTERS(FIELDS, { sellerId: "s1" })).toEqual([]);
  });

  it("avisa por qualquer outro filtro, pelo nome que está no painel", () => {
    expect(KPI_IGNORED_FILTERS(FIELDS, { networkId: "n1" })).toEqual(["Rede"]);
    expect(KPI_IGNORED_FILTERS(FIELDS, { state: "BA" })).toEqual(["Estado"]);
  });

  it("junta os que estiverem ativos e ignora o vendedor no meio deles", () => {
    expect(
      KPI_IGNORED_FILTERS(FIELDS, {
        sellerId: "s1",
        networkId: "n1",
        state: "BA",
      })
    ).toEqual(["Rede", "Estado"]);
  });

  it("ignora filtro com valor vazio — campo aberto e não preenchido não recorta nada", () => {
    expect(
      KPI_IGNORED_FILTERS(FIELDS, { search: "", networkId: "n1" })
    ).toEqual(["Rede"]);
  });

  // Todo campo do painel que não seja o vendedor tem de cair no aviso: é o que
  // impede um filtro novo de nascer sem explicação na tela.
  it("cobre todos os campos do painel, um a um", () => {
    FIELDS.filter(({ key }) => key !== "sellerId").forEach(({ key, label }) => {
      expect(KPI_IGNORED_FILTERS(FIELDS, { [key]: "x" })).toEqual([label]);
    });
  });
});

describe("listFilters", () => {
  it("escreve um nome só sem enfeite", () => {
    expect(listFilters(["Rede"])).toBe("Rede");
  });

  it("liga dois nomes com “e”", () => {
    expect(listFilters(["Rede", "Estado"])).toBe("Rede e Estado");
  });

  it("usa vírgula até o último, que vem com “e”", () => {
    expect(listFilters(["Busca", "Rede", "Estado"])).toBe(
      "Busca, Rede e Estado"
    );
  });

  it("devolve texto vazio quando não há nada a listar", () => {
    expect(listFilters([])).toBe("");
  });
});

describe("buildKpis", () => {
  const stats = {
    clientStats: {
      totalClients: 40,
      activeClients: 30,
      atRiskClients: 4,
      noVisit30d: 7,
    },
  };

  it("explica os quatro cartões — nenhum número fica sem “?”", () => {
    buildKpis(stats).forEach((kpi) => expect(kpi.help).toBeTruthy());
  });

  /**
   * O cartão dizia "Em risco de churn / score acima de 70", e o backend conta
   * outra coisa: quem passou do PRÓPRIO intervalo médio de compra (ver
   * `_at_risk_count_query`). O score de visita não entra nessa conta em lugar
   * nenhum — quem lesse o cartão iria procurar esses clientes na aba Score.
   */
  it("não promete score no cartão de quem está atrasado para comprar", () => {
    const atRisk = buildKpis(stats).find((kpi) =>
      kpi.label.includes("Atrasados")
    );
    expect(atRisk?.value).toBe("4");
    expect(atRisk?.delta).not.toMatch(/score/i);
  });

  it("degrada para zeros quando os stats não vieram", () => {
    const semStats = { clientStats: undefined } as unknown as typeof stats;
    expect(buildKpis(semStats).map((k) => k.value)).toEqual([
      "0",
      "0",
      "0",
      "0",
    ]);
  });
});
