import { Button } from "@/components/Button";
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
        <div
          key={item.id}
          className="relative flex flex-col gap-4 rounded-(--r-md) border border-(--border) bg-(--bg2) p-6"
        >
          <div className="flex items-center justify-between">
            <Title variant="label" weight="bold" className="tracking-normal">
              {section.title} {index + 1}
            </Title>
            <button
              type="button"
              onClick={() => remove(index)}
              className="cursor-pointer rounded-full bg-(--red-bg) p-2 text-(--red) transition-colors hover:bg-(--red) hover:text-white"
              title="Remover Item"
            >
              <Trash size={14} />
            </button>
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
        </div>
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
          <Button.Title>Adicionar Novo Item</Button.Title>
        </Button.Root>
      </div>
    </div>
  );
};

Repeater.displayName = "FormBuilder.Repeater";
