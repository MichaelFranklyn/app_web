import { describe, expect, it } from "vitest";

import { ColumnChoice } from "@/utils/import/columns";

import {
  BuildArgs,
  buildImportInput,
  canImport,
  canSaveTemplate,
  hasConfiguredTaxes,
} from "./build";

// Colunas da "planilha" de teste (índices usados no mapeamento abaixo):
// 0 código | 1 nome | 2 unid/emb | 3 Varejo | 4 Atacado | 5 IPI | 6 NCM
// 7 MVA | 8 ICMS créd | 9 interna | 10 categoria | 11 unidade | 12 embalagem
const col = (index: number): ColumnChoice => ({ kind: "column", index });
const NONE: ColumnChoice = { kind: "none" };

const MAPPING = {
  sku: col(0),
  name: col(1),
  unitPerPack: col(2),
  category: col(10),
  unit: col(11),
  unitLabel: col(12),
};

const TIERS = [
  { id: "t1", columnIndex: 3, tierName: "Varejo" },
  { id: "t2", columnIndex: 4, tierName: "Atacado" },
];

function makeArgs(overrides: Partial<BuildArgs> = {}): BuildArgs {
  return {
    companyFactoryId: "cf-1",
    data: { headers: [], rows: [] },
    mapping: MAPPING,
    unitRecon: {},
    labelRecon: {},
    tierColumns: TIERS,
    ipiChoice: col(5),
    ncmChoice: col(6),
    taxColumns: [],
    stMva: { mva: NONE, icmsCredit: NONE, internalRate: NONE },
    listName: "Tabela Nordeste",
    region: "Nordeste",
    validFrom: "2026-07-01",
    validUntil: null,
    pricesPerUnit: false,
    ipiAsFraction: false,
    taxesAsFraction: false,
    ...overrides,
  };
}

// Linha de produto completa e válida.
const fullRow = [
  "SKU-1", // 0 código
  "Torneira", // 1 nome
  "12", // 2 unidades por embalagem
  "10,50", // 3 preço Varejo
  "9,00", // 4 preço Atacado
  "3,25", // 5 IPI
  "3922.10.00", // 6 NCM
  "45", // 7 MVA
  "20,5", // 8 ICMS crédito
  "20,5", // 9 alíquota interna
  "Torneiras", // 10 categoria
  "Peça", // 11 unidade
  "Caixa", // 12 embalagem
];

describe("buildImportInput — linha completa", () => {
  it("mapeia colunas → produto, com preços por nível, IPI, NCM e metadados", () => {
    const { input } = buildImportInput(
      makeArgs({ data: { headers: [], rows: [fullRow] } })
    );

    expect(input.rows).toHaveLength(1);
    const row = input.rows[0];
    expect(row).toMatchObject({
      sku: "SKU-1",
      name: "Torneira",
      unitPerPack: 12,
      category: "Torneiras",
      unit: "Peça",
      unitLabel: "Caixa",
      ncm: "3922.10.00",
      ipiRate: 3.25,
      packDefaulted: false,
    });
    expect(row.prices).toEqual([
      { tierName: "Varejo", unitPrice: 10.5 },
      { tierName: "Atacado", unitPrice: 9 },
    ]);
    // input também carrega os metadados/flags da lista.
    expect(input).toMatchObject({
      companyFactoryId: "cf-1",
      listName: "Tabela Nordeste",
      region: "Nordeste",
      validFrom: "2026-07-01",
      validUntil: null,
      tiers: ["Varejo", "Atacado"],
      importIpi: true,
    });
  });

  it("preço de nível não-numérico é descartado (mantém só os finitos)", () => {
    const row = [...fullRow];
    row[4] = "sob consulta"; // Atacado sem número
    const { input } = buildImportInput(
      makeArgs({ data: { headers: [], rows: [row] } })
    );
    expect(input.rows[0].prices).toEqual([
      { tierName: "Varejo", unitPrice: 10.5 },
    ]);
  });

  it("campos opcionais vazios viram null (o backend aplica os padrões)", () => {
    const row = [...fullRow];
    row[6] = ""; // NCM
    row[10] = ""; // categoria
    const { input } = buildImportInput(
      makeArgs({ data: { headers: [], rows: [row] } })
    );
    expect(input.rows[0]).toMatchObject({ ncm: null, category: null });
  });

  it("unidade/embalagem passam pela reconciliação (recon) antes de ir ao input", () => {
    const { input } = buildImportInput(
      makeArgs({
        data: { headers: [], rows: [fullRow] },
        unitRecon: { Peça: "Peça (un)" },
        labelRecon: { Caixa: "Caixa Master" },
      })
    );
    expect(input.rows[0]).toMatchObject({
      unit: "Peça (un)",
      unitLabel: "Caixa Master",
    });
  });
});

describe("buildImportInput — IPI opcional", () => {
  it("sem coluna de IPI: importIpi=false e ipiRate null", () => {
    const { input } = buildImportInput(
      makeArgs({ data: { headers: [], rows: [fullRow] }, ipiChoice: NONE })
    );
    expect(input.importIpi).toBe(false);
    expect(input.rows[0].ipiRate).toBeNull();
  });

  it("IPI não-numérico na linha vira null (não quebra a mutation)", () => {
    const row = [...fullRow];
    row[5] = "isento";
    const { input } = buildImportInput(
      makeArgs({ data: { headers: [], rows: [row] } })
    );
    expect(input.importIpi).toBe(true);
    expect(input.rows[0].ipiRate).toBeNull();
  });
});

