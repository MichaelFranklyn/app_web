/** Endereço da sondagem: público (fora do proxy), minúsculo e sempre presente. */
const URL_DE_SONDAGEM = "/manifest.webmanifest";

/** Quanto se espera antes de considerar que não respondeu. */
const TIMEOUT_MS = 4000;

/**
 * O servidor está respondendo?
 *
 * Existe porque `navigator.onLine` responde outra pergunta — "existe interface
 * de rede?" — e por isso diz `true` num wi-fi de loja sem saída ou com o
 * servidor fora do ar. Só uma requisição de verdade separa os casos.
 *
 * `cache: "no-store"` é o ponto todo da função: sem ele o navegador serve a
 * resposta guardada e a sondagem responde "voltou" sem ter tocado na rede.
 *
 * O timeout evita o pior caso do sinal ruim, que não é a conexão recusada — é a
 * que fica pendurada. Sem ele, a sondagem nunca resolve e a tela fica em
 * "checando" para sempre.
 */
export async function sondarServidor(): Promise<boolean> {
  const abortar = new AbortController();
  const timer = setTimeout(() => abortar.abort(), TIMEOUT_MS);
  try {
    const resposta = await fetch(URL_DE_SONDAGEM, {
      method: "HEAD",
      cache: "no-store",
      signal: abortar.signal,
    });
    return resposta.ok;
  } catch {
    // Rede recusada, DNS, abort do timeout: tudo é "não respondeu".
    return false;
  } finally {
    clearTimeout(timer);
  }
}
