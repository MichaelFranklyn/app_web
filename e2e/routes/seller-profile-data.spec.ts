import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";

/**
 * O cadastro de quem vende se completa no PERFIL da pessoa. Dados pessoais (CPF,
 * contato, endereço) são do USUÁRIO e o gestor grava por `updateUser`; o perfil
 * de vendedor guarda só a atuação em campo (região), por `updateSeller`.
 *
 * É o caminho que faz a rota do dia funcionar: o endereço da pessoa é o ponto de
 * partida. O CEP tem autofill via ViaCEP (externo) — interceptado para
 * determinismo.
 */
const userWithSeller = (seller: Record<string, unknown>) => ({
  user_detail: {
    status: true,
    message: "ok",
    data: {
      id: "u-1",
      name: "Vendedor Perfil",
      email: "vp@empresa.com.br",
      role: "SELLER",
      isActive: true,
      phone: null,
      cpf: null,
      birthDate: null,
      addressZip: null,
      addressStreet: null,
      addressNumber: null,
      addressComplement: null,
      addressNeighborhood: null,
      addressCity: null,
      addressState: null,
      createdAt: "2026-01-01T00:00:00Z",
      company: {
        id: "c-1",
        nomeFantasia: "Empresa Teste",
        razaoSocial: "Empresa Teste LTDA",
      },
      seller,
    },
  },
});

const emptySeller = {
  id: "seller-1",
  name: "Vendedor Perfil",
  region: null,
  isActive: true,
  factoryCount: 0,
  clientCount: 0,
  totalRevenue: "0",
  lastOrderDate: null,
  scheduleConfig: null,
};

test("perfil: o gestor completa os dados da pessoa com autofill de CEP", async ({
  page,
}) => {
  let sentInput: Record<string, unknown> | null = null;

  await page.route("https://viacep.com.br/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        logradouro: "Av. Paulista",
        bairro: "Bela Vista",
        localidade: "São Paulo",
        uf: "SP",
      }),
    })
  );

  await mockGraphql(page, {
    UserDetail: () => userWithSeller(emptySeller),
    SellerFactoryAccesses: () => ({ seller_accesses: emptyConnection() }),
    SellerClientLinks: () => ({ seller_clients: emptyConnection() }),
    UpdatePersonData: (v) => {
      sentInput = (v.input ?? {}) as Record<string, unknown>;
      return {
        updateUser: {
          status: true,
          code: 200,
          message: "ok",
          data: {
            ...userWithSeller(emptySeller).user_detail.data,
            ...(v.input as object),
          },
        },
      };
    },
  });

  await page.goto("/settings/users/u-1");

  // Os dados da pessoa se editam no card "Dados pessoais" — não no de vendedor.
  await page.getByRole("button", { name: "Editar dados pessoais" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  // Passo 1: identificação.
  await dialog.locator('input[name="cpf"]').fill("111.444.777-35");
  await dialog.locator('input[name="phone"]').fill("11999990000");
  await dialog.getByRole("button", { name: "Continuar" }).click();

  // Passo 2: endereço, com autofill pelo CEP.
  await dialog.locator('input[name="addressZip"]').fill("01310-100");
  await expect(dialog.locator('input[name="addressCity"]')).toHaveValue(
    "São Paulo"
  );
  await dialog.locator('input[name="addressNumber"]').fill("1000");

  await dialog.getByRole("button", { name: "Salvar alterações" }).click();

  await expect(page.getByText("Dados atualizados com sucesso")).toBeVisible();
  expect(sentInput).not.toBeNull();
  expect(sentInput!.addressCity).toBe("São Paulo");
  // CPF e telefone viajam só com dígitos.
  expect(sentInput!.cpf).toBe("11144477735");
  expect(sentInput!.phone).toBe("11999990000");
  expect(sentInput!.addressZip).toBe("01310100");
});

