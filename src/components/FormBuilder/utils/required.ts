import { FormStepSchema } from "../interface";

/** Vazio do ponto de vista de "preencheu o obrigatório?". */
export function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (value instanceof Date) return Number.isNaN(value.getTime());
  if (typeof value === "object" && "value" in value) {
    return isEmptyValue((value as { value: unknown }).value);
  }
  return false;
}

/**
 * Todos os campos `required` (de seções não repetíveis) têm valor? É a mesma
 * régua do asterisco na tela — serve para a tela liberar o que vem depois do
 * formulário sem esperar o envio.
 */
export function requiredFieldsFilled(
  steps: FormStepSchema[],
  values: Record<string, unknown>
): boolean {
  return steps.every((step) =>
    step.sections.every(
      (section) =>
        section.isRepeatable ||
        section.fields.every(
          (field) => !field.required || !isEmptyValue(values[field.name])
        )
    )
  );
}
