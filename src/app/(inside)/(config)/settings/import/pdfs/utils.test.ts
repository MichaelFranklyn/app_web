import { describe, expect, it } from "vitest";

import { PdfImportBatch, PdfImportFile } from "./interface";
import { HistoryResult } from "../interface";
import {
  batchBadge,
  batchCounts,
  batchOpenedAt,
  buildPdfRows,
  fileBadge,
  fileItemsTotal,
  hashFile,
  fileBlocker,
  fileStatus,
  freePdfSlots,
  importedFileIds,
  paymentTermDays,
  paymentTermsHint,
  pickedId,
  rowStatus,
} from "./utils";

const batch = (over: Partial<PdfImportBatch> = {}): PdfImportBatch => ({
  id: "b1",
  factoryId: "f1",
  factoryName: "Fábrica",
  sellerId: null,
  defaultStatus: "DELIVERED",
  createdAt: "2026-11-17T10:00:00Z",
  totalFiles: 0,
  pendingFiles: 0,
  readFiles: 0,
  failedFiles: 0,
  importedFiles: 0,
  ...over,
});

const file = (over: Partial<PdfImportFile> = {}): PdfImportFile => ({
  id: "p1",
  fileName: "573.pdf",
  size: 1000,
  status: "READ",
  isStale: false,
  header: {
    clientDocument: "12345678000190",
    clientName: "Mercado Bom",
    orderDate: "2026-03-10",
    orderNumber: "573",
    invoiceNumber: null,
    paymentTerms: "30/60",
  },
  items: [
    {
      code: "A1",
      name: "Pote",
      quantity: "10",
      unitPrice: "2.50",
      ipiRate: null,
    },
    {
      code: "B2",
      name: "Tampa",
      quantity: "5",
      unitPrice: "1.00",
      ipiRate: null,
    },
  ],
  unreadableRows: 0,
  error: null,
  createdAt: "2026-11-17T10:00:00Z",
  readAt: "2026-11-17T10:00:05Z",
  clientId: "c1",
  clientName: "Mercado Bom",
  suggestedSellerId: "s-cliente",
  ...over,
});

describe("hashFile", () => {
  it("devolve o SHA-256 em hex", async () => {
    // O Blob do jsdom não tem `arrayBuffer`; o do navegador tem.
    const blob = {
      arrayBuffer: async () => new TextEncoder().encode("abc").buffer,
    };
    expect(await hashFile(blob as Pick<Blob, "arrayBuffer">)).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
  });
});

describe("rowStatus", () => {
  it("com nota fiscal, o confirmado vira faturado", () => {
    expect(rowStatus("CONFIRMED", "123")).toBe("INVOICED");
    expect(rowStatus("SENT_TO_FACTORY", "123")).toBe("INVOICED");
  });
  it("sem nota, ou já depois dela, fica o do lote", () => {
    expect(rowStatus("CONFIRMED", null)).toBe("CONFIRMED");
    expect(rowStatus("DELIVERED", "123")).toBe("DELIVERED");
  });
});

