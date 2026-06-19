import { SelectOption } from "@/components/Input/InputSelect";
import React from "react";
import { ControllerRenderProps } from "react-hook-form";

export type FieldType =
  | "text"
  | "email"
  | "password"
  | "textarea"
  | "number"
  | "date"
  | "date-range"
  | "checkbox"
  | "radio"
  | "select-single"
  | "select-multi"
  | "switch"
  | "archive-single"
  | "archive-multi"
  | "cpf"
  | "cnpj"
  | "phone"
  | "cep"
  | "currency";

export interface GridConfig {
  mobile?: number; // 1-12
  tablet?: number; // 1-12
  desktop?: number; // 1-12
}

export interface FieldConfigBase {
  id?: string;
  name: string;
  type: FieldType;
  label?: React.ReactNode;
  /** Texto puro do label, usado nas mensagens de validação quando `label` é JSX. */
  labelText?: string;
  grid?: GridConfig;
  hint?: React.ReactNode;
  required?: boolean;
  disabled?: boolean | ((data: Record<string, unknown>) => boolean);
  placeholder?: string;
  addon?: React.ReactNode;
  onChange?: (
    value: unknown,
    setValue: (name: string, value: unknown) => void
  ) => void | Promise<void>;
}

export interface FieldConfigText extends FieldConfigBase {
  type: "text" | "email" | "password";
  minLength?: number;
  maxLength?: number;
}

export interface FieldConfigMasked extends FieldConfigBase {
  type: "cpf" | "cnpj" | "phone" | "cep" | "currency";
}

export interface FieldConfigTextarea extends FieldConfigBase {
  type: "textarea";
  rows?: number;
  minLength?: number;
  maxLength?: number;
}

export interface FieldConfigNumber extends FieldConfigBase {
  type: "number";
}

export interface FieldConfigDate extends FieldConfigBase {
  type: "date" | "date-range";
}

export interface FieldConfigSelect extends FieldConfigBase {
  type: "select-single" | "select-multi";
  options: { label: string; value: string; [key: string]: unknown }[];
  onCreateOption?: (option: string) => Promise<SelectOption | null> | void;
}

export interface FieldConfigCheckbox extends FieldConfigBase {
  type: "checkbox";
  options: { label: React.ReactNode; value: string }[];
}

export interface FieldConfigRadio extends FieldConfigBase {
  type: "radio";
  options: { label: React.ReactNode; value: string }[];
}

export interface FieldConfigSwitch extends FieldConfigBase {
  type: "switch";
  options: { label: React.ReactNode; value: string }[];
}

export interface FieldConfigArchive extends FieldConfigBase {
  type: "archive-single" | "archive-multi";
  maxFiles?: number;
  maxSizeMb?: number;
  accept?: string;
}

export type FormFieldSchema =
  | FieldConfigText
  | FieldConfigMasked
  | FieldConfigTextarea
  | FieldConfigNumber
  | FieldConfigDate
  | FieldConfigSelect
  | FieldConfigCheckbox
  | FieldConfigRadio
  | FieldConfigSwitch
  | FieldConfigArchive;

export interface FormSectionSchema {
  id: string;
  name?: string; // If this exists and isRepeatable is true, the section becomes an array of objects
  title?: string;
  description?: string;
  isRepeatable?: boolean;
  fields: FormFieldSchema[];
}

export interface FormStepSchema {
  id: string;
  title?: string;
  description?: string;
  sections: FormSectionSchema[];
}

export interface FormBuilderProps {
  steps: FormStepSchema[];
  onSubmit: (data: Record<string, unknown>) => void;
  initialData?: Record<string, unknown>;
  loading?: boolean;
  submitLabel?: string;
  nextLabel?: string;
  prevLabel?: string;
  unstyled?: boolean;
}

export interface RenderInputProps {
  field: FormFieldSchema;
  controllerField: ControllerRenderProps;
  error?: string;
  setValue: (name: string, value: unknown) => void;
}

export interface FormBuilderRef {
  submitForm: () => void;
  resetForm: () => void;
  nextStep: () => Promise<boolean>;
  prevStep: () => void;
  setValue: (name: string, value: unknown) => void;
  getValues: () => Record<string, unknown>;
  getStep: () => number;
}
