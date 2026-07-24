/**
 * Validação de CNPJ pelos dígitos verificadores.
 *
 * Espelha `app_user/app/core/domain/cnpj.py`: o backend é a autoridade, mas sem
 * a checagem aqui o número errado só é rejeitado depois de uma ida ao servidor
 * — e o erro aparece como toast, longe do campo que precisa ser corrigido.
 */

const FIRST_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const SECOND_WEIGHTS = [6, ...FIRST_WEIGHTS];

/** Mantém só os dígitos (o campo chega mascarado: 00.000.000/0000-00). */
export const onlyDigits = (value?: string | null): string =>
  (value ?? "").replace(/\D/g, "");

const checkDigit = (base: string, weights: number[]): string => {
  const total = base
    .split("")
    .reduce((sum, digit, i) => sum + Number(digit) * weights[i], 0);
  const remainder = total % 11;
  return remainder < 2 ? "0" : String(11 - remainder);
};

/**
 * `true` quando há 14 dígitos e os dois verificadores conferem. Números
 * repetidos (00000000000000, 11111111111111…) passam na conta, mas nenhum é um
 * CNPJ real — por isso são rejeitados explicitamente.
 */
export const isValidCnpj = (value?: string | null): boolean => {
  const digits = onlyDigits(value);
  if (digits.length !== 14) return false;
  if (digits === digits[0].repeat(14)) return false;
  return (
    digits[12] === checkDigit(digits.slice(0, 12), FIRST_WEIGHTS) &&
    digits[13] === checkDigit(digits.slice(0, 13), SECOND_WEIGHTS)
  );
};
