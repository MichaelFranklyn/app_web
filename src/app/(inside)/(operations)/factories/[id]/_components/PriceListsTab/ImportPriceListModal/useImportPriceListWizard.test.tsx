import { MockLink } from "@apollo/client/testing";
import { MockedProvider } from "@apollo/client/testing/react";
import { act, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  EXTRACT_PRICE_LIST_FILE_MUTATION,
  IMPORT_PRICE_LIST_MUTATION,
  PRODUCT_UNIT_LABELS_QUERY,
  PRODUCT_UNITS_QUERY,
} from "./gql";
import { useImportPriceListWizard } from "./useImportPriceListWizard";

// useToast é chamado pelo wizard, pelo useAsyncAction e pelo sub-hook de modelo.
// Mocamos o módulo → todos compartilham o mesmo spy e conseguimos assertar os
// toasts de sucesso/parcial/erro.
const toastSpy = vi.fn();
vi.mock("@/components/Toast", () => ({
  useToast: () => ({ toast: toastSpy }),
}));

// O wizard lê ?import=price-list e usa router/pathname ao fechar. Sem app router
// nos testes, mocamos next/navigation. `get` → null: o modal começa fechado, o
// que suspende a query de modelo (skip:!open) — mantém o teste enxuto.
const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useSearchParams: () => ({ get: () => null }),
  useRouter: () => ({ replace }),
  usePathname: () => "/factories/f-1",
}));

beforeEach(() => {
  toastSpy.mockClear();
  replace.mockClear();
});

const anyVars = () => true;

// Catálogo de unidades/embalagens: dispara quando a grade é lida (skip:!matrix).
const catalogMocks: MockLink.MockedResponse[] = [
  {
    request: { query: PRODUCT_UNITS_QUERY, variables: anyVars },
    maxUsageCount: 20,
    result: { data: { productUnits: { edges: [] } } },
  },
  {
    request: { query: PRODUCT_UNIT_LABELS_QUERY, variables: anyVars },
    maxUsageCount: 20,
    result: { data: { productUnitLabels: { edges: [] } } },
  },
];

function extractMock(
  data: { rows: string[][]; unreadableRows: string[] | null } | null,
  status = true,
  message = "ok"
) {
  // A seleção da mutation inclui `fileType`; devolvê-lo evita o aviso do Apollo
  // (o hook não usa esse campo, mas o mock precisa espelhar a query).
  const payload = data ? { fileType: "pdf", ...data } : null;
  return {
    request: { query: EXTRACT_PRICE_LIST_FILE_MUTATION, variables: anyVars },
    result: {
      data: { extractPriceListFile: { status, message, data: payload } },
    },
  } as MockLink.MockedResponse;
}

function importMock(
  result: { failed: number; message?: string; extra?: Record<string, unknown> },
  status = true
) {
  const { failed, message = "Importação concluída", extra = {} } = result;
  return {
    request: { query: IMPORT_PRICE_LIST_MUTATION, variables: anyVars },
    result: {
      data: {
        importFactoryPriceList: {
          status,
          message,
          data: {
            listName: "Tabela",
            totalRows: 10,
            tiers: 2,
            productsCreated: 9,
            productsReused: 0,
            pricesSet: 18,
            failed,
            attention: 0,
            errors: [],
            ...extra,
          },
        },
      },
    },
  } as MockLink.MockedResponse;
}

type Api = ReturnType<typeof useImportPriceListWizard>;
let api: Api;
const onImported = vi.fn();

function Harness() {
  api = useImportPriceListWizard({
    companyFactoryId: "cf-1",
    factoryId: "f-1",
    onImported,
  });
  return null;
}

function renderWizard(mocks: MockLink.MockedResponse[]) {
  onImported.mockClear();
  render(
    <MockedProvider mocks={mocks}>
      <Harness />
    </MockedProvider>
  );
}

const pdf = (name: string) =>
  new File(["%PDF-1.4 x"], name, { type: "application/pdf" });

const PDF_GRID = [
  ["CODIGO", "NOME", "UNID VENDA", "VAREJO"],
  ["1", "Torneira", "12", "10,50"],
];

describe("useImportPriceListWizard — máquina de estado", () => {
  it("PDF: extrai a grade, avança para a Leitura (0 → 1), guarda ilegíveis e nomeia a lista", async () => {
    renderWizard([
      extractMock({ rows: PDF_GRID, unreadableRows: ["Linha borrada 999"] }),
      ...catalogMocks,
    ]);

    expect(api.step).toBe(0);
    await act(async () => {
      await api.sheetStep.onFiles([pdf("Tabela Nordeste.pdf")]);
    });

    await waitFor(() => expect(api.step).toBe(1));
    expect(api.readingStep?.unreadable).toEqual(["Linha borrada 999"]);
    // Nome da lista derivado do arquivo (sem a extensão).
    expect(api.detailsStep.listName).toBe("Tabela Nordeste");
    expect(api.readingStep?.sheetName).toBe("PDF");
  });

  it("PDF com status:false: não avança, limpa a grade e avisa o erro", async () => {
    renderWizard([extractMock(null, false, "Não foi possível ler o PDF.")]);

    await act(async () => {
      await api.sheetStep.onFiles([pdf("ruim.pdf")]);
    });

    await waitFor(() =>
      expect(toastSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "error",
          description: "Não foi possível ler o PDF.",
        })
      )
    );
    expect(api.step).toBe(0);
    // Sem grade lida, o bundle da Leitura fica nulo (o modal não renderiza o passo).
    expect(api.readingStep).toBeNull();
  });

  it("importação parcial (failed>0): vai ao Resultado (passo 6) e avisa 'Importação parcial'", async () => {
    renderWizard([
      importMock({
        failed: 2,
        message: "8 de 10 linhas importadas",
        extra: { failed: 2, errors: [{ row: 3, sku: "X", message: "erro" }] },
      }),
    ]);

    await act(async () => {
      await api.handleImport();
    });

    await waitFor(() => expect(api.step).toBe(6));
    expect(api.result).toMatchObject({ failed: 2 });
    expect(onImported).toHaveBeenCalledTimes(1);
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "warning",
        title: "Importação parcial",
        description: "8 de 10 linhas importadas",
      })
    );
  });

  it("importação sem falhas: vai ao Resultado e mostra 'Tabela importada' (success)", async () => {
    renderWizard([importMock({ failed: 0, message: "10 linhas importadas" })]);

    await act(async () => {
      await api.handleImport();
    });

    await waitFor(() => expect(api.step).toBe(6));
    expect(api.result).toMatchObject({ failed: 0 });
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "success", title: "Tabela importada" })
    );
  });

  it("importação com status:false: não avança e reporta erro", async () => {
    renderWizard([importMock({ failed: 0 }, false)]);

    await act(async () => {
      await api.handleImport();
    });

    await waitFor(() =>
      expect(toastSpy).toHaveBeenCalledWith(
        expect.objectContaining({ variant: "error" })
      )
    );
    expect(api.step).not.toBe(6);
    expect(api.result).toBeNull();
  });
});
