import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";

/**
 * Lote 2 — detalhe do cliente (clients/[id]/overview, client-side).
 * Render exige mockar 3 queries: Client (header/cards), SellerClientFactoriesByClient
 * e ClientContacts (ambas podem vir vazias). Edit/Delete ficam no header; notas,
 * contatos e endereço nos cards. Vários botões "Editar" → escopo por header (1º),
 * aria-label (contatos) ou XPath relativo ao título do card (notas/endereço).
 */
const URL = "/clients/client-1/overview";

const clientData = () => ({
  id: "client-1",
  cnpj: "11222333000181",
  razaoSocial: "Cliente Detalhe LTDA",
  nomeFantasia: "Cliente Detalhe",
  cnae: "4744-0/99",
  cnaeDescription: "Comércio varejista",
  addressStreet: "Rua A",
  addressNumber: "100",
  addressComplement: null,
  addressNeighborhood: "Centro",
  addressZip: "01000-000",
  addressCity: "São Paulo",
  addressState: "SP",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
  companyClient: { id: "cc-1", notes: null, isActive: true },
});

// Queries que a página de detalhe dispara ao montar.
const renderMock = (contacts: Array<Record<string, unknown>> = []) => ({
  Client: () => ({
    client: { status: true, code: 200, message: "ok", data: clientData() },
  }),
  SellerClientFactoriesByClient: () => ({
    sellerClientFactoryList: { edges: [], totalCount: 0 },
  }),
  ClientContacts: () => ({
    clientContacts: {
      edges: contacts.map((node) => ({ node })),
      totalCount: contacts.length,
    },
  }),
});

const seedContact = () => ({
  id: "ct-1",
  name: "Contato Velho",
  role: "Comprador",
  phone: "11999990000",
  email: "contato@empresa.com",
  isPrimary: true,
  isActive: true,
});

test("cliente detalhe: edita a situação na carteira", async ({ page }) => {
  await mockGraphql(page, {
    ...renderMock(),
    UpdateCompanyClient: (v) => ({
      updateCompanyClient: {
        status: true,
        message: "ok",
        data: {
          id: "cc-1",
          isActive: (v.input as { isActive: boolean }).isActive,
        },
      },
    }),
  });

  await page.goto(URL);

  await page.getByRole("button", { name: "Editar" }).first().click(); // header
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Editar cliente")).toBeVisible();

  await dialog.getByText("Cliente ativo").click(); // alterna o switch
  await dialog.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Cliente atualizado com sucesso")).toBeVisible();
});

test("cliente detalhe: remove o cliente da carteira", async ({ page }) => {
  await mockGraphql(page, {
    ...renderMock(),
    Clients: () => ({ clients_list: emptyConnection() }),
    DeleteCompanyClient: () => ({
      deleteCompanyClient: { status: true, message: "ok" },
    }),
  });

  await page.goto(URL);

  await page.getByRole("button", { name: "Remover" }).click(); // header (único)
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Remover" })
    .click();

  await expect(page).toHaveURL(/\/clients$/);
});

test("cliente detalhe: adiciona um contato", async ({ page }) => {
  const contacts: Array<Record<string, unknown>> = [];
  await mockGraphql(page, {
    ...renderMock(contacts),
    CreateClientContact: (v) => {
      const i = (v.input ?? {}) as Record<string, unknown>;
      const node = {
        id: `ct-${contacts.length + 1}`,
        name: i.name,
        role: i.role ?? null,
        phone: i.phone ?? null,
        email: i.email ?? null,
        isPrimary: !!i.isPrimary,
        isActive: true,
      };
      contacts.push(node);
      return {
        createClientContact: { status: true, message: "ok", data: node },
      };
    },
  });

  await page.goto(URL);

  await page.getByRole("button", { name: "Adicionar" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.locator('input[name="name"]').fill("Contato E2E");
  await dialog.getByRole("button", { name: "Adicionar" }).click();

  await expect(page.getByText("Contato adicionado")).toBeVisible();
});

test("cliente detalhe: edita um contato", async ({ page }) => {
  const contacts = [seedContact()];
  await mockGraphql(page, {
    ...renderMock(contacts),
    UpdateClientContact: (v) => {
      const c = contacts.find((x) => x.id === v.id);
      if (c) Object.assign(c, v.input);
      return {
        updateClientContact: {
          status: true,
          message: "ok",
          data: { id: v.id, ...(v.input as object) },
        },
      };
    },
  });

  await page.goto(URL);

  await page.getByRole("button", { name: "Editar contato" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.locator('input[name="name"]').fill("Contato Novo");
  await dialog.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Contato atualizado")).toBeVisible();
});

test("cliente detalhe: remove um contato", async ({ page }) => {
  const contacts = [seedContact()];
  await mockGraphql(page, {
    ...renderMock(contacts),
    DeleteClientContact: (v) => {
      const i = contacts.findIndex((x) => x.id === v.id);
      if (i >= 0) contacts.splice(i, 1);
      return { deleteClientContact: { status: true, message: "ok" } };
    },
  });

  await page.goto(URL);

  await page.getByRole("button", { name: "Remover contato" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Remover" })
    .click();

  await expect(page.getByText("Contato removido")).toBeVisible();
});

test("cliente detalhe: edita as notas privadas", async ({ page }) => {
  await mockGraphql(page, {
    ...renderMock(),
    UpdateClientNotes: (v) => ({
      updateClientNotes: {
        status: true,
        code: 200,
        message: "ok",
        data: {
          id: "cc-1",
          notes: (v.input as { notes: string }).notes,
          updatedAt: "2026-06-22T00:00:00Z",
        },
      },
    }),
  });

  await page.goto(URL);

  // "Editar" da NotesCard: primeiro botão com esse texto após o título do card.
  await page
    .getByText("Notas Privadas")
    .locator('xpath=following::button[normalize-space()="Editar"][1]')
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.locator('[name="notes"]').fill("Observação interna E2E");
  await dialog.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Notas atualizadas com sucesso")).toBeVisible();
});

test("cliente detalhe: edita o endereço", async ({ page }) => {
  await mockGraphql(page, {
    ...renderMock(),
    UpdateClientAddress: (v) => ({
      updateClientAddress: {
        status: true,
        message: "ok",
        data: { id: "client-1", ...(v.input as object) },
      },
    }),
  });

  await page.goto(URL);

  await page
    .getByText("Endereço", { exact: true })
    .locator('xpath=following::button[normalize-space()="Editar"][1]')
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.locator('input[name="addressStreet"]').fill("Av. Nova");
  await dialog.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Endereço atualizado com sucesso")).toBeVisible();
});
