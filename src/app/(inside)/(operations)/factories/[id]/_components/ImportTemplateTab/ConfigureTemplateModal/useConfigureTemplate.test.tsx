import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/** A leitura da planilha no navegador tem testes próprios em utils/import. */
const { readWorkbook, fileToBase64 } = vi.hoisted(() => ({
  readWorkbook: vi.fn(),
  fileToBase64: vi.fn(async () => "BASE64"),
}));

vi.mock("@/utils/file", () => ({ fileToBase64 }));
vi.mock("@/utils/import/reader", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, readWorkbook };
});

import { Toast } from "@/components/Toast";
import {
  CREATE_IMPORT_TEMPLATE_MUTATION,
  EXTRACT_ORDER_FILE_PREVIEW_MUTATION,
  UPDATE_IMPORT_TEMPLATE_MUTATION,
} from "../gql";
import { ImportTemplateNode } from "../interface";
import { useConfigureTemplate } from "./useConfigureTemplate";

const FACTORY = "f1";

const pdfFile = () =>
  new File(["x"], "pedido-modelo.pdf", { type: "application/pdf" });
const sheetFile = () =>
  new File(["x"], "pedido-modelo.xlsx", {
    type: "application/vnd.ms-excel",
  });

const extractMock = (
  recipe: { preset: string; priceIndex: number | null },
  out: { detectedPreset: string | null; items: unknown[] },
  ok = true
) => ({
  request: {
    query: EXTRACT_ORDER_FILE_PREVIEW_MUTATION,
    variables: {
      input: {
        fileName: "pedido-modelo.pdf",
        fileBase64: "BASE64",
        recipe,
      },
    },
  },
  maxUsageCount: 5,
  result: {
    data: {
      extractOrderFile: {
        __typename: "ExtractOrderFileResponse",
        status: ok,
        message: ok ? "ok" : "Não foi possível ler o PDF com este modelo.",
        data: ok
          ? {
              __typename: "ExtractedOrderFile",
              fileType: "PDF",
              detectedPreset: out.detectedPreset,
              items: out.items,
            }
          : null,
      },
    },
  },
});

const item = (sku: string) => ({
  __typename: "ExtractedOrderItem",
  sku,
  name: `Produto ${sku}`,
  quantity: 10,
  unitPrice: "12.50",
  priceOptions: ["12.50", "125.00"],
});

const createMock = (input: Record<string, unknown>, ok = true) => ({
  request: { query: CREATE_IMPORT_TEMPLATE_MUTATION, variables: { input } },
  result: {
    data: {
      createImportTemplate: {
        __typename: "ImportTemplateResponse",
        status: ok,
        message: ok ? "Modelo salvo" : "Fábrica já tem modelo ativo",
        data: ok ? { __typename: "ImportTemplateType", id: "tpl1" } : null,
      },
    },
  },
});

const updateMock = (input: Record<string, unknown>) => ({
  request: {
    query: UPDATE_IMPORT_TEMPLATE_MUTATION,
    variables: { id: "tpl1", input },
  },
  result: {
    data: {
      updateImportTemplate: {
        __typename: "ImportTemplateResponse",
        status: true,
        message: "Modelo salvo",
        data: { __typename: "ImportTemplateType", id: "tpl1" },
      },
    },
  },
});

const wrapper = (mocks: unknown[]) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Toast.ToastProvider>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- mocks do MockLink */}
      <MockedProvider mocks={mocks as any}>{children}</MockedProvider>
    </Toast.ToastProvider>
  );
  return Wrapper;
};

const run = (
  mocks: unknown[] = [],
  current: ImportTemplateNode | null = null
) => {
  const onSaved = vi.fn();
  const { result } = renderHook(
    () => useConfigureTemplate({ factoryId: FACTORY, current, onSaved }),
    { wrapper: wrapper(mocks) }
  );
  return { result, onSaved };
};

beforeEach(() => {
  vi.clearAllMocks();
  fileToBase64.mockResolvedValue("BASE64");
});

