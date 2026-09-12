import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { Toast } from "@/components/Toast";
import { OrderDetail, OrderInstallment, PaymentTermRef } from "../../interface";
import { REVISE_ORDER_INVOICE_MUTATION, UNINVOICE_ORDER_MUTATION } from "./gql";
import { useEditInvoice } from "./useEditInvoice";

const term = (id: string, days: number[]): PaymentTermRef => ({
  id,
  name: days.join("/"),
  installmentsDays: days,
  minOrderAmount: null,
});

const installment = (
  sequence: number,
  extra: Partial<OrderInstallment> = {}
): OrderInstallment => ({
  id: `i${sequence}`,
  sequence,
  amount: "500.00",
  commissionAmount: "15.00",
  dueDate: "2026-10-10",
  status: "PENDING",
  paidAt: null,
  isOverdue: false,
  defaultedAt: null,
  isCommissionReceived: false,
  commissionReceivedAt: null,
  isSellerCommissionPaid: false,
  sellerCommissionPaidAt: null,
  sellerChargebackMonth: null,
  ...extra,
});

const order = (overrides: Partial<OrderDetail> = {}): OrderDetail =>
  ({
    id: "o1",
    invoicedAt: "2026-09-10",
    invoiceNumber: "12345",
    deliveredAt: null,
    deliveryEstimateDays: 15,
    paymentTermId: "t1",
    availablePaymentTerms: [term("t1", [30, 60, 90]), term("t2", [28])],
    installments: [installment(1), installment(2), installment(3)],
    backorderChildren: [],
    ...overrides,
  }) as OrderDetail;

const reviseMock = (input: Record<string, unknown>, id = "o1") => ({
  request: {
    query: REVISE_ORDER_INVOICE_MUTATION,
    variables: { id, input },
  },
  result: {
    data: {
      reviseOrderInvoice: {
        __typename: "OrderResponse",
        status: true,
        message: "Faturamento corrigido.",
        data: {
          __typename: "OrderType",
          id,
          invoicedAt: "2026-09-11",
          deliveredAt: null,
          deliveryEstimateDays: 15,
          paymentTermId: "t1",
        },
      },
    },
  },
});