describe("buildPdfRows", () => {
  it("vira uma linha por item, com o pedido e o vendedor do cliente", () => {
    const built = buildPdfRows(batch(), [file()], {});
    expect(built.rows).toHaveLength(2);
    expect(built.rows[0]).toMatchObject({
      row: 1,
      externalRef: "573",
      clientDocument: "12345678000190",
      factoryId: "f1",
      sellerId: "s-cliente",
      orderDate: "2026-03-10",
      productCode: "A1",
      quantity: "10",
      status: "DELIVERED",
      paymentTerms: "30/60",
    });
    expect(built.labels).toEqual({
      1: "573.pdf, item 1",
      2: "573.pdf, item 2",
    });
    expect(built.fileIds).toEqual(["p1"]);
    expect(built.problems).toEqual([]);
  });

  it("o vendedor do lote vale sobre o do cliente, e o escolhido no PDF sobre os dois", () => {
    expect(
      buildPdfRows(batch({ sellerId: "s-lote" }), [file()], {}).rows[0].sellerId
    ).toBe("s-lote");
    expect(
      buildPdfRows(batch({ sellerId: "s-lote" }), [file()], {
        p1: { sellerId: "s-pdf" },
      }).rows[0].sellerId
    ).toBe("s-pdf");
  });

  it("sem número do pedido, o nome do arquivo identifica o pedido", () => {
    const pdf = file({ header: { ...file().header!, orderNumber: null } });
    expect(buildPdfRows(batch(), [pdf], {}).rows[0].externalRef).toBe(
      "573.pdf"
    );
  });

  it("sem data, o PDF fica de fora até a data ser informada", () => {
    const pdf = file({ header: { ...file().header!, orderDate: null } });
    const blocked = buildPdfRows(batch(), [pdf], {});
    expect(blocked.rows).toEqual([]);
    expect(blocked.problems).toEqual([
      { row: 1, message: "informe a data do pedido." },
    ]);
    expect(blocked.labels[1]).toBe("573.pdf");
    const fixed = buildPdfRows(batch(), [pdf], {
      p1: { orderDate: "2026-04-01" },
    });
    expect(fixed.rows[0].orderDate).toBe("2026-04-01");
  });

  it("sem vendedor para o cliente, aponta o problema", () => {
    const built = buildPdfRows(
      batch(),
      [file({ suggestedSellerId: null })],
      {}
    );
    expect(built.rows).toEqual([]);
    expect(built.problems[0].message).toMatch(/vendedor/);
  });

  it("cliente fora da carteira pede o vendedor deste pedido", () => {
    const built = buildPdfRows(
      batch(),
      [file({ clientId: null, suggestedSellerId: null })],
      {}
    );
    expect(built.problems[0].message).toMatch(/não está na carteira/);
  });

  it("deixa de fora os importados; aponta os que falharam", () => {
    const built = buildPdfRows(
      batch(),
      [
        file({ id: "a", status: "IMPORTED" }),
        file({
          id: "c",
          fileName: "ruim.pdf",
          status: "FAILED",
          error: "PDF escaneado.",
        }),
      ],
      {}
    );
    expect(built.rows).toEqual([]);
    expect(built.fileIds).toEqual([]);
    expect(built.problems).toEqual([{ row: 1, message: "PDF escaneado." }]);
    expect(built.labels[1]).toBe("ruim.pdf");
  });

  it("sem CNPJ no PDF, usa o do cliente achado pelo código na fábrica", () => {
    const pdf = file({
      header: { ...file().header!, clientDocument: null, clientCode: "23401" },
      clientDocument: "98765432000110",
      clientMatchedBy: "FACTORY_CODE",
    });
    const built = buildPdfRows(batch(), [pdf], {});
    expect(built.problems).toEqual([]);
    expect(built.rows[0].clientDocument).toBe("98765432000110");
  });

  it("sem CNPJ e sem cliente com o código, explica o que cadastrar", () => {
    const noCnpj = { ...file().header!, clientDocument: null };
    const withCode = buildPdfRows(
      batch(),
      [file({ header: { ...noCnpj, clientCode: "23401" }, clientId: null })],
      {}
    );
    expect(withCode.rows).toEqual([]);
    expect(withCode.problems[0].message).toMatch(/código 23401/);
    const noCode = buildPdfRows(batch(), [file({ header: noCnpj })], {});
    expect(noCode.problems[0].message).toBe(
      "o PDF não traz o CNPJ nem o código do cliente. Vincule um cliente da carteira ou cadastre um novo."
    );
  });

  it("a observação do PDF vai uma vez, na primeira linha do pedido", () => {
    const pdf = file({
      header: { ...file().header!, notes: "Entregar sexta." },
    });
    const built = buildPdfRows(batch(), [pdf], {});
    expect(built.rows.map((r) => r.notes)).toEqual(["Entregar sexta.", null]);
  });

  it("numera as linhas em sequência entre os PDFs", () => {
    const built = buildPdfRows(
      batch(),
      [
        file({ id: "a", unreadableRows: 1 }),
        file({ id: "b", fileName: "591.pdf" }),
      ],
      {}
    );
    expect(built.problems).toHaveLength(1);
    expect(built.problems[0].row).toBe(1);
    expect(built.rows.map((r) => r.row)).toEqual([2, 3, 4, 5]);
    expect(built.labels[4]).toBe("591.pdf, item 1");
  });
});

describe("fileBadge", () => {
  it("diferencia o envio caído do que ainda está lendo", () => {
    expect(fileBadge(file({ status: "PENDING" })).label).toBe("Lendo");
    expect(fileBadge(file({ status: "PENDING", isStale: true })).label).toBe(
      "Leitura interrompida"
    );
  });
});

