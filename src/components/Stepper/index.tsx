import { StepperIntro } from "./Intro";
import { StepperItem } from "./Item";
import { StepperRoot } from "./Root";
import { StepperStep } from "./Step";

export const Stepper = Object.assign(StepperRoot, {
  Root: StepperRoot,
  Item: StepperItem,
  Step: StepperStep,
  Intro: StepperIntro,
});