describe("buildImportInput — linhas ignoradas e múltiplo assumido", () => {
  it("linha sem código é ignorada com motivo 'sem código'", () => {
    const noSku = [...fullRow];
    noSku[0] = "";
    const built = buildImportInput(
      makeArgs({ data: { headers: [], rows: [fullRow, noSku] } })
    );
    expect(built.input.rows).toHaveLength(1);
    expect(built.skippedRows).toBe(1);
    expect(built.skipped).toEqual([
      { sku: "", name: "Torneira", reason: "sem código" },
    ]);
  });

  it("linha com código mas sem descrição é ignorada com 'sem descrição'", () => {
    const noName = [...fullRow];
    noName[1] = "";
    const built = buildImportInput(
      makeArgs({ data: { headers: [], rows: [noName] } })
    );
    expect(built.input.rows).toHaveLength(0);
    expect(built.skipped).toEqual([
      { sku: "SKU-1", name: "", reason: "sem descrição" },
    ]);
  });

  it("embalagem ausente/zero: entra com unitPerPack=1 e packDefaulted, e é listado", () => {
    const noPack = [...fullRow];
    noPack[0] = "SKU-2";
    noPack[2] = ""; // sem unidade por embalagem
    const zeroPack = [...fullRow];
    zeroPack[0] = "SKU-3";
    zeroPack[2] = "0";
    const built = buildImportInput(
      makeArgs({ data: { headers: [], rows: [noPack, zeroPack] } })
    );
    expect(built.input.rows).toHaveLength(2);
    expect(built.input.rows.every((r) => r.unitPerPack === 1)).toBe(true);
    expect(built.input.rows.every((r) => r.packDefaulted === true)).toBe(true);
    expect(built.defaultedPack).toEqual([
      { sku: "SKU-2", name: "Torneira" },
      { sku: "SKU-3", name: "Torneira" },
    ]);
  });
});

describe("buildImportInput — impostos (taxes)", () => {
  it("colunas de imposto aditivo viram taxes RATE por linha", () => {
    const { input } = buildImportInput(
      makeArgs({
        data: { headers: [], rows: [fullRow] },
        taxColumns: [{ id: "x", columnIndex: 8, taxName: "ICMS" }],
      })
    );
    expect(input.rows[0].taxes).toContainEqual({
      name: "ICMS",
      calcType: "RATE",
      rate: 20.5,
    });
  });

  it("ST por MVA completo vira uma tax ST_MVA com os três componentes", () => {
    const { input } = buildImportInput(
      makeArgs({
        data: { headers: [], rows: [fullRow] },
        stMva: { mva: col(7), icmsCredit: col(8), internalRate: col(9) },
      })
    );
    expect(input.rows[0].taxes).toContainEqual({
      name: "ST",
      calcType: "ST_MVA",
      mva: 45,
      icmsCreditRate: 20.5,
      internalRate: 20.5,
    });
  });

  it("ST incompleto (falta a interna) não gera tax ST", () => {
    const { input } = buildImportInput(
      makeArgs({
        data: { headers: [], rows: [fullRow] },
        stMva: { mva: col(7), icmsCredit: col(8), internalRate: NONE },
      })
    );
    expect(input.rows[0].taxes).toEqual([]);
  });
});

describe("buildImportInput — passagem de flags e vigência", () => {
  it("repassa pricesPerUnit/ipiAsFraction/taxesAsFraction e trima nome/região", () => {
    const { input } = buildImportInput(
      makeArgs({
        data: { headers: [], rows: [fullRow] },
        pricesPerUnit: true,
        ipiAsFraction: true,
        taxesAsFraction: true,
        listName: "  Lista 39  ",
        region: "  Sudeste  ",
        validUntil: "2026-12-31",
      })
    );
    expect(input).toMatchObject({
      pricesPerUnit: true,
      ipiAsFraction: true,
      taxesAsFraction: true,
      listName: "Lista 39",
      region: "Sudeste",
      validUntil: "2026-12-31",
    });
  });
});

describe("canSaveTemplate / canImport / hasConfiguredTaxes", () => {
  it("canSaveTemplate exige mapeamento completo E ao menos um nível", () => {
    expect(canSaveTemplate(makeArgs())).toBe(true);
    // sem nível válido
    expect(canSaveTemplate(makeArgs({ tierColumns: [] }))).toBe(false);
    // mapeamento incompleto (unitPerPack sem origem)
    expect(
      canSaveTemplate(makeArgs({ mapping: { ...MAPPING, unitPerPack: NONE } }))
    ).toBe(false);
  });

  it("canImport soma nome e vigência ao canSaveTemplate", () => {
    expect(canImport(makeArgs())).toBe(true);
    expect(canImport(makeArgs({ listName: "  " }))).toBe(false);
    expect(canImport(makeArgs({ validFrom: "" }))).toBe(false);
    // mesmo com nome/vigência, sem nível não importa.
    expect(canImport(makeArgs({ tierColumns: [] }))).toBe(false);
  });

  it("hasConfiguredTaxes: verdadeiro com imposto aditivo OU ST completo", () => {
    expect(hasConfiguredTaxes(makeArgs())).toBe(false);
    expect(
      hasConfiguredTaxes(
        makeArgs({ taxColumns: [{ id: "x", columnIndex: 8, taxName: "ICMS" }] })
      )
    ).toBe(true);
    expect(
      hasConfiguredTaxes(
        makeArgs({
          stMva: { mva: col(7), icmsCredit: col(8), internalRate: col(9) },
        })
      )
    ).toBe(true);
    // coluna de imposto sem nome não conta.
    expect(
      hasConfiguredTaxes(
        makeArgs({ taxColumns: [{ id: "x", columnIndex: 8, taxName: "  " }] })
      )
    ).toBe(false);
  });
});
