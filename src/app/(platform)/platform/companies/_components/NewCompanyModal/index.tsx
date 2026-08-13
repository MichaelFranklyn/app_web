"use client";

import { Button } from "@/components/Button";
import { FormBuilderRef } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { Building2 } from "lucide-react";
import { useRef } from "react";
import { FirstAccessResult } from "./FirstAccessResult";
import { ProvisionCompanyForm } from "./ProvisionCompanyForm";
import { useProvisionCompany } from "./useProvisionCompany";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Recarrega a lista quando uma empresa nasce. */
  onCreated: () => void;
}

/**
 * Provisionar empresa, em duas telas dentro da mesma janela: o formulário e,
 * depois, o link de primeiro acesso.
 *
 * Era uma rota (`/platform/companies/new`) e virou modal porque criar empresa
 * é uma ação sobre a lista, não um lugar: ao terminar, o SU quer ver a empresa
 * nova aparecer entre as outras — e não numa página separada de onde precisa
 * voltar.
 *
 * A segunda tela não é decoração: sem serviço de e-mail, o link de primeiro
 * acesso só existe naquela resposta. Fechar antes de copiá-lo obriga a emitir
 * outro pela ficha da empresa.
 */
export function NewCompanyModal({ open, onOpenChange, onCreated }: Props) {
  const formRef = useRef<FormBuilderRef>(null);
  const { submit, reset, result, isLoading } = useProvisionCompany();

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      // Fechar descarta o resultado: reabrir tem de começar no formulário, e
      // não no link da empresa anterior.
      reset();
      if (result) onCreated();
    }
    onOpenChange(next);
  };

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Content size="lg">
        <Modal.Header
          title={result ? "Empresa provisionada" : "Nova empresa"}
          description={
            result
              ? undefined
              : "Cadastre a empresa e o primeiro responsável para liberar o acesso."
          }
        />

        <Modal.Body>
          {result ? (
            <FirstAccessResult data={result} />
          ) : (
            <ProvisionCompanyForm
              formRef={formRef}
              onSubmit={submit}
              isLoading={isLoading}
            />
          )}
        </Modal.Body>

        <Modal.Footer>
          {result ? (
            <>
              <Button.Root
                type="button"
                appearance="ghost"
                onClick={() => handleOpenChange(false)}
              >
                <Button.Title>Fechar</Button.Title>
              </Button.Root>
              <Button.Root
                type="button"
                appearance="solid"
                color="amber"
                noUppercase
                onClick={() => {
                  // A lista atualiza agora: a empresa recém-criada precisa
                  // estar lá quando esta janela fechar de vez.
                  onCreated();
                  reset();
                }}
              >
                <Button.Icon icon={Building2} />
                <Button.Title>Provisionar outra</Button.Title>
              </Button.Root>
            </>
          ) : (
            <>
              <Modal.Close asChild>
                <Button.Root
                  type="button"
                  appearance="ghost"
                  disabled={isLoading}
                >
                  <Button.Title>Cancelar</Button.Title>
                </Button.Root>
              </Modal.Close>
              <Button.Root
                type="button"
                appearance="solid"
                color="amber"
                noUppercase
                loading={isLoading}
                onClick={() => formRef.current?.submitForm()}
              >
                <Button.Icon icon={Building2} />
                <Button.Title>Provisionar empresa</Button.Title>
              </Button.Root>
            </>
          )}
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
