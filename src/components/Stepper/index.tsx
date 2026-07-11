import { StepperIntro } from "./Intro";
import { StepperItem } from "./Item";
import { StepperRoot } from "./Root";

export const Stepper = Object.assign(StepperRoot, {
  Root: StepperRoot,
  Item: StepperItem,
  Intro: StepperIntro,
});