describe("importedFileIds", () => {
  const result = (over: Partial<HistoryResult> = {}): HistoryResult => ({
    dryRun: false,
    totalRows: 0,
    ordersCreated: 0,
    ordersAlreadyImported: 0,
    ordersSkipped: 0,
    itemsImported: 0,
    itemsSkipped: 0,
    linksCreated: 0,
    clientsCreated: 0,
    productsCreated: 0,
    sellerAccessesGranted: 0,
    installmentsCreated: 0,
    issues: [],
    missingProducts: [],
    missingClients: [],
    missingSellerAccess: [],
    newPaymentTerms: [],
    ...over,
  });
  const files = [
    file({ id: "a" }),
    file({
      id: "b",
      header: { ...file().header!, clientDocument: "11.222.333/0001-81" },
    }),
  ];
  const build = buildPdfRows(batch(), files, {});

  it("todos entram quando nada foi recusado", () => {
    expect(importedFileIds(build, files, result())).toEqual(["a", "b"]);
  });

  it("cliente fora da carteira não conta como importado", () => {
    const res = result({
      missingClients: [{ document: "11222333000181", rows: 2 }],
    });
    expect(importedFileIds(build, files, res)).toEqual(["a"]);
  });

  it("PDF com todos os itens recusados não conta; com parte, conta", () => {
    const res = result({
      issues: [
        { row: 1, message: "x" },
        { row: 2, message: "x" },
        { row: 3, message: "x" },
      ],
    });
    expect(importedFileIds(build, files, res)).toEqual(["b"]);
  });
});

describe("lote na lista de lotes", () => {
  it("conta com o plural certo", () => {
    expect(batchCounts(batch({ totalFiles: 1, readFiles: 1 }))).toBe(
      "1 PDF no lote · 1 lido"
    );
    expect(
      batchCounts(batch({ totalFiles: 5, readFiles: 3, failedFiles: 2 }))
    ).toBe("5 PDFs no lote · 3 lidos · 2 não lidos");
  });

  it("diz em que pé está o lote", () => {
    expect(batchBadge(batch({ totalFiles: 0 })).label).toBe("Vazio");
    expect(
      batchBadge(batch({ totalFiles: 2, pendingFiles: 1, readFiles: 1 })).label
    ).toBe("Lendo");
    expect(batchBadge(batch({ totalFiles: 2, readFiles: 2 })).label).toBe(
      "Falta importar"
    );
    expect(
      batchBadge(batch({ totalFiles: 3, importedFiles: 2, failedFiles: 1 }))
        .label
    ).toBe("Importado");
    expect(batchBadge(batch({ totalFiles: 1, failedFiles: 1 })).label).toBe(
      "Não lido"
    );
  });

  it("mostra a hora no fuso do escritório", () => {
    expect(batchOpenedAt("2026-11-17T13:05:00Z")).toBe("17/11/2026 às 10:05");
    expect(batchOpenedAt("lixo")).toBe("—");
  });
});

describe("vendedor e situação escolhidos na prévia", () => {
  const defaults = { sellerId: null, status: "DELIVERED" as const };

  it("o padrão de todos vale sobre o do cliente, e o do PDF sobre os dois", () => {
    const pdfs = [file({ id: "a" }), file({ id: "b", fileName: "b.pdf" })];
    const built = buildPdfRows(
      batch(),
      pdfs,
      { b: { sellerId: "s-pdf", status: "CANCELLED" } },
      { sellerId: "s-todos", status: "INVOICED" }
    );
    expect(built.rows.map((r) => [r.sellerId, r.status])).toEqual([
      ["s-todos", "INVOICED"],
      ["s-todos", "INVOICED"],
      ["s-pdf", "CANCELLED"],
      ["s-pdf", "CANCELLED"],
    ]);
  });

  it("sem vendedor para todos, fica o do cliente", () => {
    const built = buildPdfRows(batch(), [file()], {}, defaults);
    expect(built.rows[0].sellerId).toBe("s-cliente");
  });

  it("com a nota no PDF, confirmado vira faturado; a escolha no PDF manda", () => {
    const pdf = file({
      header: { ...file().header!, invoiceNumber: "991" },
    });
    const confirmed = { sellerId: null, status: "CONFIRMED" as const };
    expect(fileStatus(confirmed, pdf)).toBe("INVOICED");
    expect(fileStatus(confirmed, pdf, { status: "CONFIRMED" })).toBe(
      "CONFIRMED"
    );
  });
});

