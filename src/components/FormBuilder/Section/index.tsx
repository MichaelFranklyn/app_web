import { Title } from "@/components/Title";
import { Field } from "../Field";
import { Repeater } from "../Repeater";
import { FormSectionSchema } from "../interface";

interface SectionProps {
  section: FormSectionSchema;
}

export const Section = ({ section }: SectionProps) => {
  if (section.isRepeatable && section.name) {
    return (
      <div className="flex flex-col gap-12">
        {section.title && (
          <h3 className="mt-4 border-b border-(--border) pb-2 font-mono text-[15px] font-medium tracking-wider text-(--amber)">
            {section.title}
          </h3>
        )}
        {section.description && (
          <Title variant="body-sm" color="muted" className="mb-4">
            {section.description}
          </Title>
        )}
        <Repeater section={section} />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-12">
      {section.title && (
        <h3 className="mt-4 border-b border-(--border) pb-2 font-mono text-[15px] font-medium tracking-wider text-(--amber)">
          {section.title}
        </h3>
      )}

      {section.description && (
        <Title variant="body-sm" color="muted" className="mb-4">
          {section.description}
        </Title>
      )}

      {/* Tailwind handles responsive columns */}
      <div className="grid grid-cols-12 gap-x-4 gap-y-16">
        {section.fields.map((field) => (
          <Field key={field.name} field={field} />
        ))}
      </div>
    </div>
  );
};

Section.displayName = "FormBuilder.Section";
