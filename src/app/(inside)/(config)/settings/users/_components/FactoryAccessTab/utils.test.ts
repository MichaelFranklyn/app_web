import { describe, expect, it } from "vitest";

import { agreementPreview, percentText, sellerAgreementLabel } from "./utils";

/**
 * A prévia do acordo com o vendedor.
 *
 * O campo pergunta a taxa do vendedor sobre o PEDIDO — o número que se combina
 * na rua, e o único percentual que o sistema mostra: falar também em "% da
 * comissão" é o que fazia digitar um no lugar do outro. Percentual sozinho não
 * se confere ("3%" e "30%" ocupam o mesmo espaço na tela): o que denuncia o
 * engano é ver o dinheiro dos dois lados, o do vendedor e o do escritório.
 */
describe("agreementPreview", () => {
  it("mostra quanto cada um leva num pedido de dez mil", () => {
    // Fábrica paga 7% (R$ 700) e o vendedor ganha 3,5% do pedido (R$ 350).
    const preview = agreementPreview(3.5, 7);

    expect(preview.orderAmount).toBe(10000);
    expect(preview.factoryCommission).toBe(700);
    expect(preview.sellerAmount).toBe(350);
    expect(preview.officeAmount).toBe(350);
  });

  it("em branco, o vendedor leva a comissão inteira", () => {
    // Nulo = a comissão da fábrica, seja qual for — é como o sistema se
    // comportava antes do acordo existir.
    const preview = agreementPreview(null, 7);

    expect(preview.sellerAmount).toBe(700);
    expect(preview.officeAmount).toBe(0);
  });

  it("acima da taxa da fábrica, o escritório fica negativo", () => {
    // Não é bloqueado: pode ser um acerto real, e o número negativo é o aviso.
    const preview = agreementPreview(10, 7);

    expect(preview.sellerAmount).toBe(1000);
    expect(preview.officeAmount).toBe(-300);
  });

  it("fábrica sem comissão não divide por zero", () => {
    const preview = agreementPreview(3, 0);

    expect(preview.factoryCommission).toBe(0);
    expect(preview.sellerAmount).toBe(300);
    expect(preview.officeAmount).toBe(-300);
  });
});

describe("sellerAgreementLabel", () => {
  it("resume o acordo da linha da tabela", () => {
    expect(sellerAgreementLabel(3, "Pagamento")).toBe(
      "3% do pedido · no boleto"
    );
    expect(sellerAgreementLabel(null, null)).toBe(
      "comissão inteira · igual à fábrica"
    );
  });
});

describe("percentText", () => {
  it("escreve o percentual com vírgula", () => {
    // O número vai no meio de uma frase em português; "42.9" ali destoa.
    expect(percentText(42.9)).toBe("42,9");
    expect(percentText(50)).toBe("50");
  });
});
