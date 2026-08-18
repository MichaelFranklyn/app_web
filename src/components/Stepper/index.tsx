import { StepperIntro } from "./Intro";
import { StepperItem } from "./Item";
import { StepperRoot } from "./Root";
import { StepperTrail } from "./Trail";

export const Stepper = Object.assign(StepperRoot, {
  Root: StepperRoot,
  Item: StepperItem,
  Intro: StepperIntro,
  /** Só a faixa de marcos, para quem já controla o conteúdo dos passos. */
  Trail: StepperTrail,
});

export type { StepperTrailStep } from "./Trail/interface";
