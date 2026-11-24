"use client";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { QueryError } from "@/components/QueryError";
import { Title } from "@/components/Title";

import { PhotoReviewList } from "./PhotoReviewList";
import { UploadSummary } from "./UploadSummary";
import { useUploadPhotos } from "./useUploadPhotos";

interface Props {
  companyFactoryId: string;
  onChanged: () => void;
  /** Aberto pelo menu "Mais ações" da aba (não tem gatilho próprio). */
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Envio em massa das fotos do catálogo.
 *
 * O caminho pensado para quem tem trezentos produtos: a fábrica manda as fotos
 * nomeadas com o código, o usuário arrasta todas de uma vez e o sistema casa
 * cada uma com o produto. A tela de conferência existe para o que sobrou — e
 * cada sobra se resolve escolhendo o produto num select, sem renomear arquivo.
 */
export function UploadPhotosModal({
  companyFactoryId,
  onChanged,
  open,
  onOpenChange,
}: Props) {
  const upload = useUploadPhotos({
    open,
    companyFactoryId,
    onChanged,
    onClose: () => onOpenChange(false),
  });

  const handleOpenChange = (value: boolean) => {
    onOpenChange(value);
    if (!value) upload.reset();
  };

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Content size="2xl">
        <Modal.Header
          title="Enviar fotos dos produtos"
          description="Arraste várias fotos de uma vez. Cada arquivo nomeado com o código do produto (ex.: CP-M-001.jpg) é reconhecido sozinho."
        />

        <Modal.Body>
          <div className="flex flex-col gap-16">
            <Input.Archive
              variant="multi"
              value={[]}
              onChange={upload.addFiles}
              accept="image/png,image/jpeg,image/webp"
              maxSizeMb={20}
              disabled={upload.isLoading || !upload.hasProducts}
              hint="PNG, JPG ou WEBP. As fotos são reduzidas no seu navegador antes do envio."
            />

            {upload.productsError ? (
              /* Sem esta ponta, a falha na busca do catálogo saía como
                 "a fábrica não tem produtos" — e o usuário iria cadastrar
                 produto que já existe. */
              <QueryError
                flat
                onRetry={upload.reloadProducts}
                retrying={upload.productsLoading}
                title="Não foi possível carregar o catálogo"
                description="As fotos são anexadas aos produtos, e a lista deles não chegou. Tente novamente."
              />
            ) : (
              !upload.hasProducts &&
              !upload.productsLoading && (
                <Title variant="body-sm" color="muted">
                  Esta fábrica ainda não tem produtos cadastrados. Cadastre o
                  catálogo primeiro — as fotos são anexadas aos produtos.
                </Title>
              )
            )}

            <UploadSummary
              stats={upload.stats}
              sent={upload.sent}
              isLoading={upload.isLoading}
            />

            <PhotoReviewList
              photos={upload.photos}
              productOptions={upload.productOptions}
              productById={upload.productById}
              onAssign={upload.assignProduct}
              onRemove={upload.removePhoto}
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
              disabled={upload.isLoading}
            >
              <Button.Title>Cancelar</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            loading={upload.isLoading}
            disabled={upload.stats.matched === 0}
            onClick={upload.handleSubmit}
          >
            <Button.Title>
              {upload.stats.matched > 0
                ? `Salvar ${upload.stats.matched} foto(s)`
                : "Salvar fotos"}
            </Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
