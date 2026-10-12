import { commissionsBackend } from "../support/commissionsServer";
import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";
import { grantRole } from "../support/role";

/**
 * A tela de comissões pede ao backend UM MÊS por vez — e recebe dele os números
 * prontos: os cartões do mês, a repartição e um resumo por fábrica são somados
 * no servidor sobre o recorte inteiro, e as parcelas vêm em páginas, uma
 * fábrica por vez.
 *
 * Antes ela baixava todas as linhas e fazia as contas no navegador; num mês com
 * uma baixa em lote eram milhares de parcelas para mostrar três cartões. O que
 * estes testes protegem é o contrato do recorte — o período, a situação, a
 * ótica e os filtros que saem na consulta — e a tela montada com a resposta.
 * `commissionsBackend` faz o papel do servidor sobre as parcelas do cenário.
 *
 * O usuário do storageState é um VENDEDOR: sem seletor de vendedor e sem os
 * botões de gestão, o que sobra na tela é exatamente o recorte.
 */

const AGOSTO = { from: "2026-08-01", to: "2026-08-31" };

/** Primeiro dia do mês, `delta` meses a partir de hoje, em ISO. */
const monthStart = (delta: number): string => {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
};

const MONTHS_PT = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

/** "setembro de 2026" — o rótulo do mês, `delta` meses a partir de hoje. */
const monthName = (delta: number): string => {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + delta, 1);
  return `${MONTHS_PT[d.getMonth()]} de ${d.getFullYear()}`;
};

/** Uma linha de comissão como o backend a devolve. */
function row(overrides: Record<string, unknown> = {}) {
  return {
    orderId: "order-1",
    installmentId: "inst-1",
    sequence: 1,
    orderDate: "2026-07-02",
    invoicedAt: "2026-07-10",
    invoiceNumber: "12345",
    dueDate: "2026-08-09",
    paidAt: null,
    installmentAmount: "1000.00",
    amount: "50.00",
    status: "receivable",
    receiveDate: "2026-08-09",
    isReceivable: true,
    isReceived: false,
    isReconciled: false,
    reconciledAt: null,
    isOverdue: false,
    defaultedAt: null,
    isChargebackSettled: false,
    chargebackSettledAt: null,
    sellerAmount: "50.00",
    sellerStatus: "receivable",
    sellerReceiveDate: "2026-08-09",
    isSellerPaid: false,
    sellerChargebackMonth: null,
    isSellerChargebackSettled: false,
    sellerChargebackSettledAt: null,
    client: {
      id: "client-1",
      razaoSocial: "CASA DO SONO LTDA",
      nomeFantasia: "Casa do Sono",
    },
    factory: {
      id: "factory-1",
      nomeFantasia: "Herc",
      nickname: null,
      razaoSocial: "INDUSTRIA HERC LTDA",
    },
    seller: { id: "seller-1", name: "Vendedor Teste" },
    ...overrides,
  };
}

test("comissões: o gestor vê quanto da comissão fica no escritório", async ({
  page,
}) => {
  // São dois acordos empilhados: a fábrica paga 50,00 ao escritório, que
  // repassa 30,00 ao vendedor — sobram 20,00. O vendedor não vê essa conta (é
  // a fatia dele que aparece como comissão), e por isso o painel é de gestão.
  await grantRole(page, "OWNER");
  await mockGraphql(page, {
    CommissionsSellers: () => ({
      commissions_sellers: {
        edges: [{ node: { id: "seller-1", name: "Vendedor Teste" } }],
        totalCount: 1,
      },
    }),
    ...commissionsBackend([row({ sellerAmount: "30.00" })], { manager: true }),
  });

  await page.goto("/commissions");

  await expect(
    page.getByText("Do que cai em agosto de 2026", { exact: false })
  ).toBeVisible();
  await expect(page.getByText("das fábricas", { exact: true })).toBeVisible();
  await expect(page.getByText("R$ 30,00").first()).toBeVisible();
  await expect(page.getByText("R$ 20,00").first()).toBeVisible();
  await expect(page.getByText("no escritório (40%)")).toBeVisible();
});

