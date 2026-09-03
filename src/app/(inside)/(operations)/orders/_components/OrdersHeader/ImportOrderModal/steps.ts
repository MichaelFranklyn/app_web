import type { StepperTrailStep } from "@/components/Stepper";

import {
  FILE_STEPS,
  SHEET_STEPS,
} from "../../../../_components/OrderImportWizard/steps";

import type { ImportMode } from "./utils";

/**
 * A trilha de cada caminho, do começo ao fim.
 *
 * Ela atravessa dois componentes: os primeiros passos acontecem neste modal
 * (escolher o caminho, dizer de quem é o pedido) e o resto dentro do
 * `OrderImportWizard`. Por isso a lista mora aqui, num lugar só — o modal
 * desenha a faixa enquanto está nos passos dele, e passa os já cumpridos ao
 * wizard, que continua a MESMA faixa. Duas listas separadas viravam duas
 * contagens diferentes na tela.
 *
 * A ficha do sistema é curta porque ela responde sozinha o que os outros
 * passos perguntariam: não há coluna a mapear (o arquivo é nosso) nem revisão
 * (os códigos vêm do catálogo que a própria ficha carrega).
 */
export const TRAIL: Record<ImportMode, readonly string[]> = {
  sheet: ["Escolha", ...SHEET_STEPS],
  file: ["Escolha", "Informações", ...FILE_STEPS],
};

/**
 * Quantos passos o modal cumpre antes de entregar a tela ao wizard.
 *
 * Com a ficha é só a escolha: o próprio "Arquivo" já é do wizard, porque subir
 * e conferir o que a planilha diz são a mesma etapa. Com outro arquivo o modal
 * ainda pergunta de quem é o pedido, e só então o wizard assume.
 */
const LEADING: Record<ImportMode, number> = { sheet: 1, file: 2 };

/** Os passos já cumpridos quando o wizard assume a tela. */
export const leadingSteps = (mode: ImportMode): readonly string[] =>
  TRAIL[mode].slice(0, LEADING[mode]);

/** A faixa como o `Stepper.Trail` a consome. */
export const trailSteps = (mode: ImportMode | null): StepperTrailStep[] =>
  (mode ? TRAIL[mode] : TRAIL.sheet).map((label) => ({ label }));

/**
 * Onde a pessoa está enquanto o modal manda.
 *
 * A escolha não entra na conta: enquanto ela não é feita não se sabe nem
 * quantos passos o caminho tem, e uma faixa que muda de tamanho embaixo do
 * olho confunde mais do que orienta. A faixa só aparece com o caminho
 * escolhido — e aí já começa no passo 2.
 */
export const modalStep = (mode: ImportMode | null): number => (mode ? 1 : 0);
