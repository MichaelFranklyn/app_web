/** Validade do link em português: "15 minutos", "1 hora", "3 dias". Espelha o
 * `validity_label` do backend, que escreve o mesmo prazo nos emails. */
export function validityLabel(minutes: number): string {
  const plural = (n: number, one: string, many: string) =>
    `${n} ${n === 1 ? one : many}`;
  if (minutes >= 1440 && minutes % 1440 === 0)
    return plural(minutes / 1440, "dia", "dias");
  if (minutes >= 60 && minutes % 60 === 0)
    return plural(minutes / 60, "hora", "horas");
  return plural(minutes, "minuto", "minutos");
}