const uninvoiceMock = (force: boolean) => ({
  request: {
    query: UNINVOICE_ORDER_MUTATION,
    variables: { id: "o1", force },
  },
  result: {
    data: {
      uninvoiceOrder: {
        __typename: "OrderResponse",
        status: true,
        message: "Faturamento desfeito.",
        data: {
          __typename: "OrderType",
          id: "o1",
          status: "CONFIRMED",
          invoicedAt: null,
        },
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

const run = (mocks: unknown[], detail = order()) => {
  const onSuccess = vi.fn();
  const { result } = renderHook(() => useEditInvoice(detail, onSuccess), {
    wrapper: wrapper(mocks),
  });
  return { result, onSuccess };
};

/** O formulário preenchido como a tela o entrega. */
const form = (extra: Record<string, unknown> = {}) => ({
  invoicedAt: "2026-09-11",
  invoiceNumber: "12345",
  paymentTermId: { value: "t1", label: "30/60/90" },
  deliveryEstimateDays: "15",
  deliveredAt: "",
  ...extra,
});

describe("useEditInvoice — corrigir o lançamento", () => {
  it("manda as datas, a nota e o prazo como estão na tela", async () => {
    const { result, onSuccess } = run([
      reviseMock({
        invoicedAt: "2026-09-11",
        invoiceNumber: "12345",
        paymentTermId: "t1",
        deliveryEstimateDays: 15,
      }),
    ]);

    await act(() => result.current.handleSubmit(form()));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
    expect(result.current.open).toBe(false);
  });

  it("campo da nota esvaziado APAGA a nota, em vez de não mexer", async () => {
    // Um nulo sozinho significaria "não mexer": é o `clear` que diz "apague".
    const { result, onSuccess } = run([
      reviseMock({
        invoicedAt: "2026-09-11",
        clearInvoiceNumber: true,
        paymentTermId: "t1",
        deliveryEstimateDays: 15,
      }),
    ]);

    await act(() => result.current.handleSubmit(form({ invoiceNumber: "  " })));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });

  it("sem prazo é à vista — e isso também precisa ser dito", async () => {
    const { result, onSuccess } = run([
      reviseMock({
        invoicedAt: "2026-09-11",
        invoiceNumber: "12345",
        clearPaymentTerm: true,
        deliveryEstimateDays: 15,
      }),
    ]);

    await act(() => result.current.handleSubmit(form({ paymentTermId: null })));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });

  it("previsão de entrega vazia ou zerada apaga a previsão", async () => {
    const { result, onSuccess } = run([
      reviseMock({
        invoicedAt: "2026-09-11",
        invoiceNumber: "12345",
        paymentTermId: "t1",
        clearDeliveryEstimate: true,
      }),
    ]);

    await act(() =>
      result.current.handleSubmit(form({ deliveryEstimateDays: "" }))
    );

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });

  it("sem data de faturamento, nem chega a sair da tela", async () => {
    const { result, onSuccess } = run([]);

    await expect(
      result.current.handleSubmit(form({ invoicedAt: "" }))
    ).rejects.toThrow("Informe a data do faturamento.");
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("a data da entrega só viaja num pedido já entregue", async () => {
    // Informar a data num pedido não entregue é CONFIRMAR a entrega — e é ela
    // que abastece o estoque do cliente, por uma rotina própria.
    const { result, onSuccess } = run(
      [
        reviseMock({
          invoicedAt: "2026-09-11",
          invoiceNumber: "12345",
          paymentTermId: "t1",
          deliveryEstimateDays: 15,
          deliveredAt: "2026-09-20",
        }),
      ],
      order({ deliveredAt: "2026-09-18" })
    );

    await act(() =>
      result.current.handleSubmit(form({ deliveredAt: "2026-09-20" }))
    );

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });

  it("o campo da entrega nem aparece enquanto o pedido não foi entregue", () => {
    const semEntrega = run([]).result;
    const comEntrega = run([], order({ deliveredAt: "2026-09-18" })).result;

    const campos = (r: typeof semEntrega) =>
      r.current.steps[0].sections[0].fields.map((field) => field.name);

    expect(campos(semEntrega)).not.toContain("deliveredAt");
    expect(campos(comEntrega)).toContain("deliveredAt");
  });
});

describe("useEditInvoice — as baixas já lançadas", () => {
  const comBaixas = order({
    installments: [
      installment(1, { paidAt: "2026-10-10", status: "PAID" }),
      installment(2, { isCommissionReceived: true }),
      installment(3),
    ],
  });

  it("trocar por um prazo com OUTRA quantidade de parcelas avisa e força", async () => {
    // Refazer as parcelas do zero derruba as baixas; o aviso já está na tela e
    // o botão diz o que vai acontecer.
    const { result } = run([], comBaixas);

    act(() => {
      const campo = result.current.steps[0].sections[0].fields.find(
        (field) => field.name === "paymentTermId"
      )!;
      campo.onChange?.({ value: "t2", label: "28" }, vi.fn());
    });

    await waitFor(() => expect(result.current.willDropSettlements).toBe(true));
    expect(result.current.settlementSummary).toBe(
      "1 parcela paga e 1 comissão recebida"
    );
  });

  it("mesma quantidade de parcelas preserva o que já foi pago", async () => {
    const { result } = run([], comBaixas);

    expect(result.current.willDropSettlements).toBe(false);
  });

  it("pedido sem baixa nenhuma não tem o que perder", async () => {
    const { result } = run([]);

    act(() => {
      const campo = result.current.steps[0].sections[0].fields.find(
        (field) => field.name === "paymentTermId"
      )!;
      campo.onChange?.({ value: "t2", label: "28" }, vi.fn());
    });

    await waitFor(() => expect(result.current.willDropSettlements).toBe(false));
    expect(result.current.settlementSummary).toBe("");
  });
});

describe("useEditInvoice — desfazer", () => {
  it("desfazer a entrega é um pedido explícito ao backend", async () => {
    const { result, onSuccess } = run([reviseMock({ clearDelivery: true })]);

    await act(() => result.current.undoDelivery());

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });

  it("refazer o faturamento sem baixa não precisa de força", async () => {
    const { result, onSuccess } = run([uninvoiceMock(false)]);

    await act(() => result.current.redoInvoice());

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });

  it("com baixa lançada, refazer o faturamento vai com força", async () => {
    const { result, onSuccess } = run(
      [uninvoiceMock(true)],
      order({
        installments: [
          installment(1, { status: "PAID", paidAt: "2026-10-10" }),
        ],
      })
    );

    await act(() => result.current.redoInvoice());

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });

  it("fechar o modal esquece a ação destrutiva pendente", () => {
    const { result } = run([]);

    act(() => result.current.setPendingAction("redoInvoice"));
    act(() => result.current.handleClose(false));

    expect(result.current.pendingAction).toBeNull();
  });
});