describe("useConfigureTemplate — o arquivo de exemplo", () => {
  it("PDF começa em detecção automática", async () => {
    const { result } = run();

    await act(() => result.current.handleFiles([pdfFile()]));

    expect(result.current.isPdf).toBe(true);
    expect(result.current.presetId).toBe("auto");
    expect(result.current.presetOptions[0].value).toBe("auto");
  });

  it("planilha usa mapeamento de colunas e adivinha o cabeçalho", async () => {
    // A leitura é no navegador: nada sobe antes de a pessoa conferir.
    readWorkbook.mockResolvedValue({
      sheets: {
        Pedido: [
          ["Pedido nº 123", "", ""],
          ["Código", "Qtd", "Preço"],
          ["CIM-50", "10", "12,50"],
        ],
      },
      sheetNames: ["Pedido"],
    });
    const { result } = run();

    await act(() => result.current.handleFiles([sheetFile()]));

    await waitFor(() => expect(result.current.sheet).not.toBeNull());
    expect(result.current.isPdf).toBe(false);
    expect(result.current.presetId).toBe("column_mapping");
    expect(result.current.headerIndex).toBe(1);
  });

  it("planilha vazia não deixa a tela com uma grade quebrada", async () => {
    readWorkbook.mockResolvedValue({ sheets: {}, sheetNames: [] });
    const { result } = run();

    await act(() => result.current.handleFiles([sheetFile()]));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.sheet).toBeNull();
    expect(result.current.canPreview).toBe(false);
  });

  it("tirar o arquivo devolve a tela ao começo", async () => {
    const { result } = run();
    await act(() => result.current.handleFiles([pdfFile()]));

    await act(() => result.current.handleFiles([]));

    expect(result.current.sheet).toBeNull();
    expect(result.current.canPreview).toBe(false);
  });
});

describe("useConfigureTemplate — conferir antes de salvar", () => {
  it("o PDF é lido pelo backend e mostra o que reconheceu", async () => {
    const { result } = run([
      extractMock(
        { preset: "auto", priceIndex: 0 },
        { detectedPreset: "prefix_dash", items: [item("CIM-50")] }
      ),
    ]);
    await act(() => result.current.handleFiles([pdfFile()]));

    await act(() => result.current.runPreview());

    await waitFor(() => expect(result.current.preview).toHaveLength(1));
    expect(result.current.detectedLabel).toBe(
      "Código e descrição na mesma linha"
    );
    expect(result.current.canSave).toBe(true);
  });

  it("sem reconhecer o formato, não deixa salvar um modelo cego", async () => {
    const { result } = run([
      extractMock(
        { preset: "auto", priceIndex: 0 },
        { detectedPreset: null, items: [] }
      ),
    ]);
    await act(() => result.current.handleFiles([pdfFile()]));

    await act(() => result.current.runPreview());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.canSave).toBe(false);
  });

  it("trocar qual R$ é o preço refaz a leitura na hora", async () => {
    // O PDF multilinha traz vários valores por item: quem escolhe é a pessoa.
    const { result } = run([
      extractMock(
        { preset: "auto", priceIndex: 0 },
        { detectedPreset: "prefix_dash", items: [item("CIM-50")] }
      ),
      extractMock(
        { preset: "auto", priceIndex: 1 },
        { detectedPreset: "prefix_dash", items: [item("CIM-50")] }
      ),
    ]);
    await act(() => result.current.handleFiles([pdfFile()]));
    await act(() => result.current.runPreview());
    await waitFor(() => expect(result.current.preview).toHaveLength(1));

    await act(() =>
      result.current.onChangePriceIndex({ value: "1", label: "R$ 125,00" })
    );

    await waitFor(() => expect(result.current.priceIndex).toBe(1));
  });
});

