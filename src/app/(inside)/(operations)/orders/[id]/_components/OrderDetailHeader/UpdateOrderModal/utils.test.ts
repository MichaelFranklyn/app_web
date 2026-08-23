import { describe, expect, it } from "vitest";

import { PaymentTermRef } from "../../../interface";
import { paymentTermLabel } from "../../../utils";
import { buildUpdateOrderSteps, normalizeUpdateInput } from "./utils";

const TERM_30_60: PaymentTermRef = {
  id: "term-1",
  name: "A prazo",
  installmentsDays: [30, 60],
  minOrderAmount: null,
};
const TERM_AVISTA: PaymentTermRef = {
  id: "term-2",
  name: "À vista",
  installmentsDays: [],
  minOrderAmount: null,
};
const TERMS = [TERM_30_60, TERM_AVISTA];

const fieldsOf = (status: Parameters<typeof buildUpdateOrderSteps>[0]) =>
  buildUpdateOrderSteps(status, TERMS)[0].sections[0].fields;

const paymentField = (status: Parameters<typeof buildUpdateOrderSteps>[0]) =>
  fieldsOf(status).find((field) => field.name === "paymentTermId")!;

describe("paymentTermLabel", () => {
  it("mostra só o prazo, não o apelido da condição", () => {
    // Quem lê (vendedor na tela, cliente no PDF) quer "30/60 dias"; o nome
    // interno da condição não acrescenta nada.
    expect(paymentTermLabel(TERM_30_60)).toBe("30/60 dias");
  });

  it("sem dias cadastrados, o nome É o prazo", () => {
    expect(paymentTermLabel(TERM_AVISTA)).toBe("À vista");
  });

  it("sem condição, devolve travessão", () => {
    expect(paymentTermLabel(null)).toBe("—");
  });
});

describe("campo de condição de pagamento", () => {
  it("é editável enquanto o pedido não foi faturado", () => {
    const field = paymentField("CONFIRMED");
    expect(field.disabled).toBe(false);
    expect(field).toHaveProperty("options", [
      { value: "term-1", label: "30/60 dias" },
      { value: "term-2", label: "À vista" },
    ]);
  });

  it("trava depois de faturado e explica por quê", () => {
    // As parcelas nascem no faturamento: trocar a condição depois exibiria um
    // prazo que não corresponde ao que foi de fato cobrado do cliente.
    const field = paymentField("INVOICED");
    expect(field.disabled).toBe(true);
    expect(String(field.hint)).toMatch(/já foi faturado/);
  });

  it("também trava quando já foi entregue", () => {
    expect(paymentField("DELIVERED").disabled).toBe(true);
  });

  it("sem condições cadastradas, explica onde cadastrar", () => {
    // Um select vazio e mudo é lido como defeito — o campo precisa dizer o
    // que falta e onde resolver.
    const field = buildUpdateOrderSteps(
      "CONFIRMED",
      []
    )[0].sections[0].fields.find((item) => item.name === "paymentTermId")!;
    expect(field.disabled).toBe(true);
    expect(String(field.hint)).toMatch(/Fábricas/);
  });
});

describe("normalizeUpdateInput — condição de pagamento", () => {
  const base = {
    status: { value: "CONFIRMED" },
    notes: "",
    freightType: null,
    deliveryEstimateDays: "",
  };

  it("envia o novo prazo quando muda", () => {
    const out = normalizeUpdateInput(
      { ...base, paymentTermId: { value: "term-2" } },
      null,
      null,
      "CONFIRMED",
      null,
      "term-1"
    );
    expect(out.paymentTermId).toBe("term-2");
  });

  it("não envia nada quando o prazo é o mesmo", () => {
    const out = normalizeUpdateInput(
      { ...base, paymentTermId: { value: "term-1" } },
      null,
      null,
      "CONFIRMED",
      null,
      "term-1"
    );
    expect(out).not.toHaveProperty("paymentTermId");
  });

  it("ignora o campo em pedido faturado, mesmo se vier preenchido", () => {
    const out = normalizeUpdateInput(
      { ...base, paymentTermId: { value: "term-2" } },
      null,
      null,
      "INVOICED",
      null,
      "term-1"
    );
    expect(out).not.toHaveProperty("paymentTermId");
  });
});

