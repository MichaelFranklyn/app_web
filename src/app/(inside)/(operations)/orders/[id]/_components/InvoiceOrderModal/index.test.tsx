import { Toast } from "@/components/Toast";
import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getTodayIso } from "@/utils/format/date";
import { INVOICE_ORDER_MUTATION, ORDER_ITEMS_QUERY } from "../../gql";
import { OrderDetail } from "../../interface";
import { InvoiceOrderModal } from "./index";

const { invalidateClient } = vi.hoisted(() => ({ invalidateClient: vi.fn() }));
vi.mock("@/hooks/useInvalidateQueries", () => ({
  useInvalidateQueriesClient: () => invalidateClient,
}));

/**
 * Faturar é o marco que gera as parcelas e libera a comissão — e o que sai
 * daqui não se desfaz sozinho. Os casos prendem o PAYLOAD: a data, o número da
 * nota (em branco é nulo, não string vazia), o prazo obrigatório quando a
 * comissão é por pagamento, e o destino do que a fábrica não faturou.
 */
const ORDER_ID = "order-1";

const prazo = (id: string, name: string, dias: number[]) => ({
  id,
  name,
  installmentsDays: dias,
  __typename: "PaymentTermType",
});

const pedido = (overrides: Partial<OrderDetail> = {}): OrderDetail =>
  ({
    id: ORDER_ID,
    invoiceNumber: null,
    paymentTermId: null,
    commissionCalcBasis: "FATURAMENTO",
    availablePaymentTerms: [prazo("pt-1", "30/60", [30, 60])],
    ...overrides,
  }) as unknown as OrderDetail;

const item = (id: string, quantity: string, name: string) => ({
  __typename: "OrderItemType",
  id,
  quantity,
  unitsTotal: quantity,
  unitPrice: "100.00",
  discount: "0",
  subtotal: "100.00",
  ipiRate: "0",
  ipiAmount: "0",
  taxAmount: "0",
  unitPriceWithTax: "100.00",
  isPromo: false,
  source: "MANUAL",
  createdAt: "2026-08-01T00:00:00Z",
  product: {
    __typename: "ProductType",
    id: `p-${id}`,
    name,
    sku: `SKU-${id}`,
    imageUrl: null,
    saleMultiple: 1,
    unitPerPack: 1,
    taxes: [],
  },
  tier: null,
});

const itemsMock = (nodes: ReturnType<typeof item>[]) => ({
  request: { query: ORDER_ITEMS_QUERY, variables: { orderId: ORDER_ID } },
  result: {
    data: {
      orderItems: {
        __typename: "OrderItemTypeConnection",
        edges: nodes.map((node) => ({
          __typename: "OrderItemTypeEdge",
          node,
        })),
        totalCount: nodes.length,
      },
    },
  },
  maxUsageCount: 5,
});

/** Espião do input da mutation — é ele que o teste afirma. */
const enviados: Record<string, unknown>[] = [];

const invoiceMock = (backorderChildren: { id: string }[] = []) => ({
  // No Apollo 4 o casador de variáveis é a própria `variables`, em função: é
  // por ele que o teste captura o payload enviado.
  request: {
    query: INVOICE_ORDER_MUTATION,
    variables: (variables: Record<string, unknown>) => {
      enviados.push(variables);
      return true;
    },
  },
  result: {
    data: {
      invoiceOrder: {
        __typename: "InvoiceOrderResponse",
        status: true,
        message: "ok",
        data: {
          __typename: "OrderType",
          id: ORDER_ID,
          status: "INVOICED",
          invoicedAt: getTodayIso(),
          invoiceNumber: "12345",
          backorderChildren: backorderChildren.map((child) => ({
            __typename: "OrderType",
            ...child,
          })),
        },
      },
    },
  },
  maxUsageCount: 5,
});

const renderizar = (
  order: OrderDetail = pedido(),
  mocks: unknown[] = [itemsMock([]), invoiceMock()]
) =>
  render(
    <Toast.ToastProvider>
      <MockedProvider mocks={mocks as never}>
        <InvoiceOrderModal order={order} onSuccess={vi.fn()} />
      </MockedProvider>
    </Toast.ToastProvider>
  );

const abrir = async () => {
  await userEvent.click(
    screen.getByRole("button", { name: /faturar pedido/i })
  );
  return screen.getByRole("dialog");
};

const faturar = () =>
  userEvent.click(screen.getByRole("button", { name: /^faturar$/i }));

const entrada = () => enviados.at(-1)?.input as Record<string, unknown>;

beforeEach(() => {
  enviados.length = 0;
  invalidateClient.mockReset();
});

