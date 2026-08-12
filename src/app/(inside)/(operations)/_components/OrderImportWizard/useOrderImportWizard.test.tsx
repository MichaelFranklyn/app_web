import { MockLink } from "@apollo/client/testing";
import { MockedProvider } from "@apollo/client/testing/react";
import { act, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  CONFIRM_ORDER_IMPORT_MUTATION,
  EXTRACT_ORDER_FILE_MUTATION,
  PREVIEW_ORDER_IMPORT_MUTATION,
} from "./gql";
import { useOrderImportWizard } from "./useOrderImportWizard";

// useToast lança fora de um Provider e é chamado tanto pelo wizard quanto pelo
// useAsyncAction. Mocamos o módulo → ambos recebem o mesmo spy, e conseguimos
// assertar variant/title/description de cada toast (sucesso, parcial, erro).
const toastSpy = vi.fn();
vi.mock("@/components/Toast", () => ({
  useToast: () => ({ toast: toastSpy }),
}));

// O wizard termina indo para a página do pedido (useRedirectTransition → router).
// O mock global do setup devolve um push novo a cada render, que não dá para
// assertar; aqui fixamos o spy. Precedência: vi.mock local vence o global.
const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/orders",
  useSearchParams: () => new URLSearchParams(),
}));

beforeEach(() => {
  toastSpy.mockClear();
  push.mockClear();
});

/** Candidato de preview "casado" (SKU→produto/nível/preço), pronto p/ incluir. */
function matchedCandidate(overrides: Record<string, unknown> = {}) {
  return {
    rowIndex: 1,
    rawSku: "SKU-001",
    rawName: "Produto Teste",
    quantity: "10",
    matched: true,
    productId: "p-1",
    productName: "Produto Teste",
    tierId: "t-1",
    tierName: "Varejo",
    unitPrice: "100.00",
    confidence: "100",
    message: null,
    tierOptions: [{ tierId: "t-1", tierName: "Varejo", unitPrice: "100.00" }],
    ...overrides,
  };
}

// Nesta versão do Apollo (v4), o matcher de variáveis vai em `request.variables`
// (uma função `(variables) => boolean`). Aceitamos quaisquer variables — o
// payload exato é assertado à parte, via captura no confirmMock.
const anyVars = () => true;

/** Mock que aceita quaisquer variables (o payload exato é assertado à parte). */
function extractItemsMock(items: unknown[]) {
  return {
    request: { query: EXTRACT_ORDER_FILE_MUTATION, variables: anyVars },
    result: {
      data: {
        extractOrderFile: {
          status: true,
          message: "ok",
          data: { fileType: "pdf", rows: [], items },
        },
      },
    },
  } as MockLink.MockedResponse;
}

function extractErrorMock(message: string) {
  return {
    request: { query: EXTRACT_ORDER_FILE_MUTATION, variables: anyVars },
    result: {
      data: { extractOrderFile: { status: false, message, data: null } },
    },
  } as MockLink.MockedResponse;
}

function previewMock(candidates: unknown[]) {
  return {
    request: { query: PREVIEW_ORDER_IMPORT_MUTATION, variables: anyVars },
    result: {
      data: {
        previewOrderImport: {
          status: true,
          message: "ok",
          data: {
            matchedCount: candidates.length,
            unmatchedCount: 0,
            candidates,
          },
        },
      },
    },
  } as MockLink.MockedResponse;
}

function previewErrorMock(message: string) {
  return {
    request: { query: PREVIEW_ORDER_IMPORT_MUTATION, variables: anyVars },
    result: {
      data: { previewOrderImport: { status: false, message, data: null } },
    },
  } as MockLink.MockedResponse;
}

/**
 * Mock de confirm que captura as variables enviadas (para assertar o mapeamento
 * reviewRow → item) e devolve o resultado informado (sucesso ou parcial).
 */
function confirmMock(
  result: { created: number; failed: number; errors?: unknown[] },
  capture?: { variables?: Record<string, unknown> }
) {
  return {
    request: {
      query: CONFIRM_ORDER_IMPORT_MUTATION,
      variables: (variables: Record<string, unknown>) => {
        if (capture) capture.variables = variables;
        return true;
      },
    },
    result: {
      data: {
        confirmOrderImport: {
          status: true,
          message: "ok",
          data: { errors: [], ...result },
        },
      },
    },
  } as MockLink.MockedResponse;
}