test("comissões: trocar a ótica refaz os números da tela inteira", async ({
  page,
}) => {
  // A mesma parcela vale dois números em meses diferentes: a fábrica paga
  // 50,00 ao escritório em agosto, e o escritório repassa 30,00 ao vendedor em
  // setembro. A tela mostrava só o primeiro par, com rótulos que não diziam
  // isso — e o extrato em PDF trazia o segundo, o que fazia um dos dois
  // parecer errado.
  await grantRole(page, "OWNER");
  await mockGraphql(page, {
    CommissionsSellers: () => ({
      commissions_sellers: {
        edges: [{ node: { id: "seller-1", name: "Vendedor Teste" } }],
        totalCount: 1,
      },
    }),
    ...commissionsBackend(
      [
        row({
          sellerAmount: "30.00",
          sellerReceiveDate: "2026-09-14",
        }),
      ],
      { manager: true }
    ),
  });

  await page.goto("/commissions");

  // Ótica do escritório (a que a tela abre): o dinheiro da fábrica, em agosto.
  await expect(page.getByText("A receber em agosto de 2026")).toBeVisible();
  await expect(page.getByText("R$ 50,00").first()).toBeVisible();
  await expect(
    page.getByText("Mostrando o que as fábricas devem em agosto de 2026", {
      exact: false,
    })
  ).toBeVisible();

  await page.getByRole("button", { name: "Valores de Vendedor" }).click();

  // Ótica do vendedor: a fatia dele — e ela cai em SETEMBRO, então agosto fica
  // zerado. É o ponto do seletor: o mês também muda de significado.
  await expect(
    page.getByText("Repasse a receber em agosto de 2026")
  ).toBeVisible();
  await expect(
    page.getByText(
      "Mostrando o que o vendedor tem a receber em agosto de 2026",
      {
        exact: false,
      }
    )
  ).toBeVisible();
  // A repartição sai da tela: ela é medida no calendário da fábrica.
  await expect(page.getByText("de repasse", { exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: "Próximo mês" }).click();

  await expect(page.getByText("R$ 30,00").first()).toBeVisible();
});

test("comissões: a tela pede o mês ao backend, não a carteira inteira", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    ...commissionsBackend([row()]),
  });

  await page.goto("/commissions");

  // O mês da resposta (`latestReceiveDate`) é onde a tela abre — e é ele que
  // volta ao backend como período. Sem isso, a tela abriria no mês corrente e
  // mostraria vazio numa carteira que tem movimento.
  await expect
    .poll(() => JSON.stringify(spy.lastVariables("Commissions") ?? {}))
    .toContain(`"from":"${AGOSTO.from}","to":"${AGOSTO.to}"`);

  await expect(page.getByText("Resumo de agosto de 2026")).toBeVisible();
  await expect(page.getByText("CASA DO SONO LTDA").first()).toBeVisible();

  // O vendedor não vê a repartição com o escritório: a comissão que ele lê JÁ
  // é a fatia dele, e a conta seria a de outra pessoa.
  await expect(page.getByText("de repasse", { exact: true })).toHaveCount(0);

  // E vê, como todo mundo, o que a lista está somando — a frase é a resposta
  // para os dois recortes da tela (mês e situação) governarem coisas diferentes.
  await expect(
    page.getByText("Mostrando o que há a receber em agosto de 2026", {
      exact: false,
    })
  ).toBeVisible();
});

test("comissões: comissão lançada para o futuro não tira a tela do mês de hoje", async ({
  page,
}) => {
  // O defeito: `latestReceiveDate` é a data MAIS DISTANTE, e a comissão nasce
  // com data de recebimento no faturamento — há sempre um mês à frente já
  // lançado. A tela saltava para lá e abria em novembro para quem veio ver
  // setembro, inclusive num simples F5.
  const spy = await mockGraphql(page, {
    ...commissionsBackend([row({ receiveDate: monthStart(0) })], {
      latestReceiveDate: monthStart(2),
    }),
  });

  await page.goto("/commissions");

  await expect(
    page.getByText(`Resumo de ${monthName(0)}`, { exact: false })
  ).toBeVisible();
  await expect
    .poll(() => JSON.stringify(spy.lastVariables("Commissions") ?? {}))
    .toContain(`"from":"${monthStart(0)}"`);
});

