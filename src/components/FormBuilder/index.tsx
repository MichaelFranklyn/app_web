import { Field } from "./Field";
import { Navigation } from "./Navigation";
import { Repeater } from "./Repeater";
import { Root } from "./Root";
import { Section } from "./Section";
import { Stepper } from "./Stepper";

export const FormBuilder = Object.assign(Root, {
  Root,
  Stepper,
  Section,
  Field,
  Repeater,
  Navigation,
});

export * from "./interface";
