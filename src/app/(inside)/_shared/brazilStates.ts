import { SelectOption } from "@/components/Input";

/**
 * As 27 UFs, em ordem alfabética, como opções de seletor.
 *
 * Lista FIXA, e não "os estados que aparecem na lista": as listas que a usam
 * paginam no servidor, então só daria para montar a lista a partir da página
 * aberta — e o seletor mudaria de conteúdo conforme a pessoa navega.
 *
 * Mora em `_shared` porque a carteira de clientes (`(operations)/clients`) e o
 * relatório de clientes (`dashboard/reports/clients`) filtram pela mesma coluna;
 * duas cópias da lista sairiam de sincronia no dia em que alguém adicionasse um
 * rótulo ("BA — Bahia") em uma delas.
 */
export const STATE_OPTIONS: SelectOption[] = [
  "AC",
  "AL",
  "AM",
  "AP",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MG",
  "MS",
  "MT",
  "PA",
  "PB",
  "PE",
  "PI",
  "PR",
  "RJ",
  "RN",
  "RO",
  "RR",
  "RS",
  "SC",
  "SE",
  "SP",
  "TO",
].map((uf) => ({ value: uf, label: uf }));