describe("InvoiceOrderModal", () => {
  it("o gatilho diz o que a ação significa", async () => {
    renderizar();

    const dialog = await abrir();

    expect(dialog).toHaveTextContent("Faturar pedido");
    expect(dialog).toHaveTextContent("É o marco que libera a comissão");
  });

  it("fatura com a data de hoje já preenchida", async () => {
    renderizar();
    await abrir();

    await faturar();

    await waitFor(() => expect(enviados).toHaveLength(1));
    expect(enviados[0]).toMatchObject({ id: ORDER_ID });
    expect(entrada().invoicedAt).toBe(getTodayIso());
  });

  it("número da nota em branco vai como NULO, não string vazia", async () => {
    // É o mesmo estado de quem faturou antes de a nota chegar — e é por esse
    // número que a planilha de comissão da fábrica encontra o pedido depois.
    renderizar();
    await abrir();

    await faturar();

    await waitFor(() => expect(enviados).toHaveLength(1));
    expect(entrada().invoiceNumber).toBeNull();
  });

  it("número da nota preenchido vai aparado", async () => {
    renderizar();
    const dialog = await abrir();

    await userEvent.type(
      dialog.querySelector('input[name="invoiceNumber"]')!,
      "  12345  "
    );
    await faturar();

    await waitFor(() => expect(enviados).toHaveLength(1));
    expect(entrada().invoiceNumber).toBe("12345");
  });

  it("comissão por FATURAMENTO fatura sem prazo — é à vista", async () => {
    renderizar(pedido({ commissionCalcBasis: "FATURAMENTO" }));
    await abrir();

    await faturar();

    await waitFor(() => expect(enviados).toHaveLength(1));
    expect(entrada().paymentTermId).toBeNull();
  });

  it("comissão por PAGAMENTO exige prazo e não vai à rede sem ele", async () => {
    // A comissão é liberada por parcela paga: sem prazo não há parcela. O
    // próprio formulário cobra o campo, antes de chegar ao envio.
    renderizar(pedido({ commissionCalcBasis: "PAGAMENTO" }));
    await abrir();

    await faturar();

    expect(
      await screen.findByText("Prazo de pagamento é obrigatório")
    ).toBeInTheDocument();
    expect(enviados).toHaveLength(0);
  });

  it("sucesso avisa que as parcelas foram geradas e invalida as listas", async () => {
    // Faturar muda o status, a data da compra e pode criar backorder: as listas
    // e os KPIs ficam velhos se só o detalhe recarregar.
    renderizar();
    await abrir();

    await faturar();

    expect(
      await screen.findByText("Pedido faturado. Parcelas geradas.")
    ).toBeInTheDocument();
    await waitFor(() => expect(invalidateClient).toHaveBeenCalled());
  });

  it("com backorder, o aviso é outro: a sobra virou pedido novo", async () => {
    renderizar(pedido(), [itemsMock([]), invoiceMock([{ id: "order-2" }])]);
    await abrir();

    await faturar();

    expect(
      await screen.findByText(
        "Faturado parcial. O restante virou um novo pedido (backorder)."
      )
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Pedido de backorder criado")
    ).toBeInTheDocument();
  });
});

describe("InvoiceOrderModal — faturamento parcial", () => {
  const itens = [item("i1", "10", "Torneira"), item("i2", "5", "Sifão")];

  it("o padrão é 'faturou tudo': sem itens no payload", async () => {
    renderizar(pedido(), [itemsMock(itens), invoiceMock()]);
    await abrir();

    expect(
      await screen.findByLabelText("A fábrica faturou o pedido inteiro")
    ).toBeChecked();

    await faturar();

    await waitFor(() => expect(enviados).toHaveLength(1));
    expect(entrada()).not.toHaveProperty("items");
  });

  it("desligando o interruptor, lista os itens com a quantidade pedida", async () => {
    renderizar(pedido(), [itemsMock(itens), invoiceMock()]);
    await abrir();

    await userEvent.click(
      await screen.findByLabelText("A fábrica faturou o pedido inteiro")
    );

    expect(screen.getByText("Torneira")).toBeInTheDocument();
    expect(screen.getByText("Código SKU-i1")).toBeInTheDocument();
    expect(screen.getByText(/Pedido: 10 un/)).toBeInTheDocument();
  });

  it("reduzindo a quantidade, mostra o que falta e manda os itens", async () => {
    renderizar(pedido(), [itemsMock(itens), invoiceMock([{ id: "order-2" }])]);
    await abrir();

    await userEvent.click(
      await screen.findByLabelText("A fábrica faturou o pedido inteiro")
    );

    const campos = screen.getAllByRole("spinbutton");
    await userEvent.clear(campos[0]!);
    await userEvent.type(campos[0]!, "6");

    expect(screen.getByText(/faltam 4/)).toBeInTheDocument();

    await faturar();

    await waitFor(() => expect(enviados).toHaveLength(1));
    expect(entrada().items).toEqual([
      { orderItemId: "i1", invoicedQuantity: "6" },
      { orderItemId: "i2", invoicedQuantity: "5" },
    ]);
    // O padrão é não perder nada: a sobra vira pedido novo.
    expect(entrada().cancelRemainder).toBe(false);
  });

  it("escolhendo cancelar o saldo, avisa o backend", async () => {
    renderizar(pedido(), [itemsMock(itens), invoiceMock()]);
    await abrir();

    await userEvent.click(
      await screen.findByLabelText("A fábrica faturou o pedido inteiro")
    );

    const campos = screen.getAllByRole("spinbutton");
    await userEvent.clear(campos[0]!);
    await userEvent.type(campos[0]!, "6");

    await userEvent.click(screen.getByLabelText(/Cancelar o saldo/));
    await faturar();

    await waitFor(() => expect(enviados).toHaveLength(1));
    expect(entrada().cancelRemainder).toBe(true);
  });

  it("sem sobra nenhuma, a escolha do destino nem aparece", async () => {
    renderizar(pedido(), [itemsMock(itens), invoiceMock()]);
    await abrir();

    await userEvent.click(
      await screen.findByLabelText("A fábrica faturou o pedido inteiro")
    );

    expect(
      screen.queryByText("O que fazer com o que faltou?")
    ).not.toBeInTheDocument();
  });
});
