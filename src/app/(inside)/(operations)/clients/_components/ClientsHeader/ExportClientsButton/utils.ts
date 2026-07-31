import { formatDate } from "@/utils/format/date";
import { maskCNPJ } from "@/utils/format/masks";
import { Client } from "../../../interface";

export const EXPORT_HEADERS = [
  "Razão social",
  "Nome fantasia",
  "CNPJ",
  "Cidade",
  "UF",
  "Vendedores",
  "Última compra",
  "Última visita",
  "Score",
];

/**
 * Uma linha de planilha por cliente, nas mesmas colunas em que a tela os mostra.
 *
 * "Nome fantasia" sai vazio para quem não tem um: nem toda empresa registra
 * nome fantasia na Receita, e é de lá que o cadastro vem.
 */
export const buildExportRows = (clients: Client[]): string[][] =>
  clients.map((client) => [
    client.razaoSocial,
    client.nomeFantasia ?? "",
    maskCNPJ(client.cnpj),
    client.addressCity ?? "",
    client.addressState ?? "",
    (client.companyClient?.sellers ?? []).map((s) => s.name).join(", "),
    formatDate(client.companyClient?.lastOrderDate),
    formatDate(client.companyClient?.lastVisitDate),
    client.companyClient?.visitScoreTotal
      ? Number(client.companyClient.visitScoreTotal).toFixed(0)
      : "",
  ]);
