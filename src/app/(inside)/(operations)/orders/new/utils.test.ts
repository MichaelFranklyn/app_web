import { describe, expect, it } from "vitest";

import { resolveBackLink, resolveOrigin } from "./utils";

describe("resolveOrigin", () => {
  it("lê a origem da URL", () => {
    expect(resolveOrigin({ clientId: "c1" })).toEqual({
      kind: "client",
      clientId: "c1",
    });
    expect(resolveOrigin({ factoryId: "f1" })).toEqual({
      kind: "factory",
      factoryId: "f1",
    });
    expect(resolveOrigin({})).toEqual({ kind: "orders" });
  });

  it("da visita, só com o vínculo inteiro", () => {
    const visit = {
      visitItemId: "v1",
      sellerId: "s1",
      clientId: "c1",
      factoryId: "f1",
    };
    expect(resolveOrigin(visit)).toEqual({ kind: "visit", ...visit });
    // Faltando o vendedor, não inventa o dono: cai para a porta do cliente.
    expect(resolveOrigin({ ...visit, sellerId: undefined })).toEqual({
      kind: "client",
      clientId: "c1",
    });
  });
});

describe("resolveBackLink", () => {
  it("volta para a tela de onde o pedido foi aberto", () => {
    expect(
      resolveBackLink({ kind: "client", clientId: "c1" }, "/clients/cc1/orders")
    ).toEqual({ href: "/clients/cc1/orders", label: "Cliente" });
  });

  it("não aceita link para fora do sistema", () => {
    // `from` chega pela URL: um `//outro.site` seria um redirecionamento aberto.
    expect(
      resolveBackLink({ kind: "factory", factoryId: "f1" }, "//evil.com")
    ).toEqual({ href: "/orders", label: "Pedidos" });
    expect(
      resolveBackLink({ kind: "factory", factoryId: "f1" }, "https://evil.com")
    ).toEqual({ href: "/orders", label: "Pedidos" });
  });

  it("da lista, volta sempre para a lista", () => {
    expect(resolveBackLink({ kind: "orders" }, "/clients/x")).toEqual({
      href: "/orders",
      label: "Pedidos",
    });
  });
});
