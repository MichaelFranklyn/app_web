/**
 * Dados que os documentos legais precisam e que só existem fora do código.
 *
 * PENDENTE — enquanto `LEGAL_ENTITY` e `CONTACT_EMAIL` forem `null`, as páginas
 * omitem a linha de identificação e mandam o titular falar pelo canal de
 * suporte de dentro do sistema. Nada aqui é inventado de propósito: razão
 * social, CNPJ e endereço errados num termo de uso são pior do que ausentes,
 * porque parecem verdade. Preencha quando a empresa estiver constituída e o
 * e-mail de contato existir.
 *
 * Os dois textos ainda precisam de leitura de advogado antes de valerem como
 * contrato — o que está escrito descreve com honestidade o que o sistema faz,
 * mas descrição fiel não é o mesmo que redação jurídica.
 */
export const LEGAL_ENTITY: {
  name: string;
  document: string;
  address: string;
} | null = null;

/** Canal do titular de dados (LGPD, art. 18) e do cliente. */
export const CONTACT_EMAIL: string | null = null;

/** Vigência exibida no topo dos dois documentos. Data fixa, não `new Date()`:
 * o que vale é quando o texto mudou, não quando a página foi aberta. */
export const LEGAL_UPDATED_AT = "14 de agosto de 2026";

/** Nome comercial do serviço, usado no corpo dos dois textos. */
export const SERVICE_NAME = "Girus";

/** Uma seção de um documento legal: um título e os parágrafos abaixo dele. */
export interface LegalSection {
  heading: string;
  paragraphs: string[];
}
