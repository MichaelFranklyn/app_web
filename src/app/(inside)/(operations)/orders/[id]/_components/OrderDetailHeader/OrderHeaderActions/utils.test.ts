import { describe, expect, it } from "vitest";

import { availableActions, pickPrimaryAction } from "./utils";

const confirmed = { status: "CONFIRMED" };

describe("pickPrimaryAction", () => {
  it("orçamento: converter em pedido", () => {
    expect(pickPrimaryAction({ status: "DRAFT" })).toBe("convert");
    expect(pickPrimaryAction({ status: "SENT" })).toBe("convert");
  });

  it("confirmado e não enviado: enviar à fábrica", () => {
    expect(pickPrimaryAction(confirmed)).toBe("send");
  });

  it("enviado e não faturado: faturar", () => {
    expect(pickPrimaryAction({ ...confirmed, sentAt: "2026-11-01" })).toBe(
      "invoice"
    );
  });

  it("faturado e não entregue: confirmar entrega", () => {
    expect(pickPrimaryAction({ ...confirmed, invoicedAt: "2026-11-02" })).toBe(
      "deliver"
    );
  });

  it("entregue ou cancelado: nenhum primário", () => {
    expect(
      pickPrimaryAction({
        status: "DELIVERED",
        invoicedAt: "2026-11-02",
        deliveredAt: "2026-11-05",
      })
    ).toBeNull();
    expect(pickPrimaryAction({ status: "CANCELLED" })).toBeNull();
  });
});

describe("availableActions", () => {
  it("faturado não cancela nem reenvia; corrige o faturamento", () => {
    const can = availableActions({ ...confirmed, invoicedAt: "2026-11-02" });
    expect(can.cancel).toBe(false);
    expect(can.send).toBe(false);
    expect(can.editInvoice).toBe(true);
  });

  it("cancelado não agenda retorno nem fatura", () => {
    const can = availableActions({ status: "CANCELLED" });
    expect(can.scheduleReturn).toBe(false);
    expect(can.invoice).toBe(false);
    expect(can.cancel).toBe(false);
  });
});