describe("normalizeUpdateInput — cobertura estimada do pedido", () => {
  const base = {
    status: { value: "CONFIRMED" },
    notes: "",
    freightType: null,
    deliveryEstimateDays: "",
    paymentTermId: null,
  };

  const run = (over: Record<string, unknown>, current: number | null = null) =>
    normalizeUpdateInput(
      { ...base, ...over },
      null,
      null,
      "CONFIRMED",
      null,
      null,
      current
    );

  it("grava a estimativa do vendedor", () => {
    expect(run({ coverageDays: "30" }).coverageDays).toBe(30);
  });

  it("campo vazio é resposta legítima e limpa o valor", () => {
    // "não sei dizer" é melhor que um chute virar dado: a cadência cai na
    // recorrência dos pedidos, que é medição.
    expect(run({ coverageDays: "" }, 30).coverageDays).toBeNull();
  });

  it("não manda o campo quando nada mudou", () => {
    expect("coverageDays" in run({ coverageDays: "30" }, 30)).toBe(false);
  });

  it("zero e negativo não são cobertura", () => {
    expect(run({ coverageDays: "0" }, 30).coverageDays).toBeNull();
    expect(run({ coverageDays: "-5" }, 30).coverageDays).toBeNull();
  });

  it("arredonda decimal digitado por engano", () => {
    expect(run({ coverageDays: "30.4" }).coverageDays).toBe(30);
  });
});

describe("normalizeUpdateInput — data do pedido", () => {
  const base = {
    status: { value: "CONFIRMED" },
    notes: "",
    freightType: null,
    deliveryEstimateDays: "",
    paymentTermId: null,
  };

  const run = (
    over: Record<string, unknown>,
    current: string | null,
    status: Parameters<typeof buildUpdateOrderSteps>[0] = "CONFIRMED"
  ) =>
    normalizeUpdateInput(
      { ...base, ...over },
      null,
      null,
      status,
      null,
      null,
      null,
      current
    );

  it("envia a data corrigida", () => {
    // O caso real: pedido-filho de faturamento parcial nascido com a data
    // errada, corrigido para o dia em que a fábrica faturou.
    const out = run({ orderDate: "2026-08-05" }, "2026-08-22");
    expect(out.orderDate).toBe("2026-08-05");
  });

  it("não envia nada quando a data é a mesma", () => {
    const out = run({ orderDate: "2026-08-05" }, "2026-08-05");
    expect(out).not.toHaveProperty("orderDate");
  });

  it("aceita Date do calendário e normaliza para ISO", () => {
    // O campo date do FormBuilder devolve Date; `.slice` numa Date não presta.
    const out = run({ orderDate: new Date(2026, 7, 5) }, "2026-08-22");
    expect(out.orderDate).toBe("2026-08-05");
  });

  it("campo vazio não apaga a data", () => {
    const out = run({ orderDate: "" }, "2026-08-22");
    expect(out).not.toHaveProperty("orderDate");
  });

  it("ignora o campo em pedido faturado", () => {
    // A data já entrou nas parcelas e na comissão — correção é por
    // Revisar faturamento, e o backend também recusa.
    const out = run({ orderDate: "2026-08-05" }, "2026-08-22", "INVOICED");
    expect(out).not.toHaveProperty("orderDate");
  });
});

describe("buildUpdateOrderSteps — campo de data", () => {
  const orderDateField = (
    status: Parameters<typeof buildUpdateOrderSteps>[0]
  ) => fieldsOf(status).find((field) => field.name === "orderDate")!;

  it("existe e é editável no pedido não faturado", () => {
    expect(orderDateField("CONFIRMED").disabled).toBe(false);
  });

  it("fica travado depois de faturado", () => {
    expect(orderDateField("INVOICED").disabled).toBe(true);
    expect(orderDateField("DELIVERED").disabled).toBe(true);
  });
});
