import { Toast } from "@/components/Toast";
import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PriceListDetail } from "../../../interface";
import {
  CLEAR_PRICE_LIST_PROMOTION_MUTATION,
  PROMOTION_ITEMS_QUERY,
  SET_PRICE_LIST_PROMOTION_MUTATION,
} from "./gql";
import { PromotionModal } from "./index";

const { invalidateClient } = vi.hoisted(() => ({ invalidateClient: vi.fn() }));
vi.mock("@/hooks/useInvalidateQueries", () => ({
  useInvalidateQueriesClient: () => invalidateClient,
}));

/**
 * Promoção relâmpago: preço promocional por item, com janela de validade.
 *
 * O que os casos prendem é o que não se desfaz sozinho — o payload da mutation
 * (item a item, com a janela) e as duas recusas que existem para a promoção não
 * nascer torta: preço sem período e período invertido.
 */
const LIST_ID = "pl-1";

const tabela = (overrides: Partial<PriceListDetail> = {}): PriceListDetail => ({
  id: LIST_ID,
  name: "Tabela BA",
  validFrom: "2026-01-01",
  validUntil: null,
  isActive: true,
  promoStartsOn: null,
  promoEndsOn: null,
  isPromoActive: false,
  ...overrides,
});

const item = (
  id: string,
  unitPrice: string,
  tier: string,
  promoPrice: string | null = null,
  produto = { id: "p-1", name: "Torneira", sku: "SKU-1" }
) => ({
  __typename: "PriceListItemType",
  id,
  unitPrice,
  promoPrice,
  product: { __typename: "ProductType", ...produto, unitPerPack: 1 },
  tier: { __typename: "PriceTierType", id: `t-${tier}`, name: tier },
});

const itemsMock = (nodes: ReturnType<typeof item>[], hasNextPage = false) => ({
  request: {
    query: PROMOTION_ITEMS_QUERY,
    variables: () => true,
  },
  maxUsageCount: 20,
  result: {
    data: {
      priceListItems: {
        __typename: "PriceListItemTypeConnection",
        edges: nodes.map((node) => ({
          __typename: "PriceListItemTypeEdge",
          node,
        })),
        pageInfo: {
          __typename: "PageInfo",
          hasNextPage,
          endCursor: hasNextPage ? "cursor" : null,
        },
      },
    },
  },
});

const enviados: Record<string, unknown>[] = [];

const setMock = () => ({
  request: {
    query: SET_PRICE_LIST_PROMOTION_MUTATION,
    variables: (variables: Record<string, unknown>) => {
      enviados.push(variables);
      return true;
    },
  },
  maxUsageCount: 5,
  result: {
    data: {
      setPriceListPromotion: {
        __typename: "PriceListResponse",
        status: true,
        message: "ok",
        data: {
          __typename: "PriceListType",
          id: LIST_ID,
          promoStartsOn: "2026-09-01",
          promoEndsOn: "2026-09-10",
          isPromoActive: true,
        },
      },
    },
  },
});

const clearMock = () => ({
  request: {
    query: CLEAR_PRICE_LIST_PROMOTION_MUTATION,
    variables: (variables: Record<string, unknown>) => {
      enviados.push(variables);
      return true;
    },
  },
  maxUsageCount: 5,
  result: {
    data: {
      clearPriceListPromotion: {
        __typename: "PriceListResponse",
        status: true,
        message: "ok",
        data: {
          __typename: "PriceListType",
          id: LIST_ID,
          promoStartsOn: null,
          promoEndsOn: null,
          isPromoActive: false,
        },
      },
    },
  },
});

const ITENS = [
  item("i1", "100.00", "SCF"),
  item("i2", "90.00", "Varejo"),
  item("i3", "50.00", "SCF", null, {
    id: "p-2",
    name: "Sifão",
    sku: "SKU-2",
  }),
];

