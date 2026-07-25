import { describe, expect, it } from "vitest";
import { UserDetail } from "../interface";
import { buildPersonInitialData, normalizePersonData } from "./index";

const profile: UserDetail = {
  id: "u-1",
  name: "Maria Souza",
  email: "maria@empresa.com.br",
  role: "SELLER",
  isActive: true,
  phone: "(71) 99999-0000",
  cpf: "11144477735",
  birthDate: "1958-03-12",
  addressZip: "41820-000",
  addressStreet: "Rua das Acácias",
  addressNumber: "120",
  addressComplement: null,
  addressNeighborhood: "Pituba",
  addressCity: "Salvador",
  addressState: "BA",
  createdAt: "2026-01-01T00:00:00Z",
  company: null,
  seller: null,
};

describe("normalizePersonData", () => {
  it("não envia nada quando o form repete os dados atuais", () => {
    expect(
      normalizePersonData(buildPersonInitialData(profile), profile)
    ).toEqual({});
  });

  it("envia só o campo alterado", () => {
    const data = {
      ...buildPersonInitialData(profile),
      addressStreet: "Rua Nova",
    };

    expect(normalizePersonData(data, profile)).toEqual({
      addressStreet: "Rua Nova",
    });
  });

  it("manda string vazia para limpar um campo preenchido", () => {
    const data = { ...buildPersonInitialData(profile), addressComplement: "" };

    // Complemento já era vazio: nada a enviar.
    expect(
      normalizePersonData(data, profile).addressComplement
    ).toBeUndefined();

    const clearing = { ...buildPersonInitialData(profile), addressCity: "" };
    expect(normalizePersonData(clearing, profile)).toEqual({ addressCity: "" });
  });

  it("normaliza a data de nascimento para ISO antes de enviar", () => {
    const data = {
      ...buildPersonInitialData(profile),
      birthDate: "1958-04-20T00:00:00.000Z",
    };

    expect(normalizePersonData(data, profile).birthDate).toBe("1958-04-20");
  });

  it("sobe a UF para maiúsculas e ignora diferença só de caixa", () => {
    const same = { ...buildPersonInitialData(profile), addressState: "ba" };
    expect(normalizePersonData(same, profile).addressState).toBeUndefined();

    const changed = { ...buildPersonInitialData(profile), addressState: "sp" };
    expect(normalizePersonData(changed, profile).addressState).toBe("SP");
  });

  it("manda telefone e CEP só com dígitos", () => {
    const data = {
      ...buildPersonInitialData(profile),
      phone: "(71) 98888-1111",
      addressZip: "41.820-000",
    };

    // O CEP é o mesmo de antes, só com pontuação diferente: não vira update.
    const out = normalizePersonData(data, profile);
    expect(out.phone).toBe("71988881111");
    expect(out.addressZip).toBeUndefined();
  });

  it("manda o CPF só com dígitos e ignora a máscara", () => {
    // Mesmo CPF, escrito com máscara: nada a enviar.
    const masked = {
      ...buildPersonInitialData(profile),
      cpf: "111.444.777-35",
    };
    expect(normalizePersonData(masked, profile).cpf).toBeUndefined();

    const changed = {
      ...buildPersonInitialData(profile),
      cpf: "529.982.247-25",
    };
    expect(normalizePersonData(changed, profile).cpf).toBe("52998224725");
  });

  it("normaliza o e-mail e ignora diferença só de caixa", () => {
    const same = {
      ...buildPersonInitialData(profile),
      email: "MARIA@empresa.com.br",
    };
    expect(normalizePersonData(same, profile).email).toBeUndefined();
  });
});
