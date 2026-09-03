import { describe, expect, it } from "vitest";

import { agreementPreview, percentText, sellerAgreementLabel } from "./utils";

/**
 * A prévia do acordo com o vendedor.
 *
 * O campo pergunta a fatia DA COMISSÃO e é natural digitar ali a taxa do
 * vendedor sobre o PEDIDO — foi o que aconteceu na carteira real: 3 numa
 * fábrica que paga 7%, e o vendedor virou dono de 0,21% do pedido em vez de
 * ~43% da comissão. O rótulo já avisava; o que faltava era mostrar o dinheiro.
 */
describe("agreementPreview", () => {
  it("mostra quanto cada um leva num pedido de dez mil", () => {
    // Fábrica paga 7% (R$ 700) e o vendedor fica com metade disso.
    const preview = agreementPreview(50, 7);

    expect(preview.orderAmount).toBe(10000);
    expect(preview.factoryCommission).toBe(700);
    expect(preview.sellerAmount).toBe(350);
    expect(preview.officeAmount).toBe(350);
    expect(preview.suggestedShare).toBeNull();
  });

  it("em branco, o vendedor leva a comissão inteira", () => {
    // Nulo = 100%, que é como o sistema se comportava antes do acordo existir.
    const preview = agreementPreview(null, 7);

    expect(preview.sellerAmount).toBe(700);
    expect(preview.officeAmount).toBe(0);
    expect(preview.suggestedShare).toBeNull();
  });

  it("converte quando o número parece ser a taxa sobre o pedido", () => {
    // O caso real: 3 numa fábrica de 7%. R$ 21,00 para o vendedor é o número
    // que denuncia o engano — e 42,9% é o que ele queria ter digitado.
    const preview = agreementPreview(3, 7);

    expect(preview.sellerAmount).toBe(21);
    expect(preview.suggestedShare).toBe(42.9);
  });

  it("uma fatia de verdade não vira sugestão", () => {
    // 40% de comissão é um acordo comum; sugerir conversão aqui seria ruído.
    expect(agreementPreview(40, 7).suggestedShare).toBeNull();
    // No limite (fatia igual à taxa da fábrica) ainda vale suspeitar.
    expect(agreementPreview(7, 7).suggestedShare).toBe(100);
  });

  it("fábrica sem comissão não sugere nada nem divide por zero", () => {
    const preview = agreementPreview(3, 0);

    expect(preview.factoryCommission).toBe(0);
    expect(preview.sellerAmount).toBe(0);
    expect(preview.suggestedShare).toBeNull();
  });
});

describe("sellerAgreementLabel", () => {
  it("resume o acordo da linha da tabela", () => {
    expect(sellerAgreementLabel(50, "Pagamento")).toBe("50% · no boleto");
    expect(sellerAgreementLabel(null, null)).toBe("100% · igual à fábrica");
  });
});

describe("percentText", () => {
  it("escreve o percentual com vírgula", () => {
    // O número vai no meio de uma frase em português; "42.9" ali destoa.
    expect(percentText(42.9)).toBe("42,9");
    expect(percentText(50)).toBe("50");
  });
});
