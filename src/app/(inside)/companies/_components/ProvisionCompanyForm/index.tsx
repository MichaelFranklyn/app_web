"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { Building2 } from "lucide-react";
import { useRef } from "react";
import { FORM_STEPS } from "../../utils";

interface Props {
  onSubmit: (data: Record<string, unknown>) => void;
  isLoading: boolean;
}

/**
 * Formulário de provisionamento (empresa + primeiro responsável). Render puro;
 * o disparo da mutation vive no hook do container.
 */
export function ProvisionCompanyForm({ onSubmit, isLoading }: Props) {
  const formRef = useRef<FormBuilderRef>(null);

  return (
    <Card.Root className="max-w-[720px]">
      <Card.Body className="flex flex-col gap-20">
        <FormBuilder
          ref={formRef}
          steps={FORM_STEPS}
          onSubmit={onSubmit}
          loading={isLoading}
          unstyled
        />

        <div className="flex justify-end">
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            noUppercase
            loading={isLoading}
            onClick={() => formRef.current?.submitForm()}
          >
            <Button.Icon icon={Building2} />
            <Button.Title>Provisionar empresa</Button.Title>
          </Button.Root>
        </div>
      </Card.Body>
    </Card.Root>
  );
}