describe("useConfigureTemplate — salvar a receita", () => {
  const pdfSalvo = (preset: string, priceIndex: number | null) => ({
    factoryId: FACTORY,
    companyId: null,
    fileType: "PDF",
    parserStrategy: "FIXED_LAYOUT",
    config: { preset, priceIndex },
    sampleFileBase64: "BASE64",
    sampleFileName: "pedido-modelo.pdf",
  });

  it("guarda o formato CONCRETO, nunca o 'automático'", async () => {
    // Salvar "auto" faria a próxima importação redescobrir tudo de novo — e
    // eventualmente escolher outro formato para o mesmo fornecedor.
    const { result, onSaved } = run([
      extractMock(
        { preset: "auto", priceIndex: 0 },
        { detectedPreset: "prefix_dash", items: [item("CIM-50")] }
      ),
      createMock(pdfSalvo("prefix_dash", 0)),
    ]);
    await act(() => result.current.handleFiles([pdfFile()]));
    await act(() => result.current.runPreview());
    await waitFor(() => expect(result.current.canSave).toBe(true));

    await act(() => result.current.handleSave());

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
    expect(result.current.open).toBe(false);
  });

  it("pedido sem preço no PDF salva a receita sem preço", async () => {
    const { result, onSaved } = run([
      extractMock(
        { preset: "auto", priceIndex: 0 },
        { detectedPreset: "prefix_dash", items: [item("CIM-50")] }
      ),
      extractMock(
        { preset: "auto", priceIndex: null },
        { detectedPreset: "prefix_dash", items: [item("CIM-50")] }
      ),
      createMock(pdfSalvo("prefix_dash", null)),
    ]);
    await act(() => result.current.handleFiles([pdfFile()]));
    await act(() => result.current.runPreview());
    await waitFor(() => expect(result.current.preview).toHaveLength(1));

    await act(() =>
      result.current.onChangePriceIndex({ value: "none", label: "Sem preço" })
    );
    await waitFor(() => expect(result.current.priceIndex).toBe("none"));
    await act(() => result.current.handleSave());

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  });

  it("planilha salva o cabeçalho e a coluna de cada campo", async () => {
    readWorkbook.mockResolvedValue({
      sheets: {
        Pedido: [
          ["Código", "Qtd", "Preço"],
          ["CIM-50", "10", "12,50"],
        ],
      },
      sheetNames: ["Pedido"],
    });
    const { result, onSaved } = run([
      createMock({
        factoryId: FACTORY,
        companyId: null,
        fileType: "XLSX",
        parserStrategy: "COLUMN_MAPPING",
        config: {
          preset: "column_mapping",
          headerRow: 0,
          columns: {
            sku: { kind: "column", index: 0 },
            quantity: { kind: "column", index: 1 },
            unitPrice: { kind: "none" },
          },
        },
        sampleFileBase64: "BASE64",
        sampleFileName: "pedido-modelo.xlsx",
      }),
    ]);
    await act(() => result.current.handleFiles([sheetFile()]));
    await waitFor(() => expect(result.current.sheet).not.toBeNull());

    act(() =>
      result.current.setMapping({
        sku: { kind: "column", index: 0 },
        quantity: { kind: "column", index: 1 },
        unitPrice: { kind: "none" },
      })
    );
    await act(() => result.current.runPreview());
    await waitFor(() => expect(result.current.canSave).toBe(true));

    await act(() => result.current.handleSave());

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  });

  it("reconfigurar troca o modelo que já existe, em vez de criar outro", async () => {
    const { result, onSaved } = run(
      [
        extractMock(
          { preset: "auto", priceIndex: 0 },
          { detectedPreset: "prefix_dash", items: [item("CIM-50")] }
        ),
        updateMock({
          fileType: "PDF",
          parserStrategy: "FIXED_LAYOUT",
          config: { preset: "prefix_dash", priceIndex: 0 },
          sampleFileBase64: "BASE64",
          sampleFileName: "pedido-modelo.pdf",
        }),
      ],
      { id: "tpl1" } as ImportTemplateNode
    );
    await act(() => result.current.handleFiles([pdfFile()]));
    await act(() => result.current.runPreview());
    await waitFor(() => expect(result.current.canSave).toBe(true));

    await act(() => result.current.handleSave());

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  });

  it("sem arquivo não há o que salvar", async () => {
    const { result, onSaved } = run([]);

    await act(() => result.current.handleSave());

    expect(onSaved).not.toHaveBeenCalled();
  });
});
