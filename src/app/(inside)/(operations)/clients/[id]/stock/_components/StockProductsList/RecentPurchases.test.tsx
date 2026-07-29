import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ProductPurchase } from "../../../interface";
import { RecentPurchases } from "./RecentPurchases";

const purchase = (over: Partial<ProductPurchase> = {}): ProductPurchase => ({
  orderId: "o1",
  purchaseDate: "2026-07-01",
  quantity: "20",
  unitPrice: "12.5",
  ...over,
});

describe("RecentPurchases", () => {
  it("começa recolhido — o card de estoque não pode virar uma parede de texto", () => {
    render(<RecentPurchases purchases={[purchase()]} unitLabel="peça" />);

    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(screen.queryByText("01/07/2026")).not.toBeInTheDocument();
  });

  it("abre e lista as compras da mais recente para a mais antiga", async () => {
    render(
      <RecentPurchases
        purchases={[
          purchase({ orderId: "o2", purchaseDate: "2026-07-01" }),
          purchase({ orderId: "o1", purchaseDate: "2026-06-01" }),
        ]}
        unitLabel="peça"
      />
    );

    await userEvent.click(screen.getByRole("button"));

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("01/07/2026");
    expect(items[1]).toHaveTextContent("01/06/2026");
  });

  it("mostra o intervalo em relação à compra anterior — é a conta da duração média", async () => {
    render(
      <RecentPurchases
        purchases={[
          purchase({ orderId: "o2", purchaseDate: "2026-07-01" }),
          purchase({ orderId: "o1", purchaseDate: "2026-06-01" }),
        ]}
        unitLabel="peça"
      />
    );

    await userEvent.click(screen.getByRole("button"));

    expect(screen.getByText("30 dias depois da anterior")).toBeInTheDocument();
    // A mais antiga não tem anterior para comparar.
    expect(screen.getAllByText(/depois da anterior/)).toHaveLength(1);
  });

  it("mostra quantidade com a unidade e o preço unitário", async () => {
    render(<RecentPurchases purchases={[purchase()]} unitLabel="caixa" />);

    await userEvent.click(screen.getByRole("button"));

    expect(screen.getByText("20 caixa")).toBeInTheDocument();
    expect(screen.getByText(/12,50\/un/)).toBeInTheDocument();
  });

  it("sem compra registrada, diz isso em vez de mostrar um colapso vazio", () => {
    render(<RecentPurchases purchases={[]} unitLabel="peça" />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(
      screen.getByText("Nenhuma compra registrada deste produto ainda.")
    ).toBeInTheDocument();
  });

  it("uma única compra fala no singular", () => {
    render(<RecentPurchases purchases={[purchase()]} unitLabel="peça" />);

    expect(screen.getByText("1 compra registrada")).toBeInTheDocument();
  });
});
