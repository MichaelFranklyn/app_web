import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { Download } from "lucide-react";

interface TemplateDownloadProps {
  title?: string;
  description?: string;
  /** O que o botão faz: a planilha pode vir já preenchida com os dados. */
  buttonLabel?: string;
  onDownload: () => void;
}

/** A oferta do modelo de planilha, no topo de todo modal de importação. */
export function TemplateDownload({
  title = "Não tem o modelo?",
  description = "Baixe a planilha de exemplo, preencha e envie de volta.",
  buttonLabel = "Baixar modelo",
  onDownload,
}: TemplateDownloadProps) {
  return (
    <Card.Root inset>
      <Card.Body padding="sm" className="flex-row items-center justify-between">
        <div className="flex flex-col gap-2">
          <Title variant="body-sm" weight="medium">
            {title}
          </Title>
          <Title variant="body-xs" color="muted">
            {description}
          </Title>
        </div>
        <Button.Root
          type="button"
          appearance="ghost"
          color="neutral"
          size="sm"
          onClick={onDownload}
        >
          <Button.Icon icon={Download} />
          <Button.Title>{buttonLabel}</Button.Title>
        </Button.Root>
      </Card.Body>
    </Card.Root>
  );
}