describe("cliente escolhido na prévia (PDF sem CNPJ nem código)", () => {
  const defaults = { sellerId: "s1", status: "DELIVERED" as const };
  const noClient = file({
    header: { ...file().header!, clientDocument: null, clientCode: "777" },
    clientId: null,
    clientName: null,
    suggestedSellerId: null,
  });

  it("sem escolher, fica de fora pedindo o cliente", () => {
    expect(fileBlocker(defaults, noClient)).toMatch(/código 777/);
  });

  it("cliente da carteira: usa o CNPJ e o nome do escolhido", () => {
    expect(fileBlocker(defaults, noClient, { clientMode: "existing" })).toBe(
      "escolha o cliente da carteira."
    );
    const built = buildPdfRows(
      batch(),
      [noClient],
      {
        p1: {
          clientMode: "existing",
          clientId: "c9",
          clientDocument: "11222333000181",
          clientName: "Mercado Escolhido",
        },
      },
      defaults
    );
    expect(built.problems).toEqual([]);
    expect(built.rows[0]).toMatchObject({
      clientDocument: "11222333000181",
      clientName: "Mercado Escolhido",
      createClient: false,
      factoryClientCode: "777",
    });
  });

  it("cliente novo: exige CNPJ válido e nome, e pede para criar", () => {
    const base = { clientMode: "new" as const };
    expect(
      fileBlocker(defaults, noClient, {
        ...base,
        clientDocument: "11222333000100",
      })
    ).toBe("informe um CNPJ válido para o cliente novo.");
    expect(
      fileBlocker(defaults, noClient, {
        ...base,
        clientDocument: "11222333000181",
        clientName: "  ",
      })
    ).toBe("informe o nome do cliente novo.");
    const built = buildPdfRows(
      batch(),
      [noClient],
      {
        p1: {
          ...base,
          clientDocument: "11222333000181",
          clientName: "Mercado Novo",
        },
      },
      defaults
    );
    expect(built.problems).toEqual([]);
    expect(built.rows[0]).toMatchObject({
      clientDocument: "11222333000181",
      clientName: "Mercado Novo",
      createClient: true,
      factoryClientCode: "777",
    });
  });

  it("cliente achado pelo código não reenvia o código", () => {
    const byCode = file({
      header: { ...file().header!, clientDocument: null, clientCode: "23401" },
      clientDocument: "98765432000110",
      clientMatchedBy: "FACTORY_CODE",
    });
    const built = buildPdfRows(batch(), [byCode], {});
    expect(built.rows[0]).toMatchObject({
      createClient: false,
      factoryClientCode: null,
    });
  });
});

describe("vagas do lote e escolha no select", () => {
  it("lidos e chegando ocupam vaga; importados, falhos e caídos não", () => {
    const files = [
      file({ id: "1" }),
      file({ id: "2", status: "PENDING" }),
      file({ id: "3", status: "PENDING", isStale: true }),
      file({ id: "4", status: "FAILED" }),
      file({ id: "5", status: "IMPORTED" }),
    ];
    expect(freePdfSlots(files)).toBe(18);
    expect(
      freePdfSlots(Array.from({ length: 25 }, (_, i) => file({ id: `${i}` })))
    ).toBe(0);
  });

  it("valor vazio no select vale como nada escolhido", () => {
    expect(pickedId({ value: "", label: "O vendedor de cada cliente" })).toBe(
      null
    );
    expect(pickedId([{ value: "s1", label: "Ana" }])).toBe("s1");
    expect(pickedId(null)).toBe(null);
  });
});

describe("fileItemsTotal", () => {
  const item = (quantity: string, unitPrice: string | null) => ({
    code: "X",
    name: "X",
    quantity,
    unitPrice,
    ipiRate: null,
  });

  it("soma quantidade × preço e conta os itens sem preço", () => {
    const f = file({
      items: [item("10", "2.50"), item("3", "1.10"), item("2", null)],
    });
    const result = fileItemsTotal(f);
    expect(result?.total).toBeCloseTo(28.3);
    expect(result?.unpriced).toBe(1);
  });

  it("é nulo quando nenhum item trouxe preço", () => {
    expect(fileItemsTotal(file({ items: [item("1", null)] }))).toBeNull();
    expect(fileItemsTotal(file({ items: [] }))).toBeNull();
  });
});

describe("condição de pagamento", () => {
  it("a digitada vale sobre a lida; apagada, o pedido vai sem condição", () => {
    const rows = (override = {}) =>
      buildPdfRows(batch(), [file()], { p1: override }).rows[0].paymentTerms;
    expect(rows()).toBe("30/60");
    expect(rows({ paymentTerms: " 28/35/42 " })).toBe("28/35/42");
    expect(rows({ paymentTerms: "" })).toBeNull();
  });

  it("lê os dias como o backend", () => {
    expect(paymentTermDays("90/30/60 DDL")).toEqual([30, 60, 90]);
    expect(paymentTermDays("À vista")).toEqual([0]);
    expect(paymentTermDays("boleto")).toBeNull();
    expect(paymentTermDays("30/900")).toBeNull();
  });

  it("explica o que a condição vira, e acusa a que não tem dias", () => {
    expect(paymentTermsHint("30/60").message).toContain("30/60 dias");
    expect(paymentTermsHint("a vista").message).toContain("à vista");
    expect(paymentTermsHint("boleto").error).toBe(true);
    expect(paymentTermsHint(null).error).toBe(false);
  });
});