test("comissões: mês de hoje vazio recua para o último com movimento", async ({
  page,
}) => {
  // O motivo de o salto existir: carteira sem nada no mês corrente abria uma
  // tela vazia, e quem tinha movimento em agosto concluía que não havia nada.
  // Para trás continua valendo — é só para frente que ele deixou de valer.
  await mockGraphql(page, {
    ...commissionsBackend([row()]),
  });

  await page.goto("/commissions");

  await expect(page.getByText("Resumo de agosto de 2026")).toBeVisible();
});

test("comissões: trocar de mês refaz a consulta com o novo período", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    ...commissionsBackend([row()]),
  });

  await page.goto("/commissions");
  await expect(page.getByText("Resumo de agosto de 2026")).toBeVisible();

  await page.getByRole("button", { name: "Mês anterior" }).click();

  await expect
    .poll(() => JSON.stringify(spy.lastVariables("Commissions") ?? {}))
    .toContain('"from":"2026-07-01","to":"2026-07-31"');
  await expect(page.getByText("Resumo de julho de 2026")).toBeVisible();
});

test("comissões: a aba de boletos travados pede os de todos os vencimentos", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    ...commissionsBackend([row()]),
  });

  await page.goto("/commissions");
  await expect(page.getByText("Resumo de agosto de 2026")).toBeVisible();

  await page.getByRole("button", { name: /Boleto em atraso/ }).click();

  // A aba vai na consulta: é o servidor que junta os boletos travados de todos
  // os vencimentos (e só nela — nas outras eles não entram na conta).
  await expect
    .poll(() => JSON.stringify(spy.lastVariables("Commissions") ?? {}))
    .toContain('"tab":"overdue"');

  // E a tela avisa que ali o mês não vale — o mesmo que o backend fez. O aviso
  // deixou de ser um alerta exclusivo desta aba: virou a frase de escopo, que
  // aparece em TODAS elas dizendo o que a lista está somando.
  await expect(
    page.getByText("esta aba não segue o mês", { exact: false })
  ).toBeVisible();
});

test("comissões: no escritório a tela soma todos os vendedores", async ({
  page,
}) => {
  // A ótica do escritório é a conta da CASA: é ela que se põe ao lado da
  // planilha da fábrica, e a planilha vem por fábrica, com os pedidos de todo
  // mundo dentro. Recortada por vendedor, ela dava um total que não existe em
  // papel nenhum — e o campo continuava clicável, prometendo um filtro que a
  // ótica ignora. Aqui o seletor fica travado em "Todos os vendedores"; é na
  // ótica do vendedor que ele volta a valer.
  await grantRole(page, "OWNER");
  const spy = await mockGraphql(page, {
    CommissionsSellers: () => ({
      commissions_sellers: {
        edges: [{ node: { id: "seller-1", name: "Vendedor Teste" } }],
        totalCount: 1,
      },
    }),
    ...commissionsBackend([row()], { manager: true }),
  });

  await page.goto("/commissions");
  await expect(page.getByText("Resumo de agosto de 2026")).toBeVisible();

  // Sem vendedor na consulta: o backend devolve a empresa inteira.
  await expect
    .poll(() => JSON.stringify(spy.lastVariables("Commissions") ?? {}))
    .toContain('"sellerId":null');
  await expect(page.getByPlaceholder("Todos os vendedores")).toBeDisabled();
  // E a lista diz de quem são as parcelas, lá embaixo, longe do seletor.
  await expect(page.getByText("· Todos os vendedores")).toBeVisible();

  await page.getByRole("button", { name: "Valores de Vendedor" }).click();

  // A ótica do vendedor destrava o seletor e recorta a consulta.
  await expect
    .poll(() => JSON.stringify(spy.lastVariables("Commissions") ?? {}))
    .toContain('"sellerId":"seller-1"');
  await expect(page.getByPlaceholder("Selecionar vendedor")).toBeEnabled();
});

