import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PortalInstallment } from "../../../../interface";
import { PortalOrderInstallments } from "./index";

const parcela = (
  overrides: Partial<PortalInstallment> = {}
): PortalInstallment => ({
  sequence: 1,
  amount: "1500.0000",
  dueDate: "2026-09-05",
  status: "PENDING",
  paidAt: null,
  ...overrides,
});

describe("PortalOrderInstallments", () => {
  it("lista a ordem, o vencimento e o valor de cada parcela", () => {
    render(
      <PortalOrderInstallments
        installments={[
          parcela(),
          parcela({ sequence: 2, dueDate: "2026-10-05" }),
        ]}
      />
    );

    expect(screen.getByText("1ª · vence 05/09/2026")).toBeInTheDocument();
    expect(screen.getByText("2ª · vence 05/10/2026")).toBeInTheDocument();
    expect(screen.getAllByText("R$ 1.500,00")).toHaveLength(2);
    expect(screen.getByText("2 parcelas")).toBeInTheDocument();
  });

  it("parcela única é dita assim, e não '1 parcelas'", () => {
    render(<PortalOrderInstallments installments={[parcela()]} />);

    expect(screen.getByText("Parcela única")).toBeInTheDocument();
  });

  it("o que já foi pago mostra a data e o selo", () => {
    render(
      <PortalOrderInstallments
        installments={[parcela({ status: "PAID", paidAt: "2026-09-03" })]}
      />
    );

    expect(screen.getByText("Pago em 03/09/2026")).toBeInTheDocument();
    expect(screen.getByText("Pago")).toBeInTheDocument();
  });

  it("o que falta pagar não inventa data de pagamento", () => {
    render(<PortalOrderInstallments installments={[parcela()]} />);

    expect(screen.queryByText(/^Pago em/)).not.toBeInTheDocument();
    expect(screen.getByText("A pagar")).toBeInTheDocument();
  });

  it("parcela cancelada aparece como cancelada, não some", () => {
    render(
      <PortalOrderInstallments
        installments={[parcela({ status: "CANCELLED" })]}
      />
    );

    expect(screen.getByText("Cancelada")).toBeInTheDocument();
  });

  it("parcela sem vencimento diz isso em vez de mostrar data vazia", () => {
    render(
      <PortalOrderInstallments installments={[parcela({ dueDate: null })]} />
    );

    expect(screen.getByText("1ª · sem vencimento")).toBeInTheDocument();
  });

  it("antes do faturamento o bloco some por completo", () => {
    // É o faturamento que gera as parcelas: um "nenhuma parcela" num pedido
    // recém-confirmado sugere que algo deu errado, quando é só cedo demais.
    const { container } = render(<PortalOrderInstallments installments={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
