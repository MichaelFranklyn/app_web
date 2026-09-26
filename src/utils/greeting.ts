/** "bom dia" / "boa tarde" / "boa noite" pelo relógio de quem manda a mensagem. */
export const greetingFor = (hour: number): string =>
  hour < 12 ? "bom dia" : hour < 18 ? "boa tarde" : "boa noite";

/** Primeiro nome, para a mensagem soar como gente ("Rafael", não "Rafael Souza Lima"). */
export const firstName = (name: string | null | undefined): string | null =>
  name?.trim().split(/\s+/)[0] || null;
