import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { Plus, Trash } from "lucide-react";
import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Field } from "../Field";
import { FormSectionSchema } from "../interface";

interface RepeaterProps {
  section: FormSectionSchema;
}

export const Repeater = ({ section }: RepeaterProps) => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: section.name || "repeater",
  });

  return (
    <div className="flex flex-col gap-4">
      {fields.map((item, index) => (
        // Cada item é um card embutido (inset + Body sm), como as outras
        // caixas dentro de formulário — não uma div com borda à mão.
        <Card.Root key={item.id} inset>
          <Card.Body padding="sm">
            <div className="flex items-center justify-between gap-8">
              <Title variant="label" weight="bold">
                {section.title} {index + 1}
              </Title>
              <Button.Root
                type="button"
                appearance="ghost"
                color="red"
                size="sm"
                isIconOnly
                label={`Remover ${section.title ?? "item"} ${index + 1}`}
                onClick={() => remove(index)}
              >
                <Button.Icon icon={Trash} />
              </Button.Root>
            </div>

            <div className="grid grid-cols-12 gap-x-4 gap-y-6">
              {section.fields.map((field) => (
                <Field
                  key={`${item.id}.${field.name}`}
                  field={field}
                  namePrefix={`${section.name}.${index}`}
                />
              ))}
            </div>
          </Card.Body>
        </Card.Root>
      ))}

      <div className="mt-2 flex">
        <Button.Root
          onClick={() => append({})}
          color="amber"
          appearance="solid"
          size="sm"
          type="button"
        >
          <Button.Icon icon={Plus} />
          <Button.Title>
            {section.addLabel ?? "Adicionar Novo Item"}
          </Button.Title>
        </Button.Root>
      </div>
    </div>
  );
};

Repeater.displayName = "FormBuilder.Repeater";