const renderizar = (
  priceList: PriceListDetail = tabela(),
  mocks: unknown[] = [itemsMock(ITENS), setMock(), clearMock()]
) =>
  render(
    <Toast.ToastProvider>
      <MockedProvider mocks={mocks as never}>
        <PromotionModal priceList={priceList} onChanged={vi.fn()} />
      </MockedProvider>
    </Toast.ToastProvider>
  );

const abrir = async () => {
  await userEvent.click(
    screen.getByRole("button", { name: /promoção relâmpago/i })
  );
  await screen.findByText("Torneira");
};

const salvar = () =>
  userEvent.click(screen.getByRole("button", { name: /salvar promoção/i }));

/** Campos de preço promocional, na ordem em que aparecem. */
const camposDePreco = () =>
  screen
    .getAllByRole("textbox")
    .filter((el) => el.getAttribute("inputmode") === "numeric");

const entrada = () => enviados.at(-1)?.input as Record<string, unknown>;

beforeEach(() => {
  enviados.length = 0;
  invalidateClient.mockReset();
});

describe("PromotionModal", () => {
  it("lista os itens agrupados por produto, com o preço atual de cada nível", async () => {
    renderizar();
    await abrir();

    expect(screen.getByText("Torneira")).toBeInTheDocument();
    expect(screen.getByText("SKU-1")).toBeInTheDocument();
    expect(screen.getAllByText("SCF")).toHaveLength(2);
    expect(screen.getByText("Preço atual: R$ 100,00")).toBeInTheDocument();
    expect(screen.getByText("Sifão")).toBeInTheDocument();
  });

  it("começa dizendo que nada está em promoção", async () => {
    renderizar();
    await abrir();

    expect(
      screen.getByText(
        "Nenhum preço em promoção — salvar assim encerra a promoção."
      )
    ).toBeInTheDocument();
  });

  it("conta os preços promovidos enquanto se digita", async () => {
    renderizar();
    await abrir();

    await userEvent.type(camposDePreco()[0]!, "8990");

    expect(screen.getByText("1 preço(s) em promoção.")).toBeInTheDocument();
  });

  it("busca filtra por nome e por código", async () => {
    renderizar();
    await abrir();

    const busca = screen.getByPlaceholderText(
      "Buscar produto por nome ou código..."
    );
    await userEvent.type(busca, "SKU-2");

    expect(screen.getByText("Sifão")).toBeInTheDocument();
    expect(screen.queryByText("Torneira")).not.toBeInTheDocument();
  });

  it("busca sem resultado diz o que foi procurado", async () => {
    renderizar();
    await abrir();

    await userEvent.type(
      screen.getByPlaceholderText("Buscar produto por nome ou código..."),
      "inexistente"
    );

    expect(
      screen.getByText("Nenhum produto encontrado para “inexistente”.")
    ).toBeInTheDocument();
  });

  it("preço sem período é recusado antes de ir à rede", async () => {
    // Promoção sem janela não tem como acabar: o preço ficaria promocional para
    // sempre, e ninguém saberia por quê.
    renderizar();
    await abrir();

    await userEvent.type(camposDePreco()[0]!, "8990");
    await salvar();

    expect(
      await screen.findByText("Informe o início e o fim da promoção.")
    ).toBeInTheDocument();
    expect(enviados).toHaveLength(0);
  });

  it("período invertido é recusado", async () => {
    // A janela é semeada a partir da tabela ao abrir o modal.
    renderizar(
      tabela({ promoStartsOn: "2026-09-10", promoEndsOn: "2026-09-01" })
    );
    await abrir();

    await userEvent.type(camposDePreco()[0]!, "8990");
    await salvar();

    expect(
      await screen.findByText("O fim da promoção não pode ser antes do início.")
    ).toBeInTheDocument();
    expect(enviados).toHaveLength(0);
  });

  it("salva só os itens com preço, junto com a janela", async () => {
    renderizar(
      tabela({ promoStartsOn: "2026-09-01", promoEndsOn: "2026-09-10" })
    );
    await abrir();

    // Filtra para o produto certo: produtos e níveis saem em ordem alfabética,
    // então sem isso o primeiro campo seria o do Sifão.
    await userEvent.type(
      screen.getByPlaceholderText("Buscar produto por nome ou código..."),
      "Torneira"
    );
    await userEvent.type(camposDePreco()[0]!, "8990");

    await salvar();

    await waitFor(() => expect(enviados).toHaveLength(1));
    // O backend recebe produto × nível, não o id da linha da tabela.
    expect(entrada()).toEqual({
      priceListId: LIST_ID,
      promoStartsOn: "2026-09-01",
      promoEndsOn: "2026-09-10",
      items: [{ productId: "p-1", tierId: "t-SCF", promoPrice: 89.9 }],
    });
    expect(
      await screen.findByText("Promoção salva em 1 preço(s).")
    ).toBeInTheDocument();
    await waitFor(() => expect(invalidateClient).toHaveBeenCalled());
  });

  it("salvar sem nenhum preço encerra a promoção e zera a janela", async () => {
    // Sem item promovido, manter as datas deixaria uma promoção vazia no ar.
    renderizar(
      tabela({ promoStartsOn: "2026-09-01", promoEndsOn: "2026-09-10" })
    );
    await abrir();

    await salvar();

    await waitFor(() => expect(enviados).toHaveLength(1));
    expect(entrada()).toMatchObject({
      promoStartsOn: null,
      promoEndsOn: null,
      items: [],
    });
    expect(await screen.findByText("Promoção encerrada.")).toBeInTheDocument();
  });

  it("promoção no ar já abre com os preços gravados", async () => {
    renderizar(
      tabela({ promoStartsOn: "2026-09-01", promoEndsOn: "2026-09-10" }),
      [
        itemsMock([item("i1", "100.00", "SCF", "79.90")]),
        setMock(),
        clearMock(),
      ]
    );
    await abrir();

    expect(camposDePreco()[0]).toHaveValue("79,90");
    expect(screen.getByText("1 preço(s) em promoção.")).toBeInTheDocument();
  });

  it("encerrar a promoção pede confirmação antes de valer", async () => {
    // É uma ação que muda o preço de venda de todo mundo: um clique só seria
    // fácil demais.
    renderizar(
      tabela({ promoStartsOn: "2026-09-01", promoEndsOn: "2026-09-10" })
    );
    await abrir();

    await userEvent.click(
      screen.getByRole("button", { name: "Encerrar promoção" })
    );
    expect(enviados).toHaveLength(0);

    await userEvent.click(
      screen.getByRole("button", { name: "Confirmar encerramento" })
    );

    await waitFor(() => expect(enviados).toHaveLength(1));
    expect(enviados[0]).toEqual({ priceListId: LIST_ID });
  });

  it("sem promoção no ar, não oferece encerrar", async () => {
    renderizar();
    await abrir();

    expect(
      screen.queryByRole("button", { name: /encerrar promoção/i })
    ).not.toBeInTheDocument();
  });

  it("tabela vazia explica o que fazer antes", async () => {
    renderizar(tabela(), [itemsMock([]), setMock(), clearMock()]);
    await userEvent.click(
      screen.getByRole("button", { name: /promoção relâmpago/i })
    );

    expect(
      await screen.findByText("Nenhum item na tabela")
    ).toBeInTheDocument();
  });

  it("falha ao carregar não deixa o modal num limbo silencioso", async () => {
    renderizar(tabela(), [
      {
        request: { query: PROMOTION_ITEMS_QUERY, variables: () => true },
        error: new Error("rede"),
        maxUsageCount: 20,
      },
    ]);
    await userEvent.click(
      screen.getByRole("button", { name: /promoção relâmpago/i })
    );

    expect(
      await screen.findByText("Não foi possível carregar os itens da tabela.")
    ).toBeInTheDocument();
  });
});