test("perfil: a atuação em campo é o que sobra no card de vendedor", async ({
  page,
}) => {
  let sentInput: Record<string, unknown> | null = null;

  await mockGraphql(page, {
    UserDetail: () => userWithSeller(emptySeller),
    SellerFactoryAccesses: () => ({ seller_accesses: emptyConnection() }),
    SellerClientLinks: () => ({ seller_clients: emptyConnection() }),
    UpdateSellerFromProfile: (v) => {
      sentInput = (v.input ?? {}) as Record<string, unknown>;
      return { updateSeller: { status: true, message: "ok" } };
    },
  });

  await page.goto("/settings/users/u-1");
  await page.getByRole("button", { name: "Editar atuação" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  // Nada de CPF/endereço aqui: são dados da pessoa.
  await expect(dialog.locator('input[name="cpf"]')).toHaveCount(0);
  await expect(dialog.locator('input[name="homeCep"]')).toHaveCount(0);

  await dialog.locator('input[name="region"]').fill("Sudeste");
  await dialog.getByRole("button", { name: "Salvar alterações" }).click();

  await expect(page.getByText("Atuação em campo atualizada")).toBeVisible();
  expect(sentInput).toEqual({ region: "Sudeste" });
});

test("rotina: sem configuração, o card já abre nos controles e cria a config", async ({
  page,
}) => {
  let sentInput: Record<string, unknown> | null = null;

  await mockGraphql(page, {
    UserDetail: () => userWithSeller(emptySeller),
    SellerFactoryAccesses: () => ({ seller_accesses: emptyConnection() }),
    SellerClientLinks: () => ({ seller_clients: emptyConnection() }),
    CreateScheduleConfig: (v) => {
      sentInput = (v.input ?? {}) as Record<string, unknown>;
      return {
        createScheduleConfig: {
          status: true,
          message: "ok",
          data: {
            id: "cfg-1",
            sellerId: "seller-1",
            maxVisitsPerDay: 8,
            workDays: [1, 2, 3, 4, 5],
            workStartTime: "08:00:00",
            workEndTime: "18:00:00",
            avgVisitDurationMin: 30,
            isRescheduleSameWeek: true,
            maxRescheduleAttempts: 3,
            penaltyScorePerMiss: "1.0",
            priorityWeights: {},
            seller: { id: "seller-1", user: { name: "Vendedor Perfil" } },
          },
        },
      };
    },
  });

  await page.goto("/settings/users/u-1");

  // Sem aba: o bloco de rotina já está na página.
  await expect(page.getByText("Ainda não configurada")).toBeVisible();
  // Sem config o editor já está aberto, com os padrões sugeridos.
  await expect(page.getByRole("button", { name: "Seg" })).toBeVisible();

  await page.getByRole("button", { name: "Configurar rotina" }).click();

  await expect(page.getByText("Rotina configurada com sucesso")).toBeVisible();
  expect(sentInput).not.toBeNull();
  expect(sentInput!.sellerId).toBe("seller-1");
  expect(sentInput!.workDays).toEqual([1, 2, 3, 4, 5]);
  // Os pesos do score entram com o padrão: não há tela que os edite.
  expect(sentInput!.priorityWeights).toBeTruthy();
});

test("rotina: ajustar edita dentro do card e manda só o que mudou", async ({
  page,
}) => {
  let sentInput: Record<string, unknown> | null = null;

  await mockGraphql(page, {
    UserDetail: () =>
      userWithSeller({
        ...emptySeller,
        scheduleConfig: {
          id: "cfg-1",
          maxVisitsPerDay: 8,
          workDays: [1, 2, 3, 4, 5],
          workStartTime: "08:00:00",
          workEndTime: "18:00:00",
          avgVisitDurationMin: 30,
          isRescheduleSameWeek: true,
          maxRescheduleAttempts: 3,
        },
      }),
    SellerFactoryAccesses: () => ({ seller_accesses: emptyConnection() }),
    SellerClientLinks: () => ({ seller_clients: emptyConnection() }),
    UpdateScheduleConfig: (v) => {
      sentInput = (v.input ?? {}) as Record<string, unknown>;
      return {
        updateScheduleConfig: {
          status: true,
          message: "ok",
          data: {
            id: "cfg-1",
            maxVisitsPerDay: 8,
            workDays: [1, 2, 3, 4, 5, 6],
            workStartTime: "08:00:00",
            workEndTime: "18:00:00",
            avgVisitDurationMin: 30,
            isRescheduleSameWeek: true,
            maxRescheduleAttempts: 3,
            penaltyScorePerMiss: "1.0",
            priorityWeights: {},
          },
        },
      };
    },
  });

  await page.goto("/settings/users/u-1");

  // Leitura primeiro: o resumo mostra os dias, sem precisar abrir aba.
  await expect(page.getByText("Seg, Ter, Qua, Qui, Sex")).toBeVisible();

  await page.getByRole("button", { name: "Ajustar rotina" }).click();

  // Continua no card — a edição da rotina não sai daqui.
  await expect(page).toHaveURL(/\/settings\/users\/u-1$/);
  await page.getByRole("button", { name: "Sáb" }).click();
  await page.getByRole("button", { name: "Salvar rotina" }).click();

  await expect(page.getByText("Rotina atualizada com sucesso")).toBeVisible();
  // Só o dia acrescentado viaja; os pesos do score nunca são tocados aqui.
  expect(sentInput).toEqual({ workDays: [1, 2, 3, 4, 5, 6] });
});