test("comissões: somando todos, a lista diz de quem é cada parcela", async ({
  page,
}) => {
  // No escritório as linhas de várias pessoas se misturam dentro do mesmo
  // cartão de fábrica — é assim que a planilha da fábrica vem. Sem a coluna,
  // "de quem é esta parcela" só se descobria abrindo o pedido; e o filtro do
  // painel é o recorte de leitura dentro da conta da casa, diferente do seletor
  // lá em cima, que troca a pergunta para o ciclo de pagamento do vendedor.
  await grantRole(page, "OWNER");
  await mockGraphql(page, {
    CommissionsSellers: () => ({
      commissions_sellers: {
        edges: [
          { node: { id: "seller-1", name: "Vendedor Teste" } },
          { node: { id: "seller-2", name: "Mariana Souza" } },
        ],
        totalCount: 2,
      },
    }),
    ...commissionsBackend(
      [
        row(),
        row({
          orderId: "order-2",
          installmentId: "inst-2",
          client: {
            id: "client-2",
            razaoSocial: "MOVEIS AURORA LTDA",
            nomeFantasia: "Aurora",
          },
          seller: { id: "seller-2", name: "Mariana Souza" },
        }),
      ],
      { manager: true }
    ),
  });

  await page.goto("/commissions");
  await expect(page.getByText("Resumo de agosto de 2026")).toBeVisible();

  await expect(
    page.getByRole("columnheader", { name: "Vendedor" })
  ).toBeVisible();
  await expect(
    page.getByRole("row").filter({ hasText: "MOVEIS AURORA LTDA" })
  ).toContainText("Mariana Souza");

  // O filtro recorta a tela inteira — e a frase de escopo deixa de dizer
  // "Todos os vendedores", que ao lado de uma lista de uma pessoa só seria a
  // contradição que ela existe para evitar.
  await page.getByRole("button", { name: "Filtros", exact: true }).click();
  await page
    .locator("[data-filters-panel]")
    .getByPlaceholder("Todos os vendedores")
    .click();
  await page
    .locator("[data-select-dropdown]")
    .getByText("Mariana Souza", { exact: true })
    .click();

  await expect(page.getByText("CASA DO SONO LTDA")).toHaveCount(0);
  await expect(page.getByText("· Mariana Souza")).toBeVisible();

  // Na ótica do vendedor a coluna sai: repetiria o mesmo nome em toda linha.
  await page.getByRole("button", { name: "Valores de Vendedor" }).click();
  await expect(
    page.getByRole("columnheader", { name: "Vendedor" })
  ).toHaveCount(0);
});

