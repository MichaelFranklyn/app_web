import { describe, expect, it } from "vitest";

import { newOrderUrl } from "./newOrderUrl";

describe("newOrderUrl", () => {
  it("da lista, é a página sem nada decidido", () => {
    expect(newOrderUrl()).toBe("/orders/new");
  });

  it("leva o que vem decidido e a tela de volta", () => {
    expect(newOrderUrl({ clientId: "c1" }, "/clients/cc1/orders")).toBe(
      "/orders/new?clientId=c1&from=%2Fclients%2Fcc1%2Forders"
    );
  });

  it("da visita, leva a visita e o vínculo inteiro", () => {
    const url = new URL(
      newOrderUrl(
        { visitItemId: "v1", sellerId: "s1", clientId: "c1", factoryId: "f1" },
        "/routines"
      ),
      "http://x"
    );
    expect(Object.fromEntries(url.searchParams)).toEqual({
      visitItemId: "v1",
      sellerId: "s1",
      clientId: "c1",
      factoryId: "f1",
      from: "/routines",
    });
  });
});
