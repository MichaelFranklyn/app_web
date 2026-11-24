// Teto da chamada ao backend, abaixo do limite da função: sem ele a função
// morre pendurada e o navegador recebe um 500 genérico.
export const UPSTREAM_TIMEOUT_MS = 25_000;

// Importações (tabela de preço, pedidos, NF-e, histórico) processam centenas de
// linhas e passam de 25 s em produção — a da Ventisol (263 itens) levou 41 s.
// Com o teto curto o BFF devolvia 504 enquanto o backend terminava e gravava:
// o usuário via erro de algo que deu certo, e reimportar duplicava.
export const LONG_UPSTREAM_TIMEOUT_MS = 280_000;
const LONG_OPERATION = /Import|Nfe/;

export const upstreamTimeoutFor = (operationName?: string) =>
  operationName && LONG_OPERATION.test(operationName)
    ? LONG_UPSTREAM_TIMEOUT_MS
    : UPSTREAM_TIMEOUT_MS;
