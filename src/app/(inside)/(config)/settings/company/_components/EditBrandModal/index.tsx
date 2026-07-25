"use client";

import { Button } from "@/components/Button";
import { LogoUpload, useLogoUpload } from "@/components/LogoUpload";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { companyInitials } from "@/utils/company";
import { MyCompany } from "../../interface";
import { useSaveCompany } from "../../useSaveCompany";

interface Props {
  company: MyCompany;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function EditBrandModal({
  company,
  open,
  onOpenChange,
  onSaved,
}: Props) {
  const logo = useLogoUpload("logo");
  const avatar = useLogoUpload("avatar");
  const { toast } = useToast();
  const { save, isSaving } = useSaveCompany(company.id, () => {
    onOpenChange(false);
    onSaved();
  });

  const initials = companyInitials(company.nomeFantasia ?? company.razaoSocial);

  const handleSave = async () => {
    const input = {
      ...(await logo.toLogoInput()),
      ...(await avatar.toLogoInput()),
    };

    if (Object.keys(input).length === 0) {
      toast({
        variant: "info",
        title: "Nenhuma imagem nova",
        description: "Escolha uma logo ou um símbolo antes de salvar.",
      });
      return;
    }

    await save(input, () => {
      logo.reset();
      avatar.reset();
    });
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="md">
        <Modal.Header
          title="Trocar imagens da marca"
          description="A logo completa vai no PDF do pedido; o símbolo aparece no topo do sistema."
        />
        <Modal.Body>
          {/* Duas imagens porque os usos pedem formatos diferentes: a assinatura
              horizontal some espremida num círculo, e o símbolo sozinho não
              identifica a empresa no cabeçalho de um documento.

              Uma embaixo da outra: lado a lado, a logo horizontal fica estreita
              demais para se avaliar antes de salvar. */}
          <div className="flex flex-col gap-20">
            <LogoUpload
              currentUrl={company.logoUrl}
              value={logo.value}
              onChange={logo.onChange}
              initials={initials}
              disabled={isSaving}
              label="Logo completa"
              hint="Com o nome da empresa. Aparece no PDF do pedido. PNG, JPG, WEBP ou SVG até 2 MB."
            />
            <LogoUpload
              currentUrl={company.avatarUrl}
              value={avatar.value}
              onChange={avatar.onChange}
              initials={initials}
              disabled={isSaving}
              label="Símbolo"
              hint="Imagem quadrada, sem o nome. Aparece no topo do sistema. Sem ela, usamos a logo."
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
              noUppercase
              disabled={isSaving}
            >
              <Button.Title>Cancelar</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            noUppercase
            loading={isSaving}
            onClick={handleSave}
          >
            <Button.Title>Salvar imagens</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