test.describe("comissões: mês com muitas parcelas", () => {
  /**
   * 120 parcelas da mesma fábrica no mesmo mês — o caso da baixa em lote. A
   * tela recebe os números somados e UMA página de linhas; o resto fica no
   * servidor até alguém pedir.
   */
  const MANY = Array.from({ length: 120 }, (_, i) =>
    row({
      orderId: `order-${i + 1}`,
      installmentId: `inst-${i + 1}`,
      client: {
        id: `client-${i + 1}`,
        razaoSocial: `CLIENTE ${String(i + 1).padStart(3, "0")} LTDA`,
        nomeFantasia: null,
      },
    })
  );

  test("os cartões somam o mês inteiro e a tabela mostra uma página", async ({
    page,
  }) => {
    const spy = await mockGraphql(page, { ...commissionsBackend(MANY) });

    await page.goto("/commissions");
    await expect(page.getByText("Resumo de agosto de 2026")).toBeVisible();

    // 120 × R$ 50,00: o cartão é do recorte COMPLETO, não das 50 linhas na tela.
    await expect(page.getByText("R$ 6.000,00").first()).toBeVisible();
    await expect(page.getByText("120 parcela(s) a receber")).toBeVisible();
    await expect(
      page.getByText("120 parcelas · página 1 de 3", { exact: false })
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "CLIENTE 001 LTDA", exact: true })
    ).toBeVisible();
    await expect(page.getByText("CLIENTE 051 LTDA")).toHaveCount(0);

    // A abertura cabe numa requisição: a primeira página vem com o resumo.
    expect(spy.calls("CommissionsFactoryRows")).toHaveLength(0);

    await page.getByRole("button", { name: "Próxima página" }).click();

    await expect(
      page.getByRole("cell", { name: "CLIENTE 051 LTDA", exact: true })
    ).toBeVisible();
    await expect(page.getByText("CLIENTE 001 LTDA")).toHaveCount(0);
    // Paginar é do servidor: o deslocamento sai na consulta, com o MESMO recorte.
    const rowsCall = spy.lastVariables("CommissionsFactoryRows");
    expect(rowsCall).toMatchObject({
      factoryId: "factory-1",
      first: 50,
      offset: 50,
      input: { from: AGOSTO.from, to: AGOSTO.to, tab: "receivable" },
    });
    // E os cartões continuam os do mês inteiro, na página que for.
    await expect(page.getByText("R$ 6.000,00").first()).toBeVisible();
  });

  test("filtro e ordenação vão ao servidor, não reordenam só a página", async ({
    page,
  }) => {
    const spy = await mockGraphql(page, { ...commissionsBackend(MANY) });

    await page.goto("/commissions");
    await expect(page.getByText("Resumo de agosto de 2026")).toBeVisible();

    await page.getByRole("button", { name: /Comissão/ }).click();
    await expect
      .poll(() => JSON.stringify(spy.lastVariables("Commissions") ?? {}))
      .toContain('"sortBy":"amount","sortDir":"desc"');

    await page.getByRole("button", { name: "Filtros", exact: true }).click();
    await page
      .locator("[data-filters-panel]")
      .getByPlaceholder("Nome do cliente, código do pedido ou número da nota")
      .fill("CLIENTE 077");

    await expect
      .poll(() => JSON.stringify(spy.lastVariables("Commissions") ?? {}))
      .toContain('"search":"CLIENTE 077"');
    // Os cartões seguem o filtro: sobrou uma parcela de R$ 50,00.
    await expect(
      page.getByText("1 de 120 parcela(s) após os filtros")
    ).toBeVisible();
    await expect(page.getByText("1 parcela(s) a receber")).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "CLIENTE 077 LTDA", exact: true })
    ).toBeVisible();
  });

  test("a seleção em lote diz a página e o alcance antes de agir", async ({
    page,
  }) => {
    await grantRole(page, "OWNER");
    await mockGraphql(page, {
      CommissionsSellers: () => ({
        commissions_sellers: {
          edges: [{ node: { id: "seller-1", name: "Vendedor Teste" } }],
          totalCount: 1,
        },
      }),
      ...commissionsBackend(MANY, { manager: true }),
    });

    await page.goto("/commissions");
    await expect(page.getByText("Resumo de agosto de 2026")).toBeVisible();

    // A caixa do cabeçalho é da PÁGINA, e isso está escrito.
    await expect(
      page.getByText("A caixa do cabeçalho marca", { exact: false })
    ).toBeVisible();
    await page
      .getByRole("checkbox", { name: "Selecionar esta página" })
      .check({ force: true });
    await expect(page.getByText("50 parcelas selecionadas")).toBeVisible();
    await expect(
      page.getByText("50 de 120 parcelas desta fábrica", { exact: false })
    ).toBeVisible();

    // Trocar de página não larga o que foi marcado: o lote acumula.
    await page.getByRole("button", { name: "Próxima página" }).click();
    await expect(
      page.getByRole("cell", { name: "CLIENTE 051 LTDA", exact: true })
    ).toBeVisible();
    await page
      .getByRole("checkbox", {
        name: "Selecionar a parcela 1 de CLIENTE 051 LTDA",
      })
      .check({ force: true });
    await expect(page.getByText("51 parcelas selecionadas")).toBeVisible();
    await expect(
      page.getByText(
        "51 selecionada(s) nesta fábrica — 1 nesta página e 50 em outra(s)"
      )
    ).toBeVisible();
    await expect(
      page.getByText("50 estão em outra página", { exact: false })
    ).toBeVisible();

    // E o alcance aparece DENTRO do modal, na hora de confirmar.
    await page.getByRole("button", { name: "Cliente pagou" }).click();
    await expect(
      page
        .getByRole("dialog")
        .getByText(
          "Esta ação vale para as 51 parcelas selecionadas de Herc (agosto de 2026) — 50 delas não estão na página aberta."
        )
    ).toBeVisible();
  });

  test("o PDF do mês não depende da página aberta", async ({ page }) => {
    const spy = await mockGraphql(page, {
      ...commissionsBackend(MANY),
      CommissionsForPdf: () => ({ commissions_pdf: { rows: MANY } }),
    });

    await page.goto("/commissions");
    await expect(page.getByText("Resumo de agosto de 2026")).toBeVisible();
    await page.getByRole("button", { name: "Próxima página" }).click();
    await expect(
      page.getByText("página 2 de 3", { exact: false })
    ).toBeVisible();
    await page.getByRole("button", { name: "Próxima página" }).click();
    await expect(
      page.getByText("página 3 de 3", { exact: false })
    ).toBeVisible();

    await page.getByRole("button", { name: "Baixar PDF do mês" }).click();

    // O papel busca as linhas dele: o mês e o seguinte inteiros, sem página e
    // sem os filtros da tela — é o fechamento, não um retrato do que está aberto.
    const variables = await spy.waitForCall("CommissionsForPdf");
    expect(variables).toEqual({
      sellerId: null,
      from: "2026-08-01",
      to: "2026-09-30",
      paidFrom: "2026-08-01",
      paidTo: "2026-08-31",
    });
  });
});