// Captura a API do hook para dirigir as transições nos testes.
type Api = ReturnType<typeof useOrderImportWizard>;
let api: Api;
const onImported = vi.fn();

function Harness() {
  api = useOrderImportWizard({ orderId: "order-1", onImported });
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

/** Sobe um "PDF" (só o nome importa — o extract é mockado). */
const pdf = () =>
  new File(["%PDF-1.4 conteúdo"], "pedido.pdf", { type: "application/pdf" });

async function uploadPdf() {
  await act(async () => {
    await api.handleFiles([pdf()]);
  });
}

describe("useOrderImportWizard — máquina de estado", () => {
  it("PDF com itens: pula o mapeamento e auto-avança para a revisão (0 → 2)", async () => {
    renderWizard([
      extractItemsMock([
        {
          sku: "SKU-001",
          name: "Produto Teste",
          quantity: "10",
          unitPrice: "100.00",
        },
      ]),
      previewMock([matchedCandidate()]),
    ]);

    expect(api.step).toBe(0);
    await uploadPdf();

    await waitFor(() => expect(api.step).toBe(2));
    expect(api.reviewRows).toHaveLength(1);
    expect(api.reviewRows[0].include).toBe(true);
    expect(api.confirmableCount).toBe(1);
  });

  it("confirma os itens: avança para o resultado, chama onImported e mostra sucesso", async () => {
    const captured: { variables?: Record<string, unknown> } = {};
    renderWizard([
      extractItemsMock([
        {
          sku: "SKU-001",
          name: "Produto Teste",
          quantity: "10",
          unitPrice: "100.00",
        },
      ]),
      previewMock([matchedCandidate()]),
      confirmMock({ created: 1, failed: 0 }, captured),
    ]);

    await uploadPdf();
    await waitFor(() => expect(api.step).toBe(2));

    await act(async () => {
      await api.runConfirm();
    });

    await waitFor(() => expect(api.step).toBe(3));
    expect(api.result).toEqual({ created: 1, failed: 0, errors: [] });
    expect(onImported).toHaveBeenCalledTimes(1);
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "success", title: "Itens importados" })
    );
    // Detalhe do pedido: já estamos na página dele → nada de navegar.
    expect(push).not.toHaveBeenCalled();
    expect(api.viewOrder).toBeNull();

    // O reviewRow vira exatamente 1 item no payload do confirm.
    const items = (
      captured.variables?.input as { items: Record<string, unknown>[] }
    ).items;
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      productId: "p-1",
      tierId: "t-1",
      quantity: 10,
      unitPrice: 100,
      discount: 0,
      sku: "SKU-001",
    });
  });

  it("erro parcial de confirmOrderImport: resultado com failed>0 dispara aviso 'Importação parcial'", async () => {
    renderWizard([
      extractItemsMock([
        {
          sku: "SKU-001",
          name: "Produto Teste",
          quantity: "10",
          unitPrice: "100.00",
        },
      ]),
      previewMock([matchedCandidate()]),
      confirmMock({
        created: 1,
        failed: 1,
        errors: [{ index: 2, sku: "SKU-999", message: "SKU inválido" }],
      }),
    ]);

    await uploadPdf();
    await waitFor(() => expect(api.step).toBe(2));

    await act(async () => {
      await api.runConfirm();
    });

    await waitFor(() => expect(api.step).toBe(3));
    expect(api.result).toMatchObject({ created: 1, failed: 1 });
    expect(api.result?.errors).toHaveLength(1);
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "warning",
        title: "Importação parcial",
      })
    );
    // Mesmo parcial, o pedido foi tocado → a lista precisa recarregar.
    expect(onImported).toHaveBeenCalledTimes(1);
  });

  it("extract com status:false reseta o arquivo e não sai do passo inicial", async () => {
    renderWizard([extractErrorMock("Não foi possível ler o PDF.")]);

    await uploadPdf();

    await waitFor(() =>
      expect(toastSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "error",
          description: "Não foi possível ler o PDF.",
        })
      )
    );
    expect(api.step).toBe(0);
    expect(api.matrix).toBeNull();
    expect(api.file).toEqual([]);
    expect(api.reviewRows).toEqual([]);
  });

  it("preview com status:false não abre a revisão e avisa o erro", async () => {
    renderWizard([
      extractItemsMock([
        {
          sku: "SKU-001",
          name: "Produto Teste",
          quantity: "10",
          unitPrice: "100.00",
        },
      ]),
      previewErrorMock("Erro ao pré-visualizar a importação."),
    ]);

    await uploadPdf();

    await waitFor(() =>
      expect(toastSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "error",
          description: "Erro ao pré-visualizar a importação.",
        })
      )
    );
    expect(api.step).toBe(0);
    expect(api.reviewRows).toEqual([]);
  });

  /** Renderiza o wizard no fluxo em que o pedido só nasce na confirmação. */
  function renderDeferred(
    mocks: MockLink.MockedResponse[],
    createOrder: () => Promise<string>
  ) {
    function DeferredHarness() {
      api = useOrderImportWizard({
        deferred: { factoryId: "fac-1", clientId: "cli-1", createOrder },
        onImported,
      });
      return null;
    }
    onImported.mockClear();
    render(
      <MockedProvider mocks={mocks}>
        <DeferredHarness />
      </MockedProvider>
    );
  }

  const oneItem = () =>
    extractItemsMock([
      {
        sku: "SKU-001",
        name: "Produto Teste",
        quantity: "10",
        unitPrice: "100.00",
      },
    ]);

  it("pedido adiado (deferred): nada é criado até a confirmação, que usa o id devolvido", async () => {
    const createOrder = vi.fn(async () => "order-deferred-1");
    const captured: { variables?: Record<string, unknown> } = {};
    renderDeferred(
      [
        oneItem(),
        previewMock([matchedCandidate()]),
        confirmMock({ created: 1, failed: 0 }, captured),
      ],
      createOrder
    );

    await uploadPdf();
    await waitFor(() => expect(api.step).toBe(2));
    // Upload + revisão NÃO criam o pedido.
    expect(createOrder).not.toHaveBeenCalled();

    await act(async () => {
      await api.runConfirm();
    });

    await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(1));
    expect((captured.variables?.input as { orderId: string }).orderId).toBe(
      "order-deferred-1"
    );
    expect(onImported).toHaveBeenCalledTimes(1);
  });

  it("importação limpa fora do detalhe: vai para a página do pedido criado", async () => {
    renderDeferred(
      [
        oneItem(),
        previewMock([matchedCandidate()]),
        confirmMock({ created: 1, failed: 0 }),
      ],
      async () => "order-deferred-1"
    );

    await uploadPdf();
    await waitFor(() => expect(api.step).toBe(2));

    await act(async () => {
      await api.runConfirm();
    });

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith("/orders/order-deferred-1")
    );
    // Redireciona em vez de parar no passo de resultado — o usuário cai no pedido.
    expect(api.step).toBe(2);
    expect(api.result).toBeNull();
  });

  it("item que falhou ao gravar: para no resultado e oferece 'ver pedido'", async () => {
    renderDeferred(
      [
        oneItem(),
        previewMock([matchedCandidate()]),
        confirmMock({
          created: 0,
          failed: 1,
          errors: [{ index: 1, sku: "SKU-001", message: "SKU inválido" }],
        }),
      ],
      async () => "order-deferred-2"
    );

    await uploadPdf();
    await waitFor(() => expect(api.step).toBe(2));

    await act(async () => {
      await api.runConfirm();
    });

    // A lista de erros por linha só existe no resultado: não navega sozinho.
    await waitFor(() => expect(api.step).toBe(3));
    expect(push).not.toHaveBeenCalled();
    expect(api.viewOrder).not.toBeNull();

    act(() => api.viewOrder?.());
    expect(push).toHaveBeenCalledWith("/orders/order-deferred-2");
  });

  it("confirmableCount ignora candidatos não casados e sem nível", async () => {
    renderWizard([
      extractItemsMock([
        {
          sku: "SKU-001",
          name: "Produto Teste",
          quantity: "10",
          unitPrice: "100.00",
        },
        { sku: "SKU-XXX", name: null, quantity: "5", unitPrice: null },
      ]),
      previewMock([
        matchedCandidate(),
        matchedCandidate({
          rowIndex: 2,
          rawSku: "SKU-XXX",
          matched: false,
          productId: null,
          tierId: null,
          tierName: null,
          confidence: "0",
        }),
      ]),
    ]);

    await uploadPdf();
    await waitFor(() => expect(api.step).toBe(2));

    expect(api.reviewRows).toHaveLength(2);
    // Só o casado (com produto + nível) conta como confirmável.
    expect(api.confirmableCount).toBe(1);
    expect(api.reviewRows[1].include).toBe(false);
  });
});
