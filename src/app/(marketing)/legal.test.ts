import { describe, expect, it } from "vitest";

import {
  CONTACT_EMAIL,
  LEGAL_ENTITY,
  LEGAL_UPDATED_AT,
  LegalSection,
  SERVICE_NAME,
} from "./legal";
import { PRIVACY_SECTIONS } from "./privacidade/utils";
import { TERMS_SECTIONS } from "./termos/utils";

/**
 * Os dois documentos legais não têm lógica — têm um CONTRATO, e é ele que estes
 * casos prendem.
 *
 * O risco aqui não é uma conta errada: é o texto afirmar o que não existe.
 * Razão social, CNPJ e e-mail inventados num termo de uso são piores do que
 * ausentes, porque parecem verdade — e é exatamente esse tipo de erro que entra
 * quando alguém preenche `legal.ts` pela metade ou esquece um marcador no meio
 * do texto.
 */
const DOCUMENTOS: [string, LegalSection[]][] = [
  ["termos de uso", TERMS_SECTIONS],
  ["política de privacidade", PRIVACY_SECTIONS],
];

const corpo = (sections: LegalSection[]) =>
  sections.flatMap((section) => section.paragraphs).join("\n");

describe.each(DOCUMENTOS)("%s", (_nome, sections) => {
  it("tem seções, e nenhuma delas fica sem título ou sem texto", () => {
    expect(sections.length).toBeGreaterThan(0);

    for (const section of sections) {
      expect(section.heading.trim()).not.toBe("");
      expect(section.paragraphs.length).toBeGreaterThan(0);
      for (const paragraph of section.paragraphs) {
        expect(paragraph.trim()).not.toBe("");
      }
    }
  });

  it("não sobrou marcador de rascunho no texto", () => {
    // Marcadores em CAIXA ALTA, sem o `i`: "todo o conteúdo" é português, não
    // um TODO esquecido.
    expect(corpo(sections)).not.toMatch(/\bTODO\b|\bFIXME\b|\bXXX\b/);
    expect(corpo(sections)).not.toMatch(/lorem ipsum|\{\{|\[preencher/i);
  });

  it("nenhuma interpolação escapou como undefined ou null", () => {
    // `${CONTACT_EMAIL}` num texto com o valor nulo sairia literalmente assim
    // na página — e o cliente leria "escreva para null".
    expect(corpo(sections)).not.toMatch(/\bundefined\b|\bnull\b/);
  });

  it("chama o serviço pelo nome comercial", () => {
    expect(corpo(sections)).toContain(SERVICE_NAME);
  });

  it("oferece um caminho de contato coerente com o que está configurado", () => {
    // Enquanto não há e-mail declarado, o texto manda falar pelo suporte de
    // dentro do sistema: mandar escrever para um endereço que ninguém lê seria
    // pior do que não oferecer canal.
    const texto = corpo(sections);

    if (CONTACT_EMAIL) {
      expect(texto).toContain(CONTACT_EMAIL);
    } else {
      expect(texto).toContain("canal de suporte informado dentro do sistema");
      expect(texto).not.toMatch(/pelo e-mail\s*$/m);
    }
  });

  it("não afirma identificação que não existe", () => {
    // Sem pessoa jurídica constituída, o documento não cita razão social,
    // CNPJ nem endereço — nada aqui é inventado de propósito.
    if (LEGAL_ENTITY) return;

    expect(corpo(sections)).not.toMatch(/CNPJ n[º°]|inscrita sob/i);
  });
});

describe("vigência", () => {
  it("é data fixa: vale quando o texto mudou, não quando a página abriu", () => {
    expect(LEGAL_UPDATED_AT).toMatch(/^\d{1,2} de \w+ de \d{4}$/);
  });
});

describe("termos de uso — o que eles precisam dizer", () => {
  const headings = TERMS_SECTIONS.map((section) => section.heading);

  it("descreve o que o produto realmente entrega", () => {
    // Promessa que o sistema não cumpre vira disputa depois.
    expect(headings).toEqual(
      expect.arrayContaining([
        "O que é o serviço",
        "Período de teste e planos",
        "Pagamento",
        "Encerramento",
        "Lei aplicável",
      ])
    );
  });

  it("afirma que o dado do cliente é do cliente, e que dá para levá-lo embora", () => {
    const texto = corpo(TERMS_SECTIONS);

    expect(headings).toContain("Seus dados são seus");
    expect(texto).toMatch(/XLSX|PDF/);
  });

  it("explica o teto de plano do jeito que o sistema se comporta", () => {
    // O sistema RECUSA o registro seguinte ao atingir o limite; ele não cobra
    // excedente. O texto tem de dizer isso, senão promete outra coisa.
    expect(corpo(TERMS_SECTIONS)).toContain("recusa a criação do registro");
  });
});

describe("política de privacidade — o que a LGPD espera", () => {
  const headings = PRIVACY_SECTIONS.map((section) => section.heading);
  const texto = corpo(PRIVACY_SECTIONS);

  it("separa quem responde pelos dados", () => {
    // Os dados dos CLIENTES da representação são da representação, não nossos:
    // é essa separação que define quem responde ao titular.
    expect(headings).toContain("Quem responde pelos dados");
    expect(texto).toMatch(/controlador/i);
    expect(texto).toMatch(/operador/i);
  });

  it("nomeia os subprocessadores em vez de falar em 'parceiros'", () => {
    // Descobrir depois que o endereço do cliente sai para um serviço de mapas
    // que ninguém mencionou é a pior conversa possível.
    expect(headings).toContain("Com quem os dados são compartilhados");
    for (const terceiro of [
      "Google Cloud",
      "Supabase",
      "Vercel",
      "Google Maps",
      "Nominatim",
    ]) {
      expect(texto, terceiro).toContain(terceiro);
    }
  });

  it("diz onde os dados ficam e admite a transferência internacional", () => {
    expect(headings).toContain("Onde os dados ficam");
    expect(texto).toContain("São Paulo");
    expect(texto).toMatch(/transferência internacional/i);
  });

  it("lista os direitos do titular e por onde exercê-los", () => {
    expect(headings).toContain("Seus direitos");
    expect(texto).toContain("canal de suporte informado dentro do sistema");
  });

  it("trata cookies, que é o que a própria página usa", () => {
    expect(headings).toContain("Cookies");
  });
});