test.describe("comissões: nome comprido na tabela", () => {
  const LONG_NAME = "COMERCIAL DE MATERIAIS DE CONSTRUCAO SILVA E FILHOS LTDA";

  /**
   * A tela do VENDEDOR (o usuário padrão do storageState). A do gestor tem
   * doze colunas — seleção, vendedor, conferência, ações — e continua rolando
   * abaixo de 1600px mesmo com o nome quebrado: ali o que aperta é o número de
   * colunas, não o texto.
   */
  const openWithLongName = async (page: import("@playwright/test").Page) => {
    await mockGraphql(page, {
      ...commissionsBackend([
        row({
          client: {
            id: "client-1",
            razaoSocial: LONG_NAME,
            nomeFantasia: null,
          },
        }),
      ]),
    });
    await page.goto("/commissions");
    return page.getByRole("cell", { name: LONG_NAME, exact: true });
  };

  /** Quanto a tabela passa da largura do próprio contêiner rolável. */
  const tableOverflow = (cell: import("@playwright/test").Locator) =>
    cell.evaluate((el) => {
      const wrapper = el.closest("table")!.parentElement!;
      return wrapper.scrollWidth - wrapper.clientWidth;
    });

  test("no desktop o nome quebra linha e a tabela não rola para o lado", async ({
    page,
  }) => {
    // Com o mouse, rolar a tabela obriga a ir até a barra lá embaixo: no
    // desktop quem cede é o texto longo, que desce para a segunda linha.
    await page.setViewportSize({ width: 1366, height: 800 });
    const cell = await openWithLongName(page);
    await expect(cell).toBeVisible();

    expect(await tableOverflow(cell)).toBeLessThanOrEqual(1);
    expect(await cell.evaluate((el) => getComputedStyle(el).whiteSpace)).toBe(
      "normal"
    );
    // O nome continua inteiro — quebrado, nunca cortado.
    await expect(cell).toHaveText(LONG_NAME);
  });

  test("no tablet o nome segue em uma linha e a tabela rola", async ({
    page,
  }) => {
    // Abaixo do desktop nada mudou: rolar com o dedo é gesto natural, e a
    // linha única mantém a leitura vertical da lista.
    await page.setViewportSize({ width: 800, height: 1000 });
    const cell = await openWithLongName(page);
    await expect(cell).toBeVisible();

    expect(await cell.evaluate((el) => getComputedStyle(el).whiteSpace)).toBe(
      "nowrap"
    );
    expect(await tableOverflow(cell)).toBeGreaterThan(1);
  });
});
