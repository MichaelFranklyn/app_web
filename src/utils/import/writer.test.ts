import { beforeEach, describe, expect, it, vi } from "vitest";

import { downloadSheet, SheetOutput } from "./writer";

// Nomes do SheetJS são snake_case; aqui viram camelCase e são religados no
// `vi.mock` abaixo.
const { aoaToSheet, bookNew, bookAppendSheet, writeFile } = vi.hoisted(() => ({
  aoaToSheet: vi.fn(),
  bookNew: vi.fn(),
  bookAppendSheet: vi.fn(),
  writeFile: vi.fn(),
}));

// O SheetJS é carregado sob demanda (import dinâmico) e, no navegador, o
// `writeFile` dispara o download de verdade — aqui só observamos o que foi
// montado antes dele.
vi.mock("xlsx", () => ({
  utils: {
    aoa_to_sheet: aoaToSheet,
    book_new: bookNew,
    book_append_sheet: bookAppendSheet,
  },
  writeFile,
}));

const worksheet: Record<string, unknown> = {};
const workbook = { sheets: true };

beforeEach(() => {
  for (const key of Object.keys(worksheet)) delete worksheet[key];
  aoaToSheet.mockReset().mockReturnValue(worksheet);
  bookNew.mockReset().mockReturnValue(workbook);
  bookAppendSheet.mockReset();
  writeFile.mockReset();
});

const larguras = () =>
  (worksheet["!cols"] as { wch: number }[]).map((c) => c.wch);

describe("downloadSheet", () => {
  const rows: SheetOutput = [
    ["SKU", "Produto", "Preço"],
    ["A-1", "Torneira", 4820],
  ];

  it("monta a planilha com as linhas recebidas e baixa com o nome pedido", async () => {
    await downloadSheet("modelo-produtos.xlsx", rows);

    expect(aoaToSheet).toHaveBeenCalledWith(rows);
    expect(writeFile).toHaveBeenCalledWith(workbook, "modelo-produtos.xlsx");
  });

  it("preserva o número como NÚMERO, para a coluna somar no Excel", async () => {
    // "R$ 4.820,00" em célula de texto não entra em soma — e é para somar que a
    // planilha do relatório existe.
    await downloadSheet("x.xlsx", rows);

    const enviado = aoaToSheet.mock.calls[0][0] as SheetOutput;
    expect(enviado[1][2]).toBe(4820);
    expect(typeof enviado[1][2]).toBe("number");
  });

  it("dimensiona cada coluna pelo maior conteúdo, com folga", async () => {
    await downloadSheet("x.xlsx", [
      ["SKU", "Produto"],
      ["A-1", "Torneira de mesa bica alta"],
    ]);

    // "Torneira de mesa bica alta" tem 26 caracteres → 28 com a folga.
    expect(larguras()[1]).toBe(28);
  });

  it("respeita o piso de largura para o cabeçalho curto não sair cortado", async () => {
    await downloadSheet("x.xlsx", [["Un"], ["pç"]]);

    expect(larguras()[0]).toBe(10);
  });

  it("respeita o teto de largura para uma observação longa não empurrar a planilha", async () => {
    await downloadSheet("x.xlsx", [["Observação"], ["a".repeat(300)]]);

    expect(larguras()[0]).toBe(45);
  });

  it("linha mais curta que as outras não quebra a conta das colunas", async () => {
    await downloadSheet("x.xlsx", [["SKU", "Produto", "Preço"], ["A-1"]]);

    expect(larguras()).toHaveLength(3);
  });

  it("planilha sem linha nenhuma não estoura", async () => {
    await downloadSheet("vazia.xlsx", []);

    expect(larguras()).toEqual([]);
    expect(writeFile).toHaveBeenCalled();
  });

  it("nomeia a aba como pedido", async () => {
    await downloadSheet("x.xlsx", rows, "Clientes");

    expect(bookAppendSheet).toHaveBeenCalledWith(
      workbook,
      worksheet,
      "Clientes"
    );
  });

  it("corta o nome da aba em 31 caracteres — o Excel recusa acima disso", async () => {
    await downloadSheet(
      "x.xlsx",
      rows,
      "Relatório de comissões do mês de setembro"
    );

    const nome = bookAppendSheet.mock.calls[0][2] as string;
    expect(nome).toHaveLength(31);
    expect(nome).toBe("Relatório de comissões do mês d");
  });

  it("sem nome de aba, usa Modelo", async () => {
    await downloadSheet("x.xlsx", rows);

    expect(bookAppendSheet).toHaveBeenCalledWith(workbook, worksheet, "Modelo");
  });
});
