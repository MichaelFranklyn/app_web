import { maskCEP } from "@/utils/format/masks";

const WEEKDAY_LABEL: Record<number, string> = {
  1: "Seg",
  2: "Ter",
  3: "Qua",
  4: "Qui",
  5: "Sex",
  6: "Sáb",
  7: "Dom",
};

/** "Seg, Ter, Qua" — na ordem da semana, não na ordem em que foi salvo. */
export const formatWorkDays = (days: number[]): string =>
  [...days]
    .sort((a, b) => a - b)
    .map((day) => WEEKDAY_LABEL[day] ?? String(day))
    .join(", ");

/** "08:00" a partir de "08:00:00" (o backend devolve Time com segundos). */
export const formatTime = (value: string): string => value.slice(0, 5);

/**
 * Endereço numa linha, pulando o que estiver vazio. O CEP é guardado só com
 * dígitos, então sai mascarado — "41820-000" se lê, "41820000" não.
 */
export const formatAddressLine = (parts: {
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
}): string => {
  const street = [parts.street, parts.number].filter(Boolean).join(", ");
  const city = [parts.city, parts.state].filter(Boolean).join(" - ");
  const zip = parts.zip ? maskCEP(parts.zip) : null;
  return [street, parts.complement, parts.neighborhood, city, zip]
    .filter(Boolean)
    .join(" · ");
};
