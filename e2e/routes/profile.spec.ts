import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";

/**
 * "Meu perfil" mora em /settings/user/<sub do token> (e2e-user no FAKE_JWT), e
 * /profile é só o atalho. A tela mostra os MESMOS cards que o gestor vê em
 * /settings/users/[id] — a diferença é o botão "Editar" no cabeçalho de cada card, que
 * abre um modal.
 */
const userDetailData = () => ({
  user_detail: {
    status: true,
    message: "ok",
    data: {
      id: "e2e-user",
      name: "Vendedor Teste",
      email: "vt@empresa.com.br",
      role: "SELLER",
      isActive: true,
      phone: "71999990000",
      cpf: "11144477735",
      birthDate: "1962-08-14",
      addressZip: "41820000",
      addressStreet: "Rua das Acácias",
      addressNumber: "120",
      addressComplement: null,
      addressNeighborhood: "Pituba",
      addressCity: "Salvador",
      addressState: "BA",
      createdAt: "2025-01-01T00:00:00Z",
      company: {
        id: "c-1",
        nomeFantasia: "Empresa Teste",
        razaoSocial: "Empresa Teste LTDA",
      },
      seller: null,
    },
  },
});

test("profile: /profile abre o perfil do próprio usuário", async ({ page }) => {
  await mockGraphql(page, { UserDetail: () => userDetailData() });

  await page.goto("/profile");

  await expect(page).toHaveURL(/\/settings\/user\/e2e-user$/);
  // O header é o nome da pessoa: o eyebrow "Configurações · Meu perfil" saiu de
  // todas as telas junto com o resto dos eyebrows.
  await expect(
    page.getByRole("heading", { name: "Vendedor Teste", level: 1 })
  ).toBeVisible();
  // Os dados chegam como card, não como formulário aberto.
  await expect(page.getByText("Rua das Acácias")).toBeVisible();
});

test("profile: edita dados pessoais pelo modal do card", async ({ page }) => {
  let sentInput: Record<string, unknown> | null = null;

  await mockGraphql(page, {
    UserDetail: () => userDetailData(),
    UpdateMyProfile: (v) => {
      sentInput = (v.input ?? {}) as Record<string, unknown>;
      return {
        updateMyProfile: {
          status: true,
          code: 200,
          message: "ok",
          data: {
            ...userDetailData().user_detail.data,
            ...(v.input as object),
          },
        },
      };
    },
  });

  await page.goto("/profile");

  await page.getByRole("button", { name: "Editar dados pessoais" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  // Passo 1: quem é.
  await expect(dialog.getByText("Passo 1 de 2")).toBeVisible();
  await dialog.locator('input[name="name"]').fill("Vendedor Renomeado");
  await dialog.getByRole("button", { name: "Continuar" }).click();

  // Passo 2: onde mora.
  await expect(dialog.getByText("Passo 2 de 2")).toBeVisible();
  await dialog.locator('input[name="addressCity"]').fill("Lauro de Freitas");
  await dialog.getByRole("button", { name: "Salvar alterações" }).click();

  await expect(page.getByText("Perfil atualizado com sucesso")).toBeVisible();
  // Só o que mudou viaja — o resto do form não deve virar update.
  expect(sentInput).toEqual({
    name: "Vendedor Renomeado",
    addressCity: "Lauro de Freitas",
  });
});

test("profile: o vendedor edita a PRÓPRIA atuação em campo", async ({
  page,
}) => {
  let sentInput: Record<string, unknown> | null = null;
  const base = userDetailData();

  await mockGraphql(page, {
    UserDetail: () => ({
      user_detail: {
        ...base.user_detail,
        data: {
          ...base.user_detail.data,
          // O perfil de vendedor guarda só a atuação em campo: CPF, contato e
          // endereço são da pessoa e já estão em `data` acima.
          seller: {
            id: "seller-1",
            name: "Vendedor Teste",
            region: "Bahia",
            isActive: true,
            factoryCount: 1,
            clientCount: 2,
            totalRevenue: "0",
            lastOrderDate: null,
            scheduleConfig: null,
          },
        },
      },
    }),
    SellerFactoryAccesses: () => ({ seller_accesses: emptyConnection() }),
    SellerClientLinks: () => ({ seller_clients: emptyConnection() }),
    UpdateSellerFromProfile: (v) => {
      sentInput = (v.input ?? {}) as Record<string, unknown>;
      return { updateSeller: { status: true, message: "ok" } };
    },
  });

  await page.goto("/profile");

  // O card é o mesmo que o gestor vê — e o botão de editar existe para o dono.
  await page.getByRole("button", { name: "Editar atuação" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.locator('input[name="region"]').fill("Nordeste");
  await dialog.getByRole("button", { name: "Salvar alterações" }).click();

  await expect(page.getByText("Atuação em campo atualizada")).toBeVisible();
  expect(sentInput).toEqual({ region: "Nordeste" });
});

test("profile: o CPF fica no card de dados pessoais, do usuário", async ({
  page,
}) => {
  await mockGraphql(page, { UserDetail: () => userDetailData() });

  await page.goto("/profile");

  // 111.444.777-35 mascarado a partir dos dígitos que vieram em `user.cpf`.
  await expect(page.getByText("111.444.777-35")).toBeVisible();
});

test("profile: altera a senha pelo modal do card", async ({ page }) => {
  await mockGraphql(page, {
    UserDetail: () => userDetailData(),
    UpdateMyPassword: () => ({
      updateMyPassword: { status: true, code: 200, message: "ok" },
    }),
  });

  await page.goto("/profile");

  await page.getByRole("button", { name: "Alterar senha" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  await dialog.locator('input[name="currentPassword"]').fill("SenhaAtual1!");
  await dialog.locator('input[name="newPassword"]').fill("SenhaNova1!");
  await dialog.locator('input[name="confirmPassword"]').fill("SenhaNova1!");
  await dialog.getByRole("button", { name: "Atualizar senha" }).click();

  await expect(page.getByText("Senha atualizada com sucesso")).toBeVisible();
});
