import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OrderDetail } from "../../interface";
import { ClientRequestBanner } from ".";
import { formatDiscountRequest } from "./utils";

const orderWith = (fields: Partial<OrderDetail>) =>
  ({ ...fields }) as OrderDetail;

describe("formatDiscountRequest", () => {
  it("formata em pt-BR e ignora vazio/zero", () => {
    expect(formatDiscountRequest("7.50")).toBe("7,5%");
    expect(formatDiscountRequest("5.00")).toBe("5%");
    expect(formatDiscountRequest("0.00")).toBeNull();
    expect(formatDiscountRequest(null)).toBeNull();
    expect(formatDiscountRequest("abc")).toBeNull();
  });
});

describe("ClientRequestBanner", () => {
  it("sem desconto nem recado não renderiza", () => {
    const { container } = render(<ClientRequestBanner order={orderWith({})} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("mostra o desconto pedido e o recado", () => {
    render(
      <ClientRequestBanner
        order={orderWith({
          clientDiscountPercent: "5.00",
          clientRequestNote: "Entrega sexta",
        })}
      />
    );
    expect(screen.getByText("5% de desconto")).toBeInTheDocument();
    expect(
      screen.getByText(/Recado do cliente: “Entrega sexta”/)
    ).toBeInTheDocument();
  });
});
